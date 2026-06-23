"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/pagination");
const queues_1 = require("../../common/queues");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    /**
     * Enqueue an in-app notification (and optionally email/SMS stubs).
     * The actual DB write happens in the processor so it doesn't block
     * the calling request.
     */
    async send(dto) {
        // In-app notification — written to DB by the processor
        await this.queue.add(queues_1.NOTIFICATION_JOBS.SEND_IN_APP, {
            userId: dto.userId,
            subject: dto.subject,
            body: dto.body,
            link: dto.link ?? null,
        });
        // Email stub — dispatched separately so a failed email never
        // prevents the in-app notification from being delivered
        if (dto.email) {
            await this.queue.add(queues_1.NOTIFICATION_JOBS.SEND_EMAIL, {
                to: dto.email,
                subject: dto.subject,
                body: dto.body,
            });
        }
        // SMS stub
        if (dto.phone) {
            await this.queue.add(queues_1.NOTIFICATION_JOBS.SEND_SMS, {
                to: dto.phone,
                body: dto.body,
            });
        }
    }
    // ── Read endpoints ──────────────────────────────────────────────────────
    async getForUser(userId, unreadOnly, rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
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
        return (0, pagination_1.paginate)(data, total, p);
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({ where: { userId, read: false } });
        return { count };
    }
    async markRead(notificationId, userId) {
        // Silently ignore if the notification doesn't belong to this user
        await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { read: true },
        });
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return { count: result.count };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)(queues_1.QUEUES.NOTIFICATIONS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map