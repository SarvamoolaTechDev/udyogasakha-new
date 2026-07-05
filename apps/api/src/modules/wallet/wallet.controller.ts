import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';
import { PaymentsService } from '../payments/payments.service';
import { IsIn, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Top-up amounts in rupees (1 rupee = 1 point)
const TOPUP_TIERS = [500, 1000, 2000, 5000];

class TopUpOrderDto {
  @ApiProperty({ description: 'Rupees to add (must be 500/1000/2000/5000 or custom ≤5000)', example: 1000 })
  @IsInt()
  @Min(100)
  @Max(5000)
  amount: number; // in rupees
}

class UnlockStatusDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  ids?: string[];
}

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(
    private readonly wallet:   WalletService,
    private readonly payments: PaymentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get my wallet balance and last 20 transactions' })
  getWallet(@CurrentUser('id') userId: string) {
    return this.wallet.getWallet(userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get my current point balance only (lightweight)' })
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.wallet.getBalance(userId);
    return { balance };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Full paginated transaction history' })
  @ApiQuery({ name: 'page',  required: false })
  @ApiQuery({ name: 'limit', required: false })
  getTransactions(
    @CurrentUser('id') userId: string,
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    return this.wallet.getTransactions(userId, page, limit);
  }

  @Post('unlock-listing/:listingId')
  @ApiOperation({ summary: 'Unlock a job listing\'s contact details (deducts 30 points). Idempotent.' })
  unlockListing(@CurrentUser('id') userId: string, @Param('listingId') listingId: string) {
    return this.wallet.unlockListing(userId, listingId);
  }

  @Post('unlock-profile/:profileId')
  @ApiOperation({ summary: 'Unlock a candidate profile\'s contact details (deducts 30 points). Idempotent.' })
  unlockProfile(@CurrentUser('id') userId: string, @Param('profileId') profileId: string) {
    return this.wallet.unlockProfile(userId, profileId);
  }

  @Post('unlock-status/listings')
  @ApiOperation({ summary: 'Batch check which listing IDs are already unlocked by this user' })
  listingUnlockStatus(@CurrentUser('id') userId: string, @Body() dto: { ids: string[] }) {
    return this.wallet.listingUnlockStatus(userId, dto.ids ?? []);
  }

  @Post('unlock-status/profiles')
  @ApiOperation({ summary: 'Batch check which profile IDs are already unlocked by this user' })
  profileUnlockStatus(@CurrentUser('id') userId: string, @Body() dto: { ids: string[] }) {
    return this.wallet.profileUnlockStatus(userId, dto.ids ?? []);
  }

  /**
   * Creates a Razorpay order for a wallet top-up.
   * Accepted amounts: 500, 1000, 2000, 5000, or any custom amount up to 5000.
   * 1 rupee = 1 point — the points are credited in PaymentsService.applyPurposeSideEffect()
   * when the webhook fires payment.captured.
   */
  @Post('topup/create-order')
  @ApiOperation({ summary: 'Create a Razorpay order for wallet top-up. Points credited after payment captured.' })
  async createTopUpOrder(@CurrentUser('id') userId: string, @Body() dto: TopUpOrderDto) {
    return this.payments.createOrder(userId, {
      purpose:  'WALLET_TOPUP' as any,
      amount:   dto.amount,
      currency: 'INR',
    });
  }
}
