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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationModule = exports.VerificationController = exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_guards_1 = require("../../common/guards/auth.guards");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/pagination");
class RequestVerificationDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ type: [String], description: 'IDs of user_documents to include in this request' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], RequestVerificationDto.prototype, "documentIds", void 0);
class ReviewVerificationDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Documents verified successfully' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReviewVerificationDto.prototype, "reviewNote", void 0);
let VerificationService = class VerificationService {
    constructor(prisma, audit, notify) {
        this.prisma = prisma;
        this.audit = audit;
        this.notify = notify;
    }
    async requestVerification(userId, dto) {
        // Only one pending request allowed per user at a time
        const existing = await this.prisma.verificationRequest.findFirst({
            where: { userId, status: client_1.VerificationStatus.PENDING },
        });
        if (existing)
            throw new common_1.ConflictException('You already have a pending verification request.');
        const req = await this.prisma.verificationRequest.create({
            data: { userId, documentIds: dto.documentIds },
        });
        await this.audit.log({ entityType: 'verification', entityId: req.id, action: 'REQUESTED', actorId: userId });
        return req;
    }
    async getMyRequests(userId) {
        return this.prisma.verificationRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    async getPending(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.verificationRequest.findMany({
                where: { status: client_1.VerificationStatus.PENDING },
                include: { user: { select: { email: true, name: true } } },
                orderBy: { createdAt: 'asc' },
                skip: p.skip, take: p.limit,
            }),
            this.prisma.verificationRequest.count({ where: { status: client_1.VerificationStatus.PENDING } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async approve(id, modId, dto) {
        const req = await this.prisma.verificationRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Verification request not found');
        const [updated] = await this.prisma.$transaction([
            this.prisma.verificationRequest.update({
                where: { id },
                data: { status: client_1.VerificationStatus.APPROVED, reviewNote: dto.reviewNote, reviewerId: modId, reviewedAt: new Date() },
            }),
            // Mark each document as verified
            ...req.documentIds.map(docId => this.prisma.userDocument.updateMany({ where: { id: docId }, data: { verifiedAt: new Date(), verifierId: modId } })),
            // Upgrade trust to L1
            this.prisma.trustRecord.upsert({
                where: { userId: req.userId },
                update: { currentLevel: 'L1', lastUpdated: new Date() },
                create: { userId: req.userId, currentLevel: 'L1' },
            }),
        ]);
        await this.audit.log({ entityType: 'verification', entityId: id, action: 'APPROVED', actorId: modId, metadata: { note: dto.reviewNote } });
        await this.notify.send({ userId: req.userId, subject: 'Identity verification approved ✅', body: 'Your identity documents have been verified. Your trust level has been updated to L1.', link: '/settings' });
        return updated;
    }
    async reject(id, modId, dto) {
        const req = await this.prisma.verificationRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Verification request not found');
        const updated = await this.prisma.verificationRequest.update({
            where: { id },
            data: { status: client_1.VerificationStatus.REJECTED, reviewNote: dto.reviewNote, reviewerId: modId, reviewedAt: new Date() },
        });
        await this.audit.log({ entityType: 'verification', entityId: id, action: 'REJECTED', actorId: modId, metadata: { note: dto.reviewNote } });
        await this.notify.send({ userId: req.userId, subject: 'Verification request update', body: `Your verification request could not be approved. Reason: ${dto.reviewNote}. Please re-upload your documents and try again.`, link: '/settings' });
        return updated;
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], VerificationService);
let VerificationController = class VerificationController {
    constructor(svc) {
        this.svc = svc;
    }
    request(userId, dto) {
        return this.svc.requestVerification(userId, dto);
    }
    getMy(userId) {
        return this.svc.getMyRequests(userId);
    }
    getPending(page, limit) {
        return this.svc.getPending(page, limit);
    }
    approve(id, modId, dto) {
        return this.svc.approve(id, modId, dto);
    }
    reject(id, modId, dto) {
        return this.svc.reject(id, modId, dto);
    }
};
exports.VerificationController = VerificationController;
__decorate([
    (0, common_1.Post)('request'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a document verification request (L1)' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RequestVerificationDto]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "request", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my verification request history' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "getMy", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Paginated pending verification requests' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "getPending", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Approve verification request — marks docs verified, upgrades to L1' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ReviewVerificationDto]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Reject verification request with note' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ReviewVerificationDto]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "reject", null);
exports.VerificationController = VerificationController = __decorate([
    (0, swagger_1.ApiTags)('Verification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('verification'),
    __metadata("design:paramtypes", [VerificationService])
], VerificationController);
let VerificationModule = class VerificationModule {
};
exports.VerificationModule = VerificationModule;
exports.VerificationModule = VerificationModule = __decorate([
    (0, common_1.Module)({ controllers: [VerificationController], providers: [VerificationService] })
], VerificationModule);
//# sourceMappingURL=verification.module.js.map