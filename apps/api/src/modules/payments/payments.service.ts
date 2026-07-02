import { Injectable, Logger, BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentPurpose, PaymentStatus, PaymentMethod } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

// Currencies Razorpay commonly supports for international acceptance.
// INR always works; these require "International Payments" to be enabled
// on the Razorpay account (a one-time activation with Razorpay support,
// involving additional KYC) before they'll actually process — see
// createOrder() for the runtime check.
const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];

/**
 * Maps Razorpay's payment.method field (from webhook payloads) to our
 * PaymentMethod enum. Razorpay's raw values: card, upi, netbanking, wallet,
 * emi, paylater. International cards arrive as method="card" too — we
 * distinguish using the `international` flag on the payment entity itself.
 */
function mapRazorpayMethod(rpMethod: string | undefined, international: boolean): PaymentMethod {
  if (!rpMethod) return PaymentMethod.OTHER;
  if (rpMethod === 'card') return international ? PaymentMethod.INTERNATIONAL_CARD : PaymentMethod.CARD;
  switch (rpMethod) {
    case 'upi':        return PaymentMethod.UPI;
    case 'netbanking':  return PaymentMethod.NETBANKING;
    case 'wallet':      return PaymentMethod.WALLET;
    case 'emi':         return PaymentMethod.EMI;
    case 'paylater':    return PaymentMethod.PAYLATER;
    default:             return PaymentMethod.OTHER;
  }
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpay: Razorpay | null;

  constructor(
    private readonly prisma:  PrismaService,
    private readonly config:  AppConfigService,
    private readonly audit:   AuditService,
    private readonly notify:  NotificationsService,
  ) {
    if (config.razorpayConfigured) {
      this.razorpay = new Razorpay({
        key_id:     config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
      });
    } else {
      this.razorpay = null;
      this.logger.warn(
        'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — payment endpoints will reject ' +
        'requests with 503 until configured.',
      );
    }
  }

  private requireRazorpay(): Razorpay {
    if (!this.razorpay) {
      throw new ServiceUnavailableException('Payments are not configured on this server yet.');
    }
    return this.razorpay;
  }

  /**
   * Creates a Razorpay order and a pending local Payment record.
   *
   * Method selection (UPI, cards, netbanking, wallets, EMI, pay later) is
   * NOT decided here — Razorpay's Checkout reads the merchant account's
   * enabled methods and displays all of them to the payer automatically.
   * This endpoint only needs to know the amount, currency and what the
   * payment is for.
   */
  async createOrder(userId: string, dto: { purpose: PaymentPurpose; referenceId?: string; amount: number; currency?: string }) {
    const razorpay = this.requireRazorpay();
    const currency = (dto.currency ?? 'INR').toUpperCase();

    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      throw new BadRequestException(
        `Currency ${currency} is not supported. Supported: ${SUPPORTED_CURRENCIES.join(', ')}.`,
      );
    }

    const international = currency !== 'INR';
    if (international) {
      // We can't verify International Payments is actually enabled on the
      // Razorpay account from the API key alone — Razorpay will reject the
      // order creation call itself if it isn't. We log clearly so a 4xx
      // here is easy to diagnose rather than looking like a generic bug.
      this.logger.log(
        `Creating an international order in ${currency}. If this fails, confirm "International ` +
        `Payments" is activated for this Razorpay account (Settings → Payment Methods → International Cards).`,
      );
    }

    const amountPaise = Math.round(dto.amount * 100); // Razorpay always works in the smallest currency unit

    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency,
      receipt:  `udyoga_${Date.now()}`,
      notes: {
        userId,
        purpose: dto.purpose,
        referenceId: dto.referenceId ?? '',
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        purpose:              dto.purpose,
        referenceId:          dto.referenceId,
        amountPaise,
        currency,
        razorpayOrderId:      order.id,
        status:               PaymentStatus.CREATED,
        internationalPayment: international,
      },
    });

    await this.audit.log({
      entityType: 'payment', entityId: payment.id, action: 'ORDER_CREATED', actorId: userId,
      newState: { amountPaise, currency, purpose: dto.purpose },
    });

    return {
      paymentId:    payment.id,
      orderId:      order.id,
      amount:       amountPaise,
      currency,
      // Returned so the frontend never needs its own copy of the publishable key
      razorpayKeyId: this.config.razorpayKeyId,
    };
  }

  /**
   * Verifies the checkout-side signature Razorpay returns to the frontend
   * after a successful payment. This is the standard Razorpay Standard
   * Checkout flow's client-confirmation step — the webhook (handled
   * separately below) is the authoritative source of truth and acts as a
   * safety net in case this verify call never reaches us (e.g. user closes
   * the tab right after paying).
   */
  async verifyPayment(userId: string, dto: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const payment = await this.prisma.payment.findUnique({ where: { razorpayOrderId: dto.razorpay_order_id } });
    if (!payment || payment.userId !== userId) throw new NotFoundException('Payment not found');

    const expectedSignature = crypto
      .createHmac('sha256', this.config.razorpayKeySecret)
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      await this.audit.log({
        entityType: 'payment', entityId: payment.id, action: 'SIGNATURE_MISMATCH', actorId: userId,
      });
      throw new BadRequestException('Payment signature verification failed.');
    }

    const updated = await this.markCaptured(payment.id, dto.razorpay_payment_id, undefined, undefined);
    return { message: 'Payment verified successfully.', payment: updated };
  }

  /**
   * Marks a payment captured and applies its side effect (e.g. featuring a
   * listing). Called from both verifyPayment() (client-side confirmation)
   * and the webhook handler (server-side confirmation) — idempotent, since
   * both may fire for the same payment.
   */
  private async markCaptured(paymentId: string, razorpayPaymentId: string, method?: PaymentMethod, rawPayload?: any) {
    const payment = await this.prisma.payment.findUnique({
      where:   { id: paymentId },
      include: { user: { select: { email: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.CAPTURED) return payment; // idempotent — already processed

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status:            PaymentStatus.CAPTURED,
        razorpayPaymentId,
        method:             method ?? mapRazorpayMethod(rawPayload?.method, payment.internationalPayment),
        metadata:           rawPayload ?? undefined,
      },
    });

    await this.applyPurposeSideEffect(updated);

    await this.audit.log({
      entityType: 'payment', entityId: paymentId, action: 'CAPTURED', actorId: payment.userId,
      newState: { status: 'CAPTURED', method: updated.method },
    });

    await this.notify.send({
      userId:  payment.userId,
      subject: 'Payment received ✅',
      body:    `Your payment of ${(payment.amountPaise / 100).toFixed(2)} ${payment.currency} was successful. Thank you for using Sarvamoola Udyoga Sakha!`,
      link:    '/settings',
      email:   (payment as any).user?.email,
    });

    return updated;
  }

  /** Applies whatever the payment was actually for, once captured. */
  private async applyPurposeSideEffect(payment: { purpose: PaymentPurpose; referenceId: string | null }) {
    if (payment.purpose === PaymentPurpose.LISTING_FEATURE && payment.referenceId) {
      await this.prisma.jobListing.update({
        where: { id: payment.referenceId },
        data: {
          featured:      true,
          featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    }
    // CERTIFICATION_FEE / REGISTRATION_FEE: no automated side effect yet —
    // these are placeholders until the corresponding product flows (trust
    // levels, registration gating) are designed. See Phase 2 notes.
  }

  private async markFailed(razorpayOrderId: string, reason: string, rawPayload?: any) {
    const payment = await this.prisma.payment.findUnique({
      where:   { razorpayOrderId },
      include: { user: { select: { email: true } } },
    });
    if (!payment) return;
    if (payment.status === PaymentStatus.CAPTURED) return; // never downgrade a captured payment

    await this.prisma.payment.update({
      where: { id: payment.id },
      data:  { status: PaymentStatus.FAILED, failureReason: reason, metadata: rawPayload ?? undefined },
    });

    await this.audit.log({
      entityType: 'payment', entityId: payment.id, action: 'FAILED', actorId: payment.userId,
      metadata: { reason },
    });

    await this.notify.send({
      userId:  payment.userId,
      subject: 'Payment unsuccessful',
      body:    `Your payment of ${(payment.amountPaise / 100).toFixed(2)} ${payment.currency} could not be completed.\n\nReason: ${reason}\n\nPlease try again or contact support if the issue persists.`,
      link:    '/settings',
      email:   (payment as any).user?.email,
    });
  }

  /**
   * Handles Razorpay webhook events. This is the authoritative source of
   * truth for payment state — Razorpay sends these server-to-server
   * regardless of whether the payer's browser tab is still open, so it
   * catches cases the client-side verifyPayment() call might miss.
   *
   * Signature is verified over the RAW request body — see
   * PaymentsController.handleWebhook() for how the raw bytes are obtained.
   */
  async handleWebhookEvent(rawBody: Buffer, signatureHeader: string | undefined) {
    if (!signatureHeader) throw new BadRequestException('Missing webhook signature header.');

    const expected = crypto
      .createHmac('sha256', this.config.razorpayWebhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signatureHeader) {
      this.logger.warn('Razorpay webhook signature mismatch — possible spoofed request, rejecting.');
      throw new BadRequestException('Invalid webhook signature.');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const eventType = event.event as string;

    this.logger.debug(`Razorpay webhook received: ${eventType}`);

    switch (eventType) {
      case 'payment.captured': {
        const p = event.payload.payment.entity;
        const payment = await this.prisma.payment.findUnique({ where: { razorpayOrderId: p.order_id } });
        if (payment) {
          await this.markCaptured(payment.id, p.id, mapRazorpayMethod(p.method, payment.internationalPayment), p);
        }
        break;
      }
      case 'payment.failed': {
        const p = event.payload.payment.entity;
        await this.markFailed(p.order_id, p.error_description ?? 'Payment failed', p);
        break;
      }
      case 'refund.processed': {
        const r = event.payload.refund.entity;
        const payment = await this.prisma.payment.findFirst({ where: { razorpayPaymentId: r.payment_id } });
        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data:  { status: PaymentStatus.REFUNDED, refundedPaise: r.amount },
          });
          await this.audit.log({ entityType: 'payment', entityId: payment.id, action: 'REFUNDED', metadata: { amountPaise: r.amount } });
        }
        break;
      }
      default:
        // Unhandled event types (order.paid, etc.) are safe to ignore —
        // payment.captured / payment.failed cover everything we act on.
        break;
    }

    return { received: true };
  }

  async getMine(userId: string, rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const where = { userId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      this.prisma.payment.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  async getAllForAdmin(rawPage?: string, rawLimit?: string, status?: PaymentStatus) {
    const p = parsePage(rawPage, rawLimit);
    const where = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: p.skip, take: p.limit,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return paginate(data, total, p);
  }
}
