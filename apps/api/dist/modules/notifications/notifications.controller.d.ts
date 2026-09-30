import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getAll(userId: string, unread?: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
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
    markAllRead(userId: string): Promise<{
        count: number;
    }>;
    markRead(id: string, userId: string): Promise<void>;
}
