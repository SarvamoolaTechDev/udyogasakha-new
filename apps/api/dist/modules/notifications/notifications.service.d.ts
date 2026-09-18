import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
export interface SendNotificationDto {
    userId: string;
    subject: string;
    body: string;
    link?: string;
    linkLabel?: string;
    email?: string;
    phone?: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly queue;
    private readonly email;
    private readonly logger;
    constructor(prisma: PrismaService, queue: Queue | null, email: EmailService);
    /**
     * Enqueue an in-app notification (and optionally email/SMS stubs).
     * The actual DB write happens in the processor so it doesn't block
     * the calling request.
     */
    send(dto: SendNotificationDto): Promise<void>;
    getForUser(userId: string, unreadOnly: boolean, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        link: string | null;
        subject: string;
        body: string;
        id: string;
        userId: string;
        read: boolean;
        createdAt: Date;
    }>>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markRead(notificationId: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<{
        count: number;
    }>;
}
