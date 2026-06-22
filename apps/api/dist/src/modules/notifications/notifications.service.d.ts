import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export interface SendNotificationDto {
    userId: string;
    subject: string;
    body: string;
    link?: string;
    email?: string;
    phone?: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly queue;
    private readonly logger;
    constructor(prisma: PrismaService, queue: Queue);
    /**
     * Enqueue an in-app notification (and optionally email/SMS stubs).
     * The actual DB write happens in the processor so it doesn't block
     * the calling request.
     */
    send(dto: SendNotificationDto): Promise<void>;
    getForUser(userId: string, unreadOnly: boolean, rawPage?: string, rawLimit?: string): unknown;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markRead(notificationId: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<{
        count: number;
    }>;
}
