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
var NotificationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queues_1 = require("../../common/queues");
let NotificationsProcessor = NotificationsProcessor_1 = class NotificationsProcessor {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsProcessor_1.name);
    }
    /**
     * Write the in-app notification row to the database.
     * Runs asynchronously — the HTTP response has already been sent.
     */
    async handleInApp(job) {
        const { userId, subject, body, link } = job.data;
        try {
            await this.prisma.notification.create({
                data: { userId, subject, body, link: link ?? undefined },
            });
            this.logger.debug(`In-app notification created for user ${userId}: "${subject}"`);
        }
        catch (err) {
            this.logger.error(`Failed to create in-app notification for ${userId}`, err);
            // Re-throw so Bull marks the job as failed and retries
            throw err;
        }
    }
    /**
     * Email stub — logs to console.
     * Replace the logger.log() call with your SMTP/SES client when ready.
     */
    async handleEmail(job) {
        const { to, subject, body } = job.data;
        // TODO: replace with nodemailer / AWS SES / SendGrid call
        this.logger.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    }
    /**
     * SMS stub — logs to console.
     * Replace the logger.log() call with your MSG91 / Twilio client when ready.
     */
    async handleSms(job) {
        const { to, body } = job.data;
        // TODO: replace with MSG91 / Twilio client call
        this.logger.log(`[SMS STUB] To: ${to} | Body: ${body}`);
    }
};
exports.NotificationsProcessor = NotificationsProcessor;
__decorate([
    (0, bull_1.Process)(queues_1.NOTIFICATION_JOBS.SEND_IN_APP),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleInApp", null);
__decorate([
    (0, bull_1.Process)(queues_1.NOTIFICATION_JOBS.SEND_EMAIL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleEmail", null);
__decorate([
    (0, bull_1.Process)(queues_1.NOTIFICATION_JOBS.SEND_SMS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSms", null);
exports.NotificationsProcessor = NotificationsProcessor = NotificationsProcessor_1 = __decorate([
    (0, bull_1.Processor)(queues_1.QUEUES.NOTIFICATIONS),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map