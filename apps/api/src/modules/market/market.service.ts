import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus, MarketField } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

// Raw query row types — $queryRaw returns bigint for COUNT(*), cast to Number before use
interface MarketGroupRow { marketField: string | null; status: string; count: bigint; }
interface RoleGroupRow   { roleType: string;             count: bigint; }

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    // $queryRaw avoids the Prisma groupBy circular-type-reference TS error (Prisma bug)
    const [profiles, listings] = await this.prisma.$transaction([
      this.prisma.$queryRaw<MarketGroupRow[]>`
        SELECT market_field AS "marketField", status, COUNT(*)::int AS count
        FROM candidate_profiles
        GROUP BY market_field, status
      `,
      this.prisma.$queryRaw<MarketGroupRow[]>`
        SELECT market_field AS "marketField", status, COUNT(*)::int AS count
        FROM job_listings
        GROUP BY market_field, status
      `,
    ]);

    const sum = (rows: MarketGroupRow[], field: MarketField, status?: ProfileStatus) =>
      rows
        .filter(r => r.marketField === field && (status === undefined || r.status === status))
        .reduce((s, r) => s + Number(r.count), 0);

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
        pending:  profiles.filter(r => r.status === ProfileStatus.PENDING) .reduce((s, r) => s + Number(r.count), 0),
        approved: profiles.filter(r => r.status === ProfileStatus.APPROVED).reduce((s, r) => s + Number(r.count), 0),
        rejected: profiles.filter(r => r.status === ProfileStatus.REJECTED).reduce((s, r) => s + Number(r.count), 0),
      },
    };
  }

  async getByRole() {
    // $queryRaw for the same reason — groupBy by: ['roleType'] also triggers the Prisma TS bug
    const rows = await this.prisma.$queryRaw<RoleGroupRow[]>`
      SELECT role_type AS "roleType", COUNT(*)::int AS count
      FROM candidate_profiles
      WHERE status = 'APPROVED'
      GROUP BY role_type
      ORDER BY count DESC
    `;
    return rows.map(r => ({ role: r.roleType, count: Number(r.count) }));
  }

  async getAllApproved(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit, 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidateProfile.findMany({
        where:   { status: ProfileStatus.APPROVED },
        select:  {
          id: true, fullName: true, roleType: true,
          appliedFor: true, appliedAt: true,
          marketField: true, marketSegment: true,
          workMode: true, certificate: true,
          employmentOption: true, submittedAt: true,
          user: { select: { email: true } },
        },
        orderBy: { reviewedAt: 'desc' },
        skip:    p.skip,
        take:    p.limit,
      }),
      this.prisma.candidateProfile.count({ where: { status: ProfileStatus.APPROVED } }),
    ]);
    return paginate(data, total, p);
  }
}
