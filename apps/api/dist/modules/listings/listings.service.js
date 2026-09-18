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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/pagination");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const search_service_1 = require("../search/search.service");
let ListingsService = class ListingsService {
    constructor(prisma, audit, notify, search) {
        this.prisma = prisma;
        this.audit = audit;
        this.notify = notify;
        this.search = search;
    }
    async create(dto, userId) {
        const listing = await this.prisma.jobListing.create({
            data: {
                ...dto,
                skills: Array.isArray(dto.skills) ? dto.skills : (dto.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
                facilities: Array.isArray(dto.facilities) ? dto.facilities : (dto.facilities || '').split(',').map((s) => s.trim()).filter(Boolean),
                responsibilities: dto.responsibilities ?? [],
                requirements: dto.requirements ?? [],
                status: client_1.ProfileStatus.PENDING,
                postedById: userId,
            },
        });
        await this.audit.log({
            entityType: 'listing', entityId: listing.id, action: 'CREATED', actorId: userId,
            newState: { title: listing.title, organisationName: listing.organisationName, status: listing.status },
        });
        return listing;
    }
    async findAll(filters) {
        const p = (0, pagination_1.parsePage)(filters.page, filters.limit);
        // ── Meilisearch path ──────────────────────────────────────────────────
        // When Meilisearch is available, use it for all searches including
        // empty-string queries (which return everything, sorted by featured
        // status then recency — same result as Postgres, but much faster at scale).
        if (this.search.isAvailable) {
            try {
                const { ids, totalHits } = await this.search.searchListings({
                    query: filters.search,
                    targetRoleType: filters.role,
                    marketField: filters.market,
                    workMode: filters.mode,
                    payment: filters.paid,
                    certificateProvided: filters.cert,
                    page: p.page,
                    limit: p.limit,
                });
                if (ids.length === 0)
                    return (0, pagination_1.paginate)([], totalHits, p);
                // Fetch full records from Postgres in one query, then re-sort to
                // preserve Meilisearch's relevance order (Prisma's findMany doesn't
                // guarantee the order of results when using `id: { in: [...] }`).
                const records = await this.prisma.jobListing.findMany({
                    where: { id: { in: ids } },
                });
                const ordered = ids.map(id => records.find(r => r.id === id)).filter(Boolean);
                return (0, pagination_1.paginate)(ordered, totalHits, p);
            }
            catch (err) {
                // Fall through to Postgres on any Meilisearch error
            }
        }
        // ── Postgres fallback (ILIKE) ─────────────────────────────────────────
        // Used when Meilisearch is unavailable or throws an unexpected error.
        // Also the path used until the backfill script has run at least once.
        const where = { status: client_1.ProfileStatus.APPROVED };
        if (filters.search)
            where.OR = [
                { title: { contains: filters.search } },
                { organisationName: { contains: filters.search } },
            ];
        if (filters.role)
            where.targetRoleType = filters.role;
        if (filters.market)
            where.marketField = filters.market;
        if (filters.mode)
            where.workMode = filters.mode;
        if (filters.paid)
            where.payment = filters.paid;
        if (filters.cert)
            where.certificateProvided = filters.cert;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.jobListing.findMany({
                where,
                orderBy: [{ featured: 'desc' }, { postedAt: 'desc' }],
                skip: p.skip, take: p.limit,
            }),
            this.prisma.jobListing.count({ where }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async findById(id) {
        const l = await this.prisma.jobListing.findUnique({ where: { id } });
        if (!l)
            throw new common_1.NotFoundException('Listing not found');
        return l;
    }
    /**
     * Returns the sensitive contact fields (phone, email, contactPerson) for a listing.
     * Requires the calling user to have an active ListingUnlock record.
     * The unlock itself (point deduction + record creation) is handled by WalletService.
     */
    async getDetails(id, userId) {
        const unlock = await this.prisma.listingUnlock.findUnique({
            where: { userId_listingId: { userId, listingId: id } },
        });
        if (!unlock) {
            throw new common_1.BadRequestException('This listing has not been unlocked. Use POST /wallet/unlock-listing/:id first.');
        }
        const l = await this.prisma.jobListing.findUnique({ where: { id } });
        if (!l)
            throw new common_1.NotFoundException('Listing not found');
        return {
            contactPerson: l.contactPerson,
            contactEmail: l.contactEmail,
            contactPhone: l.contactPhone,
        };
    }
    async findSimilar(id, role) {
        // Get the source listing to match against
        const source = await this.prisma.jobListing.findUnique({
            where: { id },
            select: { marketField: true, experienceRequired: true, listingType: true, targetRoleType: true },
        });
        if (!source)
            return [];
        // Try strict match first: same field + type + experience
        const strict = await this.prisma.jobListing.findMany({
            where: {
                id: { not: id }, status: 'APPROVED',
                marketField: source.marketField,
                listingType: source.listingType,
                experienceRequired: source.experienceRequired,
            },
            take: 2, orderBy: { postedAt: 'desc' },
        });
        if (strict.length >= 2)
            return strict;
        // Fallback: relax to just field + type (ignore exp)
        const relaxed = await this.prisma.jobListing.findMany({
            where: {
                id: { not: id }, status: 'APPROVED',
                marketField: source.marketField,
                listingType: source.listingType,
            },
            take: 2, orderBy: { postedAt: 'desc' },
        });
        return relaxed;
    }
    async findPending(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.jobListing.findMany({ where: { status: client_1.ProfileStatus.PENDING }, orderBy: { postedAt: 'asc' }, skip: p.skip, take: p.limit }),
            this.prisma.jobListing.count({ where: { status: client_1.ProfileStatus.PENDING } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async approve(id, moderatorId) {
        const before = await this.prisma.jobListing.findUnique({
            where: { id },
            include: { postedBy: { select: { email: true } } },
        });
        if (!before)
            throw new common_1.NotFoundException('Listing not found');
        const after = await this.prisma.jobListing.update({
            where: { id },
            data: { status: client_1.ProfileStatus.APPROVED, reviewedById: moderatorId, reviewedAt: new Date() },
        });
        await this.audit.log({
            entityType: 'listing', entityId: id, action: 'APPROVED', actorId: moderatorId,
            oldState: { status: before.status },
            newState: { status: after.status, reviewedAt: after.reviewedAt },
        });
        if (before.postedById) {
            await this.notify.send({
                userId: before.postedById,
                subject: 'Your listing is live! ✅',
                body: `Your listing "${before.title}" has been approved and is now visible to candidates on the portal.`,
                link: `/jobs/${before.id}`,
                email: before.postedBy?.email,
            });
        }
        // Index in Meilisearch so it appears in search results immediately
        await this.search.indexListing({
            id: after.id,
            title: after.title,
            organisationName: after.organisationName,
            description: after.description,
            location: after.location,
            skills: after.skills ?? [],
            targetRoleType: after.targetRoleType,
            marketField: after.marketField,
            workMode: after.workMode,
            payment: after.payment,
            certificateProvided: after.certificateProvided,
            industry: after.industry,
            featured: after.featured,
            postedAt: after.postedAt,
        });
        return after;
    }
    async update(id, userId, dto) {
        const listing = await this.findById(id);
        // Only the original poster can edit, and only while PENDING or REJECTED
        if (listing.postedById !== userId) {
            throw new Error('Forbidden: only the poster can edit this listing');
        }
        if (listing.status === client_1.ProfileStatus.APPROVED) {
            throw new Error('Cannot edit an approved listing — contact a moderator');
        }
        const updated = await this.prisma.jobListing.update({
            where: { id },
            data: {
                ...dto,
                status: listing.status === client_1.ProfileStatus.REJECTED ? client_1.ProfileStatus.PENDING : listing.status,
                skills: dto.skills
                    ? (Array.isArray(dto.skills) ? dto.skills : String(dto.skills).split(',').map((s) => s.trim()).filter(Boolean))
                    : undefined,
                facilities: dto.facilities
                    ? (Array.isArray(dto.facilities) ? dto.facilities : String(dto.facilities).split(',').map((s) => s.trim()).filter(Boolean))
                    : undefined,
                reviewedAt: null,
                reviewedById: null,
                rejectionReason: null,
            },
        });
        await this.audit.log({
            entityType: 'listing', entityId: id, action: 'UPDATED', actorId: userId,
            oldState: { status: listing.status, title: listing.title },
            newState: { status: updated.status, title: updated.title },
        });
        return updated;
    }
    async reject(id, moderatorId, reason) {
        const before = await this.prisma.jobListing.findUnique({
            where: { id },
            include: { postedBy: { select: { email: true } } },
        });
        if (!before)
            throw new common_1.NotFoundException('Listing not found');
        const after = await this.prisma.jobListing.update({
            where: { id },
            data: { status: client_1.ProfileStatus.REJECTED, rejectionReason: reason, reviewedById: moderatorId, reviewedAt: new Date() },
        });
        await this.audit.log({
            entityType: 'listing', entityId: id, action: 'REJECTED', actorId: moderatorId,
            oldState: { status: before.status },
            newState: { status: after.status },
            metadata: { reason },
        });
        if (before.postedById) {
            await this.notify.send({
                userId: before.postedById,
                subject: 'Listing could not be approved',
                body: `Your listing "${before.title}" was not approved. Reason: ${reason}. Please update your listing and resubmit.`,
                link: '/post',
                email: before.postedBy?.email,
            });
        }
        // Remove from Meilisearch — rejected listings must not appear in search results
        await this.search.removeListing(id);
        return after;
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        search_service_1.SearchService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map