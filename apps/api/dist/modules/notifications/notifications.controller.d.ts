import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getAll(userId: string, unread?: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        id: string;
        userId: string;
        subject: string;
        body: string;
        read: boolean;
        link: string | null;
        createdAt: Date;
    }>>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAllRead(userId: string): Promise<{
        count: number;
    }>;
    markRead(id: string, userId: string): Promise<void>;
}
