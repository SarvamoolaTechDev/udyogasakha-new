import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateListingDto } from './dto/listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly audit:   AuditService,
    private readonly notify:  NotificationsService,
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
    const where: any = { status: ProfileStatus.APPROVED };
    if (filters.search) where.OR = [
      { title:            { contains: filters.search, mode: 'insensitive' } },
      { organisationName: { contains: filters.search, mode: 'insensitive' } },
    ];
    if (filters.role)   where.targetRoleType        = filters.role;
    if (filters.market) where.marketField            = filters.market;
    if (filters.mode)   where.workMode               = filters.mode;
    if (filters.paid)   where.payment                = filters.paid;
    if (filters.cert)   where.certificateProvided    = filters.cert;

    const p = parsePage(filters.page, filters.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.jobListing.findMany({ where, orderBy: { postedAt: 'desc' }, skip: p.skip, take: p.limit }),
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

    return after;
  }

  async update(id: string, userId: string, dto: UpdateListingDto) {
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

    return after;
  }
}
