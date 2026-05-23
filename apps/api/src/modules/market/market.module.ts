import { Controller, Get, Query, UseGuards, Module } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MarketService } from './market.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../common/guards/auth.guards';
import { UserRole } from '@prisma/client';

@ApiTags('Market')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
@Controller('market')
export class MarketController {
  constructor(private readonly svc: MarketService) {}

  @Get('stats')
  @ApiOperation({ summary: '[Moderator] Market mapping statistics' })
  getStats() { return this.svc.getStats(); }

  @Get('by-role')
  @ApiOperation({ summary: '[Moderator] Approved profiles grouped by role type' })
  getByRole() { return this.svc.getByRole(); }

  @Get('all-approved')
  @ApiOperation({ summary: '[Moderator] Paginated approved profiles for market view' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllApproved(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getAllApproved(page, limit);
  }
}

@Module({ controllers: [MarketController], providers: [MarketService] })
export class MarketModule {}
