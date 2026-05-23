import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus, MarketField } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpsertProfileDto, AddExperienceDto } from './dto/profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly audit:   AuditService,
    private readonly notify:  NotificationsService,
  ) {}

  async upsert(userId: string, dto: UpsertProfileDto) {
    const existing = await this.prisma.candidateProfile.findUnique({
      where: { userId_roleType: { userId, roleType: dto.roleType } },
    });
    const skills = Array.isArray(dto.skills)
      ? dto.skills
      : (dto.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const data = {
      ...dto, userId, skills,
      status: ProfileStatus.PENDING, submittedAt: new Date(),
      reviewedAt: null, reviewedById: null, rejectionReason: null, marketField: null,
    };

    const profile = existing
      ? await this.prisma.candidateProfile.update({ where: { id: existing.id }, data, include: { experiences: { orderBy: { displayOrder: 'asc' } } } })
      : await this.prisma.candidateProfile.create({ data, include: { experiences: { orderBy: { displayOrder: 'asc' } } } });

    await this.audit.log({
      entityType: 'profile',
      entityId:   profile.id,
      action:     existing ? 'UPDATED' : 'CREATED',
      actorId:    userId,
      newState:   { roleType: profile.roleType, status: profile.status, appliedFor: (profile as any).appliedFor },
    });

    return profile;
  }

  async getMyProfiles(userId: string) {
    return this.prisma.candidateProfile.findMany({
      where: { userId },
      include: { experiences: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getMyByRole(userId: string, roleType: string) {
    const p = await this.prisma.candidateProfile.findUnique({
      where: { userId_roleType: { userId, roleType: roleType as any } },
      include: { experiences: { orderBy: { displayOrder: 'asc' } }, documents: true },
    });
    if (!p) throw new NotFoundException('Profile not found');
    return p;
  }

  async addExperience(userId: string, roleType: string, dto: AddExperienceDto) {
    const p = await this.prisma.candidateProfile.findUnique({
      where: { userId_roleType: { userId, roleType: roleType as any } },
    });
    if (!p) throw new NotFoundException('Profile not found');
    return this.prisma.experienceEntry.create({
      data: {
        profileId: p.id, title: dto.title, company: dto.company,
        fromDate: dto.fromDate, toDate: dto.toDate,
        description: dto.description, displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async deleteExperience(userId: string, entryId: string) {
    const e = await this.prisma.experienceEntry.findUnique({ where: { id: entryId }, include: { profile: true } });
    if (!e || e.profile.userId !== userId) throw new NotFoundException();
    return this.prisma.experienceEntry.delete({ where: { id: entryId } });
  }

  // ── Moderator list endpoints — paginated ──────────────────────────────────

  async getPending(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where: { status: ProfileStatus.PENDING },
        include: { user: { select: { email: true, name: true } }, documents: true },
        orderBy: { submittedAt: 'asc' }, skip: p.skip, take: p.limit,
      }),
      this.prisma.candidateProfile.count({ where: { status: ProfileStatus.PENDING } }),
    ]);
    return paginate(data, total, p);
  }

  async getApproved(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where: { status: ProfileStatus.APPROVED },
        include: { user: { select: { email: true, name: true } } },
        orderBy: { reviewedAt: 'desc' }, skip: p.skip, take: p.limit,
      }),
      this.prisma.candidateProfile.count({ where: { status: ProfileStatus.APPROVED } }),
    ]);
    return paginate(data, total, p);
  }

  async getRejected(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where: { status: ProfileStatus.REJECTED },
        include: { user: { select: { email: true, name: true } } },
        orderBy: { reviewedAt: 'desc' }, skip: p.skip, take: p.limit,
      }),
      this.prisma.candidateProfile.count({ where: { status: ProfileStatus.REJECTED } }),
    ]);
    return paginate(data, total, p);
  }

  // ── Moderator state changes — audit + notify ──────────────────────────────

  async approve(id: string, modId: string, marketField: MarketField) {
    const before = await this.prisma.candidateProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!before) throw new NotFoundException('Profile not found');

    const after = await this.prisma.candidateProfile.update({
      where: { id },
      data: { status: ProfileStatus.APPROVED, reviewedById: modId, reviewedAt: new Date(), marketField },
    });

    await this.audit.log({
      entityType: 'profile', entityId: id, action: 'APPROVED', actorId: modId,
      oldState: { status: before.status, marketField: before.marketField },
      newState: { status: after.status, marketField: after.marketField, reviewedAt: after.reviewedAt },
    });

    // Notify the profile owner
    await this.notify.send({
      userId:  before.userId,
      subject: 'Your profile has been approved! 🎉',
      body:    `Your ${before.roleType.replace(/_/g, ' ')} profile has been reviewed and approved. It is now live on the portal.`,
      link:    `/profile/${before.roleType}`,
      email:   (before as any).user?.email,
    });

    return after;
  }

  async reject(id: string, modId: string, reason: string) {
    const before = await this.prisma.candidateProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!before) throw new NotFoundException('Profile not found');

    const after = await this.prisma.candidateProfile.update({
      where: { id },
      data: { status: ProfileStatus.REJECTED, rejectionReason: reason, reviewedById: modId, reviewedAt: new Date() },
    });

    await this.audit.log({
      entityType: 'profile', entityId: id, action: 'REJECTED', actorId: modId,
      oldState: { status: before.status },
      newState: { status: after.status },
      metadata: { reason },
    });

    // Notify the profile owner with the reason
    await this.notify.send({
      userId:  before.userId,
      subject: 'Profile review update',
      body:    `Your ${before.roleType.replace(/_/g, ' ')} profile could not be approved. Reason: ${reason}. Please update your profile and resubmit.`,
      link:    `/profile/${before.roleType}`,
      email:   (before as any).user?.email,
    });

    return after;
  }

  async reactivate(id: string) {
    const before = await this.prisma.candidateProfile.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Profile not found');

    const after = await this.prisma.candidateProfile.update({
      where: { id },
      data: { status: ProfileStatus.PENDING, reviewedAt: null, reviewedById: null },
    });

    await this.audit.log({
      entityType: 'profile', entityId: id, action: 'REACTIVATED',
      oldState: { status: before.status }, newState: { status: after.status },
    });

    return after;
  }
}
