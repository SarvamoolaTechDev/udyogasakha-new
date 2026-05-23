import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePage, paginate } from '../../common/pagination';
import { QUEUES, NOTIFICATION_JOBS } from '../../common/queues';

export interface SendNotificationDto {
  userId:   string;
  subject:  string;
  body:     string;
  link?:    string;
  email?:   string;   // recipient email — passed through to email job
  phone?:   string;   // recipient phone — passed through to SMS job
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUES.NOTIFICATIONS) private readonly queue: Queue,
  ) {}

  /**
   * Enqueue an in-app notification (and optionally email/SMS stubs).
   * The actual DB write happens in the processor so it doesn't block
   * the calling request.
   */
  async send(dto: SendNotificationDto): Promise<void> {
    // In-app notification — written to DB by the processor
    await this.queue.add(NOTIFICATION_JOBS.SEND_IN_APP, {
      userId:  dto.userId,
      subject: dto.subject,
      body:    dto.body,
      link:    dto.link ?? null,
    });

    // Email stub — dispatched separately so a failed email never
    // prevents the in-app notification from being delivered
    if (dto.email) {
      await this.queue.add(NOTIFICATION_JOBS.SEND_EMAIL, {
        to:      dto.email,
        subject: dto.subject,
        body:    dto.body,
      });
    }

    // SMS stub
    if (dto.phone) {
      await this.queue.add(NOTIFICATION_JOBS.SEND_SMS, {
        to:   dto.phone,
        body: dto.body,
      });
    }
  }

  // ── Read endpoints ──────────────────────────────────────────────────────

  async getForUser(userId: string, unreadOnly: boolean, rawPage?: string, rawLimit?: string) {
    const p     = parsePage(rawPage, rawLimit);
    const where = unreadOnly ? { userId, read: false } : { userId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: p.skip,
        take: p.limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginate(data, total, p);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({ where: { userId, read: false } });
    return { count };
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    // Silently ignore if the notification doesn't belong to this user
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data:  { read: true },
    });
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data:  { read: true },
    });
    return { count: result.count };
  }
}
