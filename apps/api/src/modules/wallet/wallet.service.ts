import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TransactionType } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

// Points deducted for each unlock
export const UNLOCK_COST = 30;

// Warning threshold — popup shown when balance falls to this level or below
export const LOW_BALANCE_THRESHOLD = 200;

// ⚠️ TEMPORARY: 1000 points given at registration until the "2nd approved profile"
// trigger is implemented. Replace this with the profile-approval hook once the
// client has reviewed the design doc and confirmed the trigger point.
export const PROFILE_APPROVAL_BONUS = 1000;  // credited on 1st and 2nd approved profile
export const SIGNUP_BONUS = 0;               // kept for enum compatibility — no signup bonus

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  // ── Wallet lifecycle ────────────────────────────────────────────────────────

  /**
   * Called from AuthService.register() immediately after user creation.
   * Creates wallet and credits the temporary signup bonus.
   */
  async createForUser(userId: string): Promise<void> {
    // Create wallet with 0 balance — points are credited on profile approval, not registration
    await this.prisma.wallet.create({
      data: { userId, balance: 0 },
    });
  }

  /**
   * Credits 1000 points when a profile is approved.
   * Only fires for the user's 1st and 2nd approved profiles.
   * Atomic $transaction prevents race conditions.
   */
  async creditProfileBonus(userId: string): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const approvedCount = await tx.candidateProfile.count({
        where: { userId, status: 'APPROVED' },
      });

      if (approvedCount > 2) return; // 3rd profile onwards — no bonus

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) return;

      const ordinal = approvedCount === 1 ? '1st' : '2nd';

      await tx.wallet.update({
        where: { userId },
        data:  { balance: { increment: PROFILE_APPROVAL_BONUS } },
      });

      await tx.pointTransaction.create({
        data: {
          walletId:    wallet.id,
          amount:      PROFILE_APPROVAL_BONUS,
          type:        TransactionType.SIGNUP_BONUS,
          note:        `${ordinal} profile approval bonus`,
        },
      });
    });

    await this.audit.log({
      entityType: 'wallet', entityId: userId, action: 'PROFILE_BONUS_CREDITED', actorId: userId,
      metadata: { amount: PROFILE_APPROVAL_BONUS },
    });
  }

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    return wallet?.balance ?? 0;
  }

  // ── Listing unlock ──────────────────────────────────────────────────────────

  async isListingUnlocked(userId: string, listingId: string): Promise<boolean> {
    const record = await this.prisma.listingUnlock.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    return !!record;
  }

  /**
   * Atomically deducts UNLOCK_COST points and creates the unlock record.
   * Idempotent — if already unlocked, returns the existing record without deducting again.
   */
  async unlockListing(userId: string, listingId: string) {
    // Idempotency check outside the transaction to avoid unnecessary locking
    const existing = await this.prisma.listingUnlock.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) return { alreadyUnlocked: true, balance: await this.getBalance(userId) };

    const result = await this.prisma.$transaction(async tx => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < UNLOCK_COST) {
        throw new BadRequestException(
          `Insufficient points. You need ${UNLOCK_COST} points but have ${wallet.balance}.`,
        );
      }

      const listing = await tx.jobListing.findUnique({ where: { id: listingId } });
      if (listing.postedById === userId) {
        throw new BadRequestException('You cannot unlock your own listing.');
      }
      if (!listing) throw new NotFoundException('Listing not found');

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data:  { balance: { decrement: UNLOCK_COST } },
      });

      await tx.listingUnlock.create({ data: { userId, listingId } });

      await tx.pointTransaction.create({
        data: {
          walletId:    wallet.id,
          amount:      -UNLOCK_COST,
          type:        TransactionType.JOB_UNLOCK,
          referenceId: listingId,
          note:        `Unlocked: ${listing.title}`,
        },
      });

      return { balance: updatedWallet.balance };
    });

    await this.audit.log({
      entityType: 'wallet', entityId: userId, action: 'LISTING_UNLOCKED',
      actorId: userId, metadata: { listingId, pointsDeducted: UNLOCK_COST, newBalance: result.balance },
    });

    return { alreadyUnlocked: false, balance: result.balance, lowBalance: result.balance <= LOW_BALANCE_THRESHOLD };
  }

  // ── Profile unlock (recruiter viewing candidate) ────────────────────────────

  async isProfileUnlocked(userId: string, profileId: string): Promise<boolean> {
    const record = await this.prisma.profileUnlock.findUnique({
      where: { userId_profileId: { userId, profileId } },
    });
    return !!record;
  }

  async unlockProfile(userId: string, profileId: string) {
    const existing = await this.prisma.profileUnlock.findUnique({
      where: { userId_profileId: { userId, profileId } },
    });
    if (existing) return { alreadyUnlocked: true, balance: await this.getBalance(userId) };

    const result = await this.prisma.$transaction(async tx => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < UNLOCK_COST) {
        throw new BadRequestException(
          `Insufficient points. You need ${UNLOCK_COST} points but have ${wallet.balance}.`,
        );
      }

      const profile = await tx.candidateProfile.findUnique({ where: { id: profileId } });
      if (!profile) throw new NotFoundException('Profile not found');

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data:  { balance: { decrement: UNLOCK_COST } },
      });

      await tx.profileUnlock.create({ data: { userId, profileId } });

      await tx.pointTransaction.create({
        data: {
          walletId:    wallet.id,
          amount:      -UNLOCK_COST,
          type:        TransactionType.PROFILE_UNLOCK,
          referenceId: profileId,
          note:        `Unlocked candidate: ${profile.fullName}`,
        },
      });

      return { balance: updatedWallet.balance };
    });

    await this.audit.log({
      entityType: 'wallet', entityId: userId, action: 'PROFILE_UNLOCKED',
      actorId: userId, metadata: { profileId, pointsDeducted: UNLOCK_COST, newBalance: result.balance },
    });

    return { alreadyUnlocked: false, balance: result.balance, lowBalance: result.balance <= LOW_BALANCE_THRESHOLD };
  }

  // ── Top-up (called by PaymentsService after webhook captures) ──────────────

  async topUp(userId: string, points: number, paymentId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const updated = await this.prisma.$transaction(async tx => {
      const w = await tx.wallet.update({
        where: { userId },
        data:  { balance: { increment: points } },
      });
      await tx.pointTransaction.create({
        data: {
          walletId:    wallet.id,
          amount:      points,
          type:        TransactionType.TOPUP,
          referenceId: paymentId,
          note:        `Razorpay top-up — ₹${points}`,
        },
      });
      return w;
    });

    return updated.balance;
  }

  // ── Batch unlock status (used by frontend to show locked/unlocked state) ───

  async listingUnlockStatus(userId: string, listingIds: string[]): Promise<Record<string, boolean>> {
    const unlocks = await this.prisma.listingUnlock.findMany({
      where: { userId, listingId: { in: listingIds } },
      select: { listingId: true },
    });
    const unlocked = new Set(unlocks.map(u => u.listingId));
    return Object.fromEntries(listingIds.map(id => [id, unlocked.has(id)]));
  }

  async profileUnlockStatus(userId: string, profileIds: string[]): Promise<Record<string, boolean>> {
    const unlocks = await this.prisma.profileUnlock.findMany({
      where: { userId, profileId: { in: profileIds } },
      select: { profileId: true },
    });
    const unlocked = new Set(unlocks.map(u => u.profileId));
    return Object.fromEntries(profileIds.map(id => [id, unlocked.has(id)]));
  }

  // ── Transaction history ─────────────────────────────────────────────────────

  async getTransactions(userId: string, rawPage?: string, rawLimit?: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.pointTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: p.skip, take: p.limit,
      }),
      this.prisma.pointTransaction.count({ where: { walletId: wallet.id } }),
    ]);
    return paginate(data, total, p);
  }
}