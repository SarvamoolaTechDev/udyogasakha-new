import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES, NOTIFICATION_JOBS } from '../../common/queues';

@Processor(QUEUES.NOTIFICATIONS)
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Write the in-app notification row to the database.
   * Runs asynchronously — the HTTP response has already been sent.
   */
  @Process(NOTIFICATION_JOBS.SEND_IN_APP)
  async handleInApp(job: Job<{ userId: string; subject: string; body: string; link: string | null }>) {
    const { userId, subject, body, link } = job.data;

    try {
      await this.prisma.notification.create({
        data: { userId, subject, body, link: link ?? undefined },
      });
      this.logger.debug(`In-app notification created for user ${userId}: "${subject}"`);
    } catch (err) {
      this.logger.error(`Failed to create in-app notification for ${userId}`, err);
      // Re-throw so Bull marks the job as failed and retries
      throw err;
    }
  }

  /**
   * Email stub — logs to console.
   * Replace the logger.log() call with your SMTP/SES client when ready.
   */
  @Process(NOTIFICATION_JOBS.SEND_EMAIL)
  async handleEmail(job: Job<{ to: string; subject: string; body: string }>) {
    const { to, subject, body } = job.data;
    // TODO: replace with nodemailer / AWS SES / SendGrid call
    this.logger.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
  }

  /**
   * SMS stub — logs to console.
   * Replace the logger.log() call with your MSG91 / Twilio client when ready.
   */
  @Process(NOTIFICATION_JOBS.SEND_SMS)
  async handleSms(job: Job<{ to: string; body: string }>) {
    const { to, body } = job.data;
    // TODO: replace with MSG91 / Twilio client call
    this.logger.log(`[SMS STUB] To: ${to} | Body: ${body}`);
  }
}
