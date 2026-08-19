import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus } from '@prisma/client';
import { UserRole } from '../../common/user-role.enum';
import { parsePage, paginate } from '../../common/pagination';

// Roles permitted to browse talent
const TALENT_SEEKER_ROLES = ['RECRUITER', 'HIRING_MANAGER', 'TRAINER', 'RFP_PROVIDER', 'VENDOR'];

// Fields visible on the talent teaser card (no contact info)
const TEASER_SELECT = {
  id: true, fullName: true, roleType: true, marketField: true,
  marketSegment: true, workMode: true, skills: true, summary: true,
  city: true, highestDegree: true, institution: true, specialization: true, status: true,
};

@Injectable()
export class TalentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns true if the user has at least one APPROVED profile
   * of a role type permitted to browse talent.
   */
  private async checkTalentAccess(userId: string): Promise<boolean> {
    const count = await this.prisma.candidateProfile.count({
      where: { userId, status: ProfileStatus.APPROVED, roleType: { in: TALENT_SEEKER_ROLES as any[] } },
    });
    return count > 0;
  }

  /**
   * Browse approved candidate profiles.
   * Gated to qualifying roles. Excludes the viewer's own profiles.
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
    const hasAccess = await this.checkTalentAccess(userId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Find Talent is available to Recruiters, Hiring Managers, Trainers, RFP Providers and Vendors with at least one approved profile.',
      );
    }

    const where: any = {
      status: ProfileStatus.APPROVED,
      userId: { not: userId },  // exclude own profiles
    };

    if (filters.roleType)      where.roleType      = filters.roleType;
    if (filters.marketField)   where.marketField   = filters.marketField;
    if (filters.marketSegment) where.marketSegment = filters.marketSegment;
    if (filters.workMode)      where.workMode      = filters.workMode;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { city:     { contains: filters.search } },
        { summary:  { contains: filters.search } },
        // skills hasSome removed — MySQL JSON columns don't support hasSome
        // search falls back to Meilisearch for skill-based queries
      ];
    }

    const p = parsePage(filters.page, filters.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where,
        select:  TEASER_SELECT,
        orderBy: { submittedAt: 'desc' },   // was updatedAt — CandidateProfile has submittedAt
        skip: p.skip, take: p.limit,
      }),
      this.prisma.candidateProfile.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  /**
   * Full profile details — only if the requesting user has an unlock record.
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
      where:   { id: profileId },
      include: { user: { select: { email: true, phone: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    return {
      profileId:     profile.id,
      fullName:      profile.fullName,
      roleType:      profile.roleType,
      email:         (profile as any).user?.email,
      phone:         (profile as any).user?.phone,
      city:          profile.city,
      marketField:   profile.marketField,
      marketSegment: profile.marketSegment,
      skills:        (profile.skills as string[]) ?? [],
      summary:       profile.summary,
    };
  }

  /** Single profile teaser (no contact fields) */
  async findById(profileId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where:  { id: profileId, status: ProfileStatus.APPROVED },
      select: TEASER_SELECT,
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}