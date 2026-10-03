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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/pagination");
const audit_service_1 = require("../audit/audit.service");
const email_service_1 = require("../../common/email/email.service");
const storage_interface_1 = require("../../common/storage/storage.interface");
const search_service_1 = require("../search/search.service");
const bcrypt = require("bcrypt");
const SAFE_SELECT = {
    id: true, email: true, name: true, phone: true,
    city: true, roles: true, createdAt: true, updatedAt: true,
};
let UsersService = class UsersService {
    constructor(prisma, audit, email, search, storage) {
        this.prisma = prisma;
        this.audit = audit;
        this.email = email;
        this.search = search;
        this.storage = storage;
    }
    async getMe(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateMe(id, dto) {
        const before = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        const after = await this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });
        await this.audit.log({
            entityType: 'user', entityId: id, action: 'PROFILE_UPDATED', actorId: id,
            oldState: { name: before?.name, phone: before?.phone, city: before?.city },
            newState: { name: after.name, phone: after.phone, city: after.city },
        });
        return after;
    }
    async findAll(search, rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ],
        } : {};
        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({ where, select: SAFE_SELECT, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { ...SAFE_SELECT, profiles: { select: { roleType: true, status: true, submittedAt: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    /**
     * Shared cleanup for both self-delete and admin-delete: removes blob-stored
     * documents and search-index entries before the DB cascade runs. Payments
     * are intentionally left untouched (userId becomes null — see schema).
     */
    async cleanupBeforeDelete(userId) {
        const [candidateDocs, userDocs, approvedProfiles] = await Promise.all([
            this.prisma.candidateDocument.findMany({
                where: { profile: { userId } },
                select: { storageKey: true },
            }),
            this.prisma.userDocument.findMany({
                where: { userId },
                select: { storageKey: true },
            }),
            this.prisma.candidateProfile.findMany({
                where: { userId, status: 'APPROVED' },
                select: { id: true },
            }),
        ]);
        for (const doc of [...candidateDocs, ...userDocs]) {
            await this.storage.delete(doc.storageKey).catch(() => { });
        }
        for (const p of approvedProfiles) {
            await this.search.removeProfile(p.id).catch(() => { });
        }
    }
    /**
     * Self-service account deletion. Requires password confirmation.
     * Sends a farewell email, cleans up blobs/search index, then hard-deletes
     * the user row — cascading to every related table except Payment (SetNull).
     */
    async deleteMe(userId, password) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new common_1.BadRequestException('Incorrect password');
        await this.cleanupBeforeDelete(userId);
        await this.email.sendAccountDeletedEmail(user.email, user.name);
        await this.audit.log({
            entityType: 'user', entityId: userId, action: 'ACCOUNT_SELF_DELETED', actorId: userId,
            actorEmail: user.email, oldState: { email: user.email, name: user.name },
        });
        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Account deleted' };
    }
    /**
     * Admin-initiated account deletion. ADMIN role only (enforced at controller).
     * Confirmation (typing the target's email) is enforced client-side; the
     * server trusts the admin's role for this action.
     */
    async deleteByAdmin(targetUserId, adminId) {
        const [user, admin] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: targetUserId } }),
            this.prisma.user.findUnique({ where: { id: adminId }, select: { email: true } }),
        ]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.cleanupBeforeDelete(targetUserId);
        await this.email.sendAccountDeletedEmail(user.email, user.name);
        // Audit log written BEFORE delete — the row won't exist afterward
        await this.audit.log({
            entityType: 'user', entityId: targetUserId, action: 'ACCOUNT_DELETED_BY_ADMIN',
            actorId: adminId, actorEmail: admin?.email,
            oldState: { email: user.email, name: user.name, phone: user.phone },
        });
        await this.prisma.user.delete({ where: { id: targetUserId } });
        return { message: 'Account deleted' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(storage_interface_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        email_service_1.EmailService,
        search_service_1.SearchService, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map