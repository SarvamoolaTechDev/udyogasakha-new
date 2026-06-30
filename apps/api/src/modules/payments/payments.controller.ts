import { Controller, Post, Get, Body, Req, Headers, Query, UseGuards, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { CreateOrderDto, VerifyPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { UserRole, PaymentStatus } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay order. Checkout will show every payment method enabled on the account — UPI, cards, netbanking, wallets, EMI, pay later, international cards.' })
  createOrder(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.svc.createOrder(userId, dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify the signature Razorpay Checkout returns after a successful payment' })
  verify(@CurrentUser('id') userId: string, @Body() dto: VerifyPaymentDto) {
    return this.svc.verifyPayment(userId, dto);
  }

  /**
   * Razorpay calls this directly — no JWT, no CSRF token, nothing a normal
   * browser request would have. Authenticity is established entirely via
   * the HMAC signature in the x-razorpay-signature header, verified against
   * the raw request body inside PaymentsService.handleWebhookEvent().
   *
   * req.rawBody is populated by Nest because main.ts enables
   * `{ rawBody: true }` on NestFactory.create() — required since the HMAC
   * is computed over the exact raw bytes, not the JSON-parsed object.
   */
  @Post('webhook')
  @SkipThrottle() // Razorpay may retry rapidly on transient failures — never rate-limit this
  @ApiExcludeEndpoint() // not part of the public-facing API surface
  handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('x-razorpay-signature') signature: string) {
    return this.svc.handleWebhookEvent(req.rawBody as Buffer, signature);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'My payment history' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMine(@CurrentUser('id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getMine(userId, page, limit);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] All payments, paginated, optionally filtered by status' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  getAll(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.svc.getAllForAdmin(page, limit, status);
  }
}
