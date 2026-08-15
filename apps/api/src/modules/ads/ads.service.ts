import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { AdStatus, ProfileStatus, RoleType, WorkMode, MarketField, TransactionType } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

const MAX_ACTIVE_ADS  = 2;
const AD_UNLOCK_COST  = 30;  // points to unlock contact details
const AD_EXTEND_COST  = 30;  // points to extend an ad by 30 days
const MAX_DURATION    = 30;  // max days an ad can run

export interface CreateAdDto {
  title:        string;
  description:  string;
  skills:       string[];
  location?:    string;
  salaryExpect?:string;
  workMode:     WorkMode;
  contactPhone?:string;
  contactEmail?:string;
  durationDays: number; // 7, 15, 30 or custom ≤30
}

@Injectable()
export class AdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {}

  // ── Browse (public — any logged-in user) ──────────────────────────────────
  async browse(viewerUserId: string, filters: {
    search?: string; workMode?: string; marketField?: string;
    page?: number; limit?: number;
  }) {
    const now = new Date();
    const where: any = { status: AdStatus.ACTIVE, expiresAt: { gt: now } };
    if (filters.workMode)    where.workMode    = filters.workMode;
    if (filters.marketField) where.marketField = filters.marketField;
    if (filters.search) {
      where.OR = [
        { title:       { contains: filters.search } },
        { description: { contains: filters.search } },
        { location:    { contains: filters.search } },
      ];
    }

    const p = parsePage(filters.page, filters.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.advertisement.findMany({
        where,
        include: {
          user:          { select: { name: true } },
          _count:        { select: { views: true, contactUnlocks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: p.skip, take: p.limit,
      }),
      this.prisma.advertisement.count({ where }),
    ]);

    // Attach whether this viewer has unlocked contact for each ad
    const adIds = data.map((a: any) => a.id);
    let unlockedSet = new Set<string>();
    if (adIds.length > 0) {
      const unlocks = await this.prisma.adContactUnlock.findMany({
        where: { userId: viewerUserId, adId: { in: adIds } },
        select: { adId: true },
      });
      unlockedSet = new Set(unlocks.map((u: any) => u.adId));
    }

    const enriched = data.map((a: any) => ({
      ...a,
      viewCount:    a._count.views,
      unlockCount:  a._count.contactUnlocks,
      isUnlocked:   unlockedSet.has(a.id),
      daysRemaining: Math.max(0, Math.ceil((new Date(a.expiresAt).getTime() - now.getTime()) / 86400000)),
    }));

    return paginate(enriched, total, p);
  }

  // ── Get single ad — records view automatically ────────────────────────────
  async findById(id: string, viewerUserId: string) {
    const now = new Date();
    const ad  = await this.prisma.advertisement.findUnique({
      where:   { id },
      include: { user: { select: { name: true } }, _count: { select: { views: true, contactUnlocks: true } } },
    });
    if (!ad || ad.status === AdStatus.DELETED) throw new NotFoundException('Ad not found');

    const isExpired   = ad.expiresAt < now || ad.status !== AdStatus.EXPIRED;
    const isOwner     = ad.userId === viewerUserId;

    // Record view (idempotent — unique constraint prevents duplicates)
    if (!isOwner && !isExpired) {
      await this.prisma.adView.upsert({
        where:  { adId_userId: { adId: id, userId: viewerUserId } },
        update: { viewedAt: new Date() },  // update timestamp on re-view
        create: { adId: id, userId: viewerUserId },
      }).catch(() => {}); // ignore if already exists
    }

    // Check if viewer has unlocked contact
    const unlock = await this.prisma.adContactUnlock.findUnique({
      where: { adId_userId: { adId: id, userId: viewerUserId } },
    });

    return {
      ...ad,
      skills:       ad.skills as string[],
      viewCount:    ad._count.views,
      unlockCount:  ad._count.contactUnlocks,
      isUnlocked:   !!unlock,
      isOwner,
      isExpired,
      daysRemaining: Math.max(0, Math.ceil((new Date(ad.expiresAt).getTime() - now.getTime()) / 86400000)),
      // Only expose contact if owner OR unlocked
      contactPhone: (isOwner || unlock) ? ad.contactPhone : null,
      contactEmail: (isOwner || unlock) ? ad.contactEmail : null,
    };
  }

  // ── Create ad ─────────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateAdDto) {
    // Must have at least one approved JOB_SEEKER profile
    const profile = await this.prisma.candidateProfile.findFirst({
      where: { userId, roleType: RoleType.JOB_SEEKER, status: ProfileStatus.APPROVED },
    });
    if (!profile) {
      throw new ForbiddenException('Only Job Seekers with an approved profile can post ads.');
    }

    // Max 2 active ads
    const activeCount = await this.prisma.advertisement.count({
      where: { userId, status: AdStatus.ACTIVE, expiresAt: { gt: new Date() } },
    });
    if (activeCount >= MAX_ACTIVE_ADS) {
      throw new BadRequestException(`You can only have ${MAX_ACTIVE_ADS} active ads at a time. Delete or let one expire before posting a new one.`);
    }

    const durationDays = Math.min(Math.max(1, dto.durationDays ?? 30), MAX_DURATION);
    const expiresAt    = new Date(Date.now() + durationDays * 86400000);

    return this.prisma.advertisement.create({
      data: {
        userId,
        title:        dto.title,
        description:  dto.description,
        skills:       (dto.skills ?? []) as any,
        location:     dto.location,
        salaryExpect: dto.salaryExpect,
        workMode:     dto.workMode,
        marketField:  profile.marketField ?? MarketField.IT_FIELD,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        durationDays,
        expiresAt,
      },
    });
  }

  // ── Edit ad ───────────────────────────────────────────────────────────────
  async update(id: string, userId: string, dto: Partial<CreateAdDto>) {
    const ad = await this.findOwned(id, userId);
    if (ad.status === AdStatus.DELETED) throw new BadRequestException('Cannot edit a deleted ad');

    return this.prisma.advertisement.update({
      where: { id },
      data: {
        ...(dto.title        && { title:        dto.title }),
        ...(dto.description  && { description:  dto.description }),
        ...(dto.skills       && { skills:       dto.skills as any }),
        ...(dto.location     !== undefined && { location:    dto.location }),
        ...(dto.salaryExpect !== undefined && { salaryExpect:dto.salaryExpect }),
        ...(dto.workMode     && { workMode:     dto.workMode }),
        ...(dto.contactPhone !== undefined && { contactPhone:dto.contactPhone }),
        ...(dto.contactEmail !== undefined && { contactEmail:dto.contactEmail }),
      },
    });
  }

  // ── Delete ad ─────────────────────────────────────────────────────────────
  async remove(id: string, userId: string) {
    await this.findOwned(id, userId);
    await this.prisma.advertisement.update({
      where: { id },
      data:  { status: AdStatus.DELETED },
    });
    return { message: 'Ad deleted' };
  }

  // ── Extend ad (costs AD_EXTEND_COST points) ───────────────────────────────
  async extend(id: string, userId: string) {
    const ad = await this.findOwned(id, userId);
    if (ad.status === AdStatus.DELETED) throw new BadRequestException('Cannot extend a deleted ad');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < AD_EXTEND_COST) {
      throw new BadRequestException(`You need ${AD_EXTEND_COST} points to extend your ad. Current balance: ${wallet?.balance ?? 0}`);
    }

    return this.prisma.$transaction(async tx => {
      // Extend from now or from current expiry (whichever is later) + 30 days
      const baseDate = ad.expiresAt > new Date() ? ad.expiresAt : new Date();
      const newExpiry = new Date(baseDate.getTime() + 30 * 86400000);

      await tx.advertisement.update({
        where: { id },
        data:  { expiresAt: newExpiry, status: AdStatus.ACTIVE },
      });

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data:  { balance: { decrement: AD_EXTEND_COST } },
      });

      await tx.pointTransaction.create({
        data: {
          walletId:    wallet.id,
          amount:      -AD_EXTEND_COST,
          type:        TransactionType.AD_EXTEND,
          referenceId: id,
          note:        `Extended ad: ${ad.title}`,
        },
      });

      return { newExpiry, balance: updatedWallet.balance };
    });
  }

  // ── Unlock contact (costs AD_UNLOCK_COST points) ──────────────────────────
  async unlockContact(adId: string, viewerUserId: string) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad || ad.status === AdStatus.DELETED) throw new NotFoundException('Ad not found');
    if (ad.userId === viewerUserId) throw new BadRequestException('You cannot unlock your own ad contact');
    if (ad.expiresAt < new Date()) throw new BadRequestException('This ad has expired');

    // Idempotent check
    const existing = await this.prisma.adContactUnlock.findUnique({
      where: { adId_userId: { adId, userId: viewerUserId } },
    });
    if (existing) {
      const balance = await this.wallet.getBalance(viewerUserId);
      return { alreadyUnlocked: true, balance, contactPhone: ad.contactPhone, contactEmail: ad.contactEmail };
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId: viewerUserId } });
    if (!wallet || wallet.balance < AD_UNLOCK_COST) {
      throw new BadRequestException(`You need ${AD_UNLOCK_COST} points to unlock contact details. Current balance: ${wallet?.balance ?? 0}`);
    }

    const result = await this.prisma.$transaction(async tx => {
      await tx.adContactUnlock.create({ data: { adId, userId: viewerUserId } });

      const updatedWallet = await tx.wallet.update({
        where: { userId: viewerUserId },
        data:  { balance: { decrement: AD_UNLOCK_COST } },
      });

      await tx.pointTransaction.create({
        data: {
          walletId:    wallet.id,
          amount:      -AD_UNLOCK_COST,
          type:        TransactionType.AD_CONTACT_UNLOCK,
          referenceId: adId,
          note:        `Unlocked contact for ad: ${ad.title}`,
        },
      });

      return updatedWallet.balance;
    });

    return {
      alreadyUnlocked: false,
      balance:      result,
      lowBalance:   result <= 200,
      contactPhone: ad.contactPhone,
      contactEmail: ad.contactEmail,
    };
  }

  // ── My ads (poster's view with full stats) ────────────────────────────────
  async getMine(userId: string) {
    const now = new Date();
    const ads = await this.prisma.advertisement.findMany({
      where:   { userId, status: { not: AdStatus.DELETED } },
      include: {
        _count:        { select: { views: true, contactUnlocks: true } },
        views:         { select: { userId: true, viewedAt: true }, orderBy: { viewedAt: 'desc' }, take: 50 },
        contactUnlocks:{ select: { userId: true, unlockedAt: true }, orderBy: { unlockedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ads.map((a: any) => ({
      ...a,
      skills:       a.skills as string[],
      viewCount:    a._count.views,
      unlockCount:  a._count.contactUnlocks,
      isExpired:    a.expiresAt < now,
      daysRemaining:Math.max(0, Math.ceil((new Date(a.expiresAt).getTime() - now.getTime()) / 86400000)),
    }));
  }

  // ── Helper — verify ownership ─────────────────────────────────────────────
  private async findOwned(id: string, userId: string) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.userId !== userId) throw new ForbiddenException('You do not own this ad');
    return ad;
  }
}
