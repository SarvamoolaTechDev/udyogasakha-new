import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SearchService } from '../search/search.service';
import { CreateListingDto } from './dto/listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly audit:   AuditService,
    private readonly notify:  NotificationsService,
    private readonly search:  SearchService,
  ) {}

  async create(dto: CreateListingDto, userId: string) {
    const listing = await this.prisma.jobListing.create({
      data: {
        ...dto,
        skills:           Array.isArray(dto.skills)     ? dto.skills     : (dto.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        facilities:       Array.isArray(dto.facilities) ? dto.facilities : (dto.facilities || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        responsibilities: dto.responsibilities ?? [],
        requirements:     dto.requirements     ?? [],
        status:           ProfileStatus.PENDING,
        postedById:       userId,
      },
    });

    await this.audit.log({
      entityType: 'listing', entityId: listing.id, action: 'CREATED', actorId: userId,
      newState: { title: listing.title, organisationName: listing.organisationName, status: listing.status },
    });

    return listing;
  }

  async findAll(filters: {
    search?: string; role?: string; market?: string; mode?: string;
    paid?: string; cert?: string; page?: number; limit?: number;
  }) {
    const p = parsePage(filters.page, filters.limit);

    // ── Meilisearch path ──────────────────────────────────────────────────
    // When Meilisearch is available, use it for all searches including
    // empty-string queries (which return everything, sorted by featured
    // status then recency — same result as Postgres, but much faster at scale).
    if (this.search.isAvailable) {
      try {
        const { ids, totalHits } = await this.search.searchListings({
          query:               filters.search,
          targetRoleType:      filters.role,
          marketField:         filters.market,
          workMode:            filters.mode,
          payment:             filters.paid,
          certificateProvided: filters.cert,
          page:                p.page,
          limit:               p.limit,
        });

        if (ids.length === 0) return paginate([], totalHits, p);

        // Fetch full records from Postgres in one query, then re-sort to
        // preserve Meilisearch's relevance order (Prisma's findMany doesn't
        // guarantee the order of results when using `id: { in: [...] }`).
        const records = await this.prisma.jobListing.findMany({
          where: { id: { in: ids } },
        });
        const ordered = ids.map(id => records.find(r => r.id === id)).filter(Boolean);

        return paginate(ordered, totalHits, p);
      } catch (err) {
        // Fall through to Postgres on any Meilisearch error
      }
    }

    // ── Postgres fallback (ILIKE) ─────────────────────────────────────────
    // Used when Meilisearch is unavailable or throws an unexpected error.
    // Also the path used until the backfill script has run at least once.
    const where: any = { status: ProfileStatus.APPROVED };
    if (filters.search) where.OR = [
      { title:            { contains: filters.search, mode: 'insensitive' } },
      { organisationName: { contains: filters.search, mode: 'insensitive' } },
      { skills:           { hasSome:  [filters.search] } },
    ];
    if (filters.role)   where.targetRoleType     = filters.role;
    if (filters.market) where.marketField         = filters.market;
    if (filters.mode)   where.workMode            = filters.mode;
    if (filters.paid)   where.payment             = filters.paid;
    if (filters.cert)   where.certificateProvided = filters.cert;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.jobListing.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { postedAt: 'desc' }],
        skip: p.skip, take: p.limit,
      }),
      this.prisma.jobListing.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  async findById(id: string) {
    const l = await this.prisma.jobListing.findUnique({ where: { id } });
    if (!l) throw new NotFoundException('Listing not found');
    return l;
  }

  async findSimilar(id: string, role: string, limit = 3) {
    return this.prisma.jobListing.findMany({
      where: { id: { not: id }, status: ProfileStatus.APPROVED, targetRoleType: role as any },
      take: limit, orderBy: { postedAt: 'desc' },
    });
  }

  async findPending(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.jobListing.findMany({ where: { status: ProfileStatus.PENDING }, orderBy: { postedAt: 'asc' }, skip: p.skip, take: p.limit }),
      this.prisma.jobListing.count({ where: { status: ProfileStatus.PENDING } }),
    ]);
    return paginate(data, total, p);
  }

  async approve(id: string, moderatorId: string) {
    const before = await this.prisma.jobListing.findUnique({
      where:   { id },
      include: { postedBy: { select: { email: true } } },
    });
    if (!before) throw new NotFoundException('Listing not found');

    const after = await this.prisma.jobListing.update({
      where: { id },
      data:  { status: ProfileStatus.APPROVED, reviewedById: moderatorId, reviewedAt: new Date() },
    });

    await this.audit.log({
      entityType: 'listing', entityId: id, action: 'APPROVED', actorId: moderatorId,
      oldState: { status: before.status },
      newState: { status: after.status, reviewedAt: after.reviewedAt },
    });

    if (before.postedById) {
      await this.notify.send({
        userId:  before.postedById,
        subject: 'Your listing is live! ✅',
        body:    `Your listing "${before.title}" has been approved and is now visible to candidates on the portal.`,
        link:    `/jobs/${before.id}`,
        email:   (before as any).postedBy?.email,
      });
    }

    // Index in Meilisearch so it appears in search results immediately
    await this.search.indexListing({
      id:                  after.id,
      title:               after.title,
      organisationName:    after.organisationName,
      description:         after.description,
      location:            after.location,
      skills:              after.skills,
      targetRoleType:      after.targetRoleType,
      marketField:         after.marketField,
      workMode:            after.workMode,
      payment:             after.payment,
      certificateProvided: after.certificateProvided,
      industry:            after.industry,
      featured:            after.featured,
      postedAt:            after.postedAt,
    });

    return after;
  }(id: string, userId: string, dto: UpdateListingDto) {
    const listing = await this.findById(id);

    // Only the original poster can edit, and only while PENDING or REJECTED
    if (listing.postedById !== userId) {
      throw new Error('Forbidden: only the poster can edit this listing');
    }
    if (listing.status === ProfileStatus.APPROVED) {
      throw new Error('Cannot edit an approved listing — contact a moderator');
    }

    const updated = await this.prisma.jobListing.update({
      where: { id },
      data: {
        ...dto,
        status: listing.status === ProfileStatus.REJECTED ? ProfileStatus.PENDING : listing.status,
        skills: dto.skills
          ? (Array.isArray(dto.skills) ? dto.skills : String(dto.skills).split(',').map((s) => s.trim()).filter(Boolean))
          : undefined,
        facilities: dto.facilities
          ? (Array.isArray(dto.facilities) ? dto.facilities : String(dto.facilities).split(',').map((s) => s.trim()).filter(Boolean))
          : undefined,
        reviewedAt:      null,
        reviewedById:    null,
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

  async reject(id: string, moderatorId: string, reason: string) {
    const before = await this.prisma.jobListing.findUnique({
      where:   { id },
      include: { postedBy: { select: { email: true } } },
    });
    if (!before) throw new NotFoundException('Listing not found');

    const after = await this.prisma.jobListing.update({
      where: { id },
      data:  { status: ProfileStatus.REJECTED, rejectionReason: reason, reviewedById: moderatorId, reviewedAt: new Date() },
    });

    await this.audit.log({
      entityType: 'listing', entityId: id, action: 'REJECTED', actorId: moderatorId,
      oldState: { status: before.status },
      newState: { status: after.status },
      metadata: { reason },
    });

    if (before.postedById) {
      await this.notify.send({
        userId:  before.postedById,
        subject: 'Listing could not be approved',
        body:    `Your listing "${before.title}" was not approved. Reason: ${reason}. Please update your listing and resubmit.`,
        link:    '/post',
        email:   (before as any).postedBy?.email,
      });
    }

    // Remove from Meilisearch — rejected listings must not appear in search results
    await this.search.removeListing(id);

    return after;
  }
}
