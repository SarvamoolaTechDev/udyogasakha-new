import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileStatus, PaymentPurpose, PaymentStatus } from '@prisma/client';

export type Period = '24h' | 'week' | 'month' | 'all';

function periodStart(period: Period): Date | null {
  const now = Date.now();
  switch (period) {
    case '24h':  return new Date(now - 24 * 60 * 60 * 1000);
    case 'week': return new Date(now - 7  * 24 * 60 * 60 * 1000);
    case 'month':return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case 'all':  return null;
  }
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(period: Period) {
    const since = periodStart(period);

    const [health, growth, moderation, breakdown, revenue] = await Promise.all([
      this.getHealth(),
      this.getGrowth(since),
      this.getModeration(since),
      this.getBreakdown(),
      this.getRevenue(since),
    ]);

    return { period, health, growth, moderation, breakdown, revenue, generatedAt: new Date() };
  }

  // ── Section 1 — Platform health (always current, no period filter) ─────────
  private async getHealth() {
    const [totalUsers, activeListings, pendingProfiles, pendingListings, totalProfiles] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.jobListing.count({ where: { status: ProfileStatus.APPROVED } }),
        this.prisma.candidateProfile.count({ where: { status: ProfileStatus.PENDING } }),
        this.prisma.jobListing.count({ where: { status: ProfileStatus.PENDING } }),
        this.prisma.candidateProfile.count({ where: { status: ProfileStatus.APPROVED } }),
      ]);
    return { totalUsers, activeListings, pendingProfiles, pendingListings, totalProfiles };
  }

  // ── Section 2 — Growth (period-filtered) ─────────────────────────────────
  private async getGrowth(since: Date | null) {
    const dateFilter = since ? { gte: since } : undefined;
    const [newUsers, newProfiles, newListings] = await Promise.all([
      this.prisma.user.count({ where: since ? { createdAt: { gte: since } } : {} }),
      this.prisma.candidateProfile.count({ where: since ? { submittedAt: { gte: since } } : {} }),
      this.prisma.jobListing.count({ where: since ? { postedAt: { gte: since } } : {} }),
    ]);
    return { newUsers, newProfiles, newListings };
  }

  // ── Section 3 — Moderation activity (period-filtered by reviewedAt) ────────
  private async getModeration(since: Date | null) {
    const reviewFilter = since ? { gte: since } : undefined;
    const where = (status: ProfileStatus) =>
      since ? { status, reviewedAt: { gte: since } } : { status };

    const [profilesApproved, profilesRejected, listingsApproved, listingsRejected] =
      await Promise.all([
        this.prisma.candidateProfile.count({ where: where(ProfileStatus.APPROVED) }),
        this.prisma.candidateProfile.count({ where: where(ProfileStatus.REJECTED) }),
        this.prisma.jobListing.count({ where: where(ProfileStatus.APPROVED) }),
        this.prisma.jobListing.count({ where: where(ProfileStatus.REJECTED) }),
      ]);

    return { profilesApproved, profilesRejected, listingsApproved, listingsRejected };
  }

  // ── Section 4 — Role & market breakdown (all approved profiles, no period) ─
  private async getBreakdown() {
    const [byRole, byMarket] = await Promise.all([
      this.prisma.$queryRaw<{ roleType: string; count: bigint }[]>`
        SELECT role_type AS roleType, COUNT(*) AS count
        FROM candidate_profiles
        WHERE status = 'APPROVED'
        GROUP BY role_type
        ORDER BY count DESC
      `,
      this.prisma.$queryRaw<{ marketField: string; count: bigint }[]>`
        SELECT market_field AS marketField, COUNT(*) AS count
        FROM candidate_profiles
        WHERE status = 'APPROVED' AND market_field IS NOT NULL
        GROUP BY market_field
        ORDER BY count DESC
      `,
    ]);

    return {
      byRole:   byRole.map(r => ({ roleType: r.roleType, count: Number(r.count) })),
      byMarket: byMarket.map(r => ({ marketField: r.marketField, count: Number(r.count) })),
    };
  }

  // ── Section 5 — Wallet & revenue ──────────────────────────────────────────
  private async getRevenue(since: Date | null) {
    const paymentFilter = since
      ? { status: PaymentStatus.CAPTURED, purpose: PaymentPurpose.WALLET_TOPUP, updatedAt: { gte: since } }
      : { status: PaymentStatus.CAPTURED, purpose: PaymentPurpose.WALLET_TOPUP };

    const [topUpPayments, listingUnlocks, profileUnlocks, featuredPayments] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amountPaise: true },
        _count: true,
        where: paymentFilter,
      }),
      this.prisma.listingUnlock.count({ where: since ? { unlockedAt: { gte: since } } : {} }),
      this.prisma.profileUnlock.count({ where: since ? { unlockedAt: { gte: since } } : {} }),
      this.prisma.payment.aggregate({
        _sum: { amountPaise: true },
        _count: true,
        where: since
          ? { status: PaymentStatus.CAPTURED, purpose: PaymentPurpose.LISTING_FEATURE, updatedAt: { gte: since } }
          : { status: PaymentStatus.CAPTURED, purpose: PaymentPurpose.LISTING_FEATURE },
      }),
    ]);

    const topUpPaise   = topUpPayments._sum.amountPaise ?? 0;
    const featuredPaise = featuredPayments._sum.amountPaise ?? 0;

    return {
      topUpRevenue:      topUpPaise / 100,        // in rupees
      topUpCount:        topUpPayments._count,
      featuredRevenue:   featuredPaise / 100,
      featuredCount:     featuredPayments._count,
      totalRevenue:      (topUpPaise + featuredPaise) / 100,
      listingUnlocks,
      profileUnlocks,
      totalUnlocks:      listingUnlocks + profileUnlocks,
    };
  }
}
