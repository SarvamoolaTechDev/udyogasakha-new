import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus, MarketField } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [profiles, listings] = await this.prisma.$transaction([
      this.prisma.candidateProfile.groupBy({ by: ['marketField', 'status'], _count: { _all: true } }),
      this.prisma.jobListing.groupBy({       by: ['marketField', 'status'], _count: { _all: true } }),
    ]);

    const sum = (data: any[], field: MarketField, status?: ProfileStatus) =>
      data
        .filter(d => d.marketField === field && (status === undefined || d.status === status))
        .reduce((s, d) => s + d._count._all, 0);

    return {
      profilesByMarket: {
        IT_FIELD:     sum(profiles, MarketField.IT_FIELD,     ProfileStatus.APPROVED),
        NON_IT_FIELD: sum(profiles, MarketField.NON_IT_FIELD, ProfileStatus.APPROVED),
        SERVICES:     sum(profiles, MarketField.SERVICES,     ProfileStatus.APPROVED),
      },
      listingsByMarket: {
        IT_FIELD:     sum(listings, MarketField.IT_FIELD,     ProfileStatus.APPROVED),
        NON_IT_FIELD: sum(listings, MarketField.NON_IT_FIELD, ProfileStatus.APPROVED),
        SERVICES:     sum(listings, MarketField.SERVICES,     ProfileStatus.APPROVED),
      },
      total: {
        pending:  profiles.filter(p => p.status === ProfileStatus.PENDING) .reduce((s, d) => s + d._count._all, 0),
        approved: profiles.filter(p => p.status === ProfileStatus.APPROVED).reduce((s, d) => s + d._count._all, 0),
        rejected: profiles.filter(p => p.status === ProfileStatus.REJECTED).reduce((s, d) => s + d._count._all, 0),
      },
    };
  }

  async getByRole() {
    const data = await this.prisma.candidateProfile.groupBy({
      by: ['roleType'],
      where: { status: ProfileStatus.APPROVED },
      _count: { _all: true },
    });
    return data.map(d => ({ role: d.roleType, count: d._count._all }));
  }

  async getAllApproved(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit, 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where: { status: ProfileStatus.APPROVED },
        select: {
          id: true, fullName: true, roleType: true,
          appliedFor: true, appliedAt: true,
          marketField: true, marketSegment: true,
          workMode: true, certificate: true,
          employmentOption: true, submittedAt: true,
          user: { select: { email: true } },
        },
        orderBy: { reviewedAt: 'desc' },
        skip: p.skip,
        take: p.limit,
      }),
      this.prisma.candidateProfile.count({ where: { status: ProfileStatus.APPROVED } }),
    ]);
    return paginate(data, total, p);
  }
}
