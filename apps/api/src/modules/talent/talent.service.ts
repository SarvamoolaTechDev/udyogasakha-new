import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus } from '@prisma/client';
import { UserRole } from '../../common/user-role.enum';
import { parsePage, paginate } from '../../common/pagination';

// Fields visible to everyone on the talent teaser card
const TEASER_SELECT = {
  id: true,
  fullName: true,
  roleType: true,
  marketField: true,
  marketSegment: true,
  workMode: true,
  skills: true,
  summary: true,
  city: true,
  highestDegree: true,
  institution: true,
  specialization: true,
  status: true,
  // Sensitive fields explicitly excluded from teaser:
  // phone, email are on the User model — not here
  // user relation is excluded intentionally
};

@Injectable()
export class TalentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Browse approved candidate profiles. Available to all authenticated users,
   * but contact fields are never included — those come from getDetails() after unlock.
   */
  async browse(userId: string, filters: {
    search?:        string;
    roleType?:      string;
    marketField?:   string;
    marketSegment?: string;
    workMode?:      string;
    page?:          number;
    limit?:         number;
  }) {
    // Gate: only qualifying roles can browse talent
    const hasAccess = await this.checkTalentAccess(userId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Find Talent is available to Recruiters, Hiring Managers, Trainers, RFP Providers and Vendors with at least one approved profile.',
      );
    }

    const where: any = { status: ProfileStatus.APPROVED };
    if (filters.roleType)      where.roleType      = filters.roleType;
    if (filters.marketField)   where.marketField   = filters.marketField;
    if (filters.marketSegment) where.marketSegment = filters.marketSegment;
    if (filters.workMode)      where.workMode      = filters.workMode;
    if (filters.search) {
      where.OR = [
        { fullName:     { contains: filters.search, mode: 'insensitive' } },
        { skills:       { hasSome:  [filters.search] } },
        { city:         { contains: filters.search, mode: 'insensitive' } },
        { summary:      { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const p = parsePage(filters.page, filters.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where,
        select: TEASER_SELECT,
        orderBy: { submittedAt: 'desc' },
        skip: p.skip, take: p.limit,
      }),
      this.prisma.candidateProfile.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  /**
   * Returns full candidate contact details — only if the requesting user has
   * a ProfileUnlock record for this profile.
   */
  async getDetails(profileId: string, requestingUserId: string) {
    const unlock = await this.prisma.profileUnlock.findUnique({
      where: { userId_profileId: { userId: requestingUserId, profileId } },
    });
    if (!unlock) {
      throw new BadRequestException(
        'This profile has not been unlocked. Use POST /wallet/unlock-profile/:id first.',
      );
    }

    const profile = await this.prisma.candidateProfile.findUnique({
      where:  { id: profileId },
      include: { user: { select: { email: true, phone: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    return {
      profileId:    profile.id,
      fullName:     profile.fullName,
      roleType:     profile.roleType,
      email:        (profile as any).user?.email,
      phone:        (profile as any).user?.phone,
      city:         profile.city,
      marketField:  profile.marketField,
      marketSegment:profile.marketSegment,
      skills:       profile.skills,
      summary:      profile.summary,
    };
  }

  /** Single profile teaser (public — no contact fields) */
  async findById(profileId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where:  { id: profileId, status: ProfileStatus.APPROVED },
      select: TEASER_SELECT,
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}
