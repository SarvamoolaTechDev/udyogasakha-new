import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService, Period } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/auth.guards';
import { Roles, RolesGuard } from '../../common/guards/auth.guards';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MODERATOR', 'ADMIN')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Full analytics dashboard data' })
  @ApiQuery({ name: 'period', enum: ['24h', 'week', 'month', 'all'], required: false })
  getDashboard(@Query('period') period?: string) {
    const validPeriods: Period[] = ['24h', 'week', 'month', 'all'];
    const p: Period = validPeriods.includes(period as Period) ? (period as Period) : 'month';
    return this.svc.getDashboard(p);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Per-day transaction breakdown for the last N days' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back (default 30)' })
  getDailyTransactions(@Query('days') days?: string) {
    const n = Math.min(Math.max(parseInt(days ?? '30', 10) || 30, 1), 90);
    return this.svc.getDailyTransactions(n);
  }
}
