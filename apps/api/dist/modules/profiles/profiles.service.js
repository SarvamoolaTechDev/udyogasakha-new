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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/pagination");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
/**
 * Derives the three-bucket market field from the candidate's own segment selection.
 * This is deterministic — no moderator input required.
 *
 * IT_FIELD     : IT_DEVELOPERS | IT_DESIGNERS | IT_PRODUCT_OWNERS | IT_DATA_AI
 * NON_IT_FIELD : NON_IT_ARTS_MEDIA | NON_IT_COMMERCE | NON_IT_EDUCATION |
 *                NON_IT_SPIRITUAL | NON_IT_MANAGEMENT | NON_IT_HEALTHCARE | NON_IT_ENGINEERING
 * SERVICES     : SERVICES_CONSULTANCY | SERVICES_TRAINING | SERVICES_RECRUITMENT | SERVICES_VENDOR
 */
function deriveMarketField(segment) {
    if (segment.startsWith('IT_'))
        return client_1.MarketField.IT_FIELD;
    if (segment.startsWith('SERVICES_'))
        return client_1.MarketField.SERVICES;
    return client_1.MarketField.NON_IT_FIELD;
}
let ProfilesService = class ProfilesService {
    constructor(prisma, audit, notify) {
        this.prisma = prisma;
        this.audit = audit;
        this.notify = notify;
    }
    async upsert(userId, dto) {
        const existing = await this.prisma.candidateProfile.findUnique({
            where: { userId_roleType: { userId, roleType: dto.roleType } },
        });
        const skills = Array.isArray(dto.skills)
            ? dto.skills
            : (dto.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
        // Derive market field from the candidate's own segment selection — no moderator needed
        const marketField = deriveMarketField(dto.marketSegment);
        const data = {
            ...dto, userId, skills,
            marketField, // set on submission, not on approval
            status: client_1.ProfileStatus.PENDING, submittedAt: new Date(),
            reviewedAt: null, reviewedById: null, rejectionReason: null,
        };
        const profile = existing
            ? await this.prisma.candidateProfile.update({ where: { id: existing.id }, data, include: { experiences: { orderBy: { displayOrder: 'asc' } } } })
            : await this.prisma.candidateProfile.create({ data, include: { experiences: { orderBy: { displayOrder: 'asc' } } } });
        await this.audit.log({
            entityType: 'profile',
            entityId: profile.id,
            action: existing ? 'UPDATED' : 'CREATED',
            actorId: userId,
            newState: { roleType: profile.roleType, status: profile.status, appliedFor: profile.appliedFor },
        });
        return profile;
    }
    async getMyProfiles(userId) {
        return this.prisma.candidateProfile.findMany({
            where: { userId },
            include: { experiences: { orderBy: { displayOrder: 'asc' } } },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async getMyByRole(userId, roleType) {
        const p = await this.prisma.candidateProfile.findUnique({
            where: { userId_roleType: { userId, roleType: roleType } },
            include: { experiences: { orderBy: { displayOrder: 'asc' } }, documents: true },
        });
        if (!p)
            throw new common_1.NotFoundException('Profile not found');
        return p;
    }
    async addExperience(userId, roleType, dto) {
        const p = await this.prisma.candidateProfile.findUnique({
            where: { userId_roleType: { userId, roleType: roleType } },
        });
        if (!p)
            throw new common_1.NotFoundException('Profile not found');
        return this.prisma.experienceEntry.create({
            data: {
                profileId: p.id, title: dto.title, company: dto.company,
                fromDate: dto.fromDate, toDate: dto.toDate,
                description: dto.description, displayOrder: dto.displayOrder ?? 0,
            },
        });
    }
    async deleteExperience(userId, entryId) {
        const e = await this.prisma.experienceEntry.findUnique({ where: { id: entryId }, include: { profile: true } });
        if (!e || e.profile.userId !== userId)
            throw new common_1.NotFoundException();
        return this.prisma.experienceEntry.delete({ where: { id: entryId } });
    }
    // ── Moderator list endpoints — paginated ──────────────────────────────────
    async getPending(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.candidateProfile.findMany({
                where: { status: client_1.ProfileStatus.PENDING },
                include: { user: { select: { email: true, name: true } }, documents: true },
                orderBy: { submittedAt: 'asc' }, skip: p.skip, take: p.limit,
            }),
            this.prisma.candidateProfile.count({ where: { status: client_1.ProfileStatus.PENDING } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async getApproved(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.candidateProfile.findMany({
                where: { status: client_1.ProfileStatus.APPROVED },
                include: { user: { select: { email: true, name: true } } },
                orderBy: { reviewedAt: 'desc' }, skip: p.skip, take: p.limit,
            }),
            this.prisma.candidateProfile.count({ where: { status: client_1.ProfileStatus.APPROVED } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async getRejected(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.candidateProfile.findMany({
                where: { status: client_1.ProfileStatus.REJECTED },
                include: { user: { select: { email: true, name: true } } },
                orderBy: { reviewedAt: 'desc' }, skip: p.skip, take: p.limit,
            }),
            this.prisma.candidateProfile.count({ where: { status: client_1.ProfileStatus.REJECTED } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    // ── Moderator state changes — audit + notify ──────────────────────────────
    async approve(id, modId) {
        const before = await this.prisma.candidateProfile.findUnique({
            where: { id },
            include: { user: { select: { email: true, name: true } } },
        });
        if (!before)
            throw new common_1.NotFoundException('Profile not found');
        // marketField is already set from the candidate's own submission — just flip status
        const after = await this.prisma.candidateProfile.update({
            where: { id },
            data: { status: client_1.ProfileStatus.APPROVED, reviewedById: modId, reviewedAt: new Date() },
        });
        // Upgrade trust level to L1 on first profile approval (stub — full engine deferred)
        await this.prisma.trustRecord.upsert({
            where: { userId: before.userId },
            update: { currentLevel: 'L1', lastUpdated: new Date() },
            create: { userId: before.userId, currentLevel: 'L1' },
        });
        await this.audit.log({
            entityType: 'profile', entityId: id, action: 'APPROVED', actorId: modId,
            oldState: { status: before.status, marketField: before.marketField },
            newState: { status: after.status, marketField: after.marketField, reviewedAt: after.reviewedAt },
        });
        await this.notify.send({
            userId: before.userId,
            subject: 'Your profile has been approved! 🎉',
            body: `Your ${before.roleType.replace(/_/g, ' ')} profile has been reviewed and approved. It is now live on the portal.`,
            link: `/profile/${before.roleType}`,
            email: before.user?.email,
        });
        return after;
    }
    async reject(id, modId, reason) {
        const before = await this.prisma.candidateProfile.findUnique({
            where: { id },
            include: { user: { select: { email: true, name: true } } },
        });
        if (!before)
            throw new common_1.NotFoundException('Profile not found');
        const after = await this.prisma.candidateProfile.update({
            where: { id },
            data: { status: client_1.ProfileStatus.REJECTED, rejectionReason: reason, reviewedById: modId, reviewedAt: new Date() },
        });
        await this.audit.log({
            entityType: 'profile', entityId: id, action: 'REJECTED', actorId: modId,
            oldState: { status: before.status },
            newState: { status: after.status },
            metadata: { reason },
        });
        // Notify the profile owner with the reason
        await this.notify.send({
            userId: before.userId,
            subject: 'Profile review update',
            body: `Your ${before.roleType.replace(/_/g, ' ')} profile could not be approved. Reason: ${reason}. Please update your profile and resubmit.`,
            link: `/profile/${before.roleType}`,
            email: before.user?.email,
        });
        return after;
    }
    async reactivate(id) {
        const before = await this.prisma.candidateProfile.findUnique({ where: { id } });
        if (!before)
            throw new common_1.NotFoundException('Profile not found');
        const after = await this.prisma.candidateProfile.update({
            where: { id },
            data: { status: client_1.ProfileStatus.PENDING, reviewedAt: null, reviewedById: null },
        });
        await this.audit.log({
            entityType: 'profile', entityId: id, action: 'REACTIVATED',
            oldState: { status: before.status }, newState: { status: after.status },
        });
        return after;
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map