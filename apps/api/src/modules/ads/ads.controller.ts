import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdsService, CreateAdDto } from './ads.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';

@ApiTags('Ads')
@Controller('ads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdsController {
  constructor(private readonly svc: AdsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse active ads (any logged-in user)' })
  @ApiQuery({ name: 'search',      required: false })
  @ApiQuery({ name: 'workMode',    required: false })
  @ApiQuery({ name: 'marketField', required: false })
  @ApiQuery({ name: 'page',        required: false })
  @ApiQuery({ name: 'limit',       required: false })
  browse(
    @CurrentUser('id') userId: string,
    @Query('search')      search?:      string,
    @Query('workMode')    workMode?:    string,
    @Query('marketField') marketField?: string,
    @Query('page')        page?:        string,
    @Query('limit')       limit?:       string,
  ) {
    return this.svc.browse(userId, { search, workMode, marketField, page: Number(page)||1, limit: Number(limit)||18 });
  }

  @Get('mine')
  @ApiOperation({ summary: 'My ads — full stats including views and contact unlocks' })
  getMine(@CurrentUser('id') userId: string) {
    return this.svc.getMine(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View a single ad (records view automatically)' })
  findById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.findById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ad (Job Seeker with approved profile only, max 2 active)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateAdDto) {
    return this.svc.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit your ad' })
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: Partial<CreateAdDto>) {
    return this.svc.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your ad (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.remove(id, userId);
  }

  @Post(':id/extend')
  @ApiOperation({ summary: 'Extend ad by 30 days (costs 30 points)' })
  extend(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.extend(id, userId);
  }

  @Post(':id/unlock-contact')
  @ApiOperation({ summary: 'Unlock ad contact details (costs 30 points, permanent)' })
  unlockContact(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.unlockContact(id, userId);
  }
}
