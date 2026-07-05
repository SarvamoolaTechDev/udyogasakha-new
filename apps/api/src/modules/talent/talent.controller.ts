import { Controller, Get, Param, Query, UseGuards, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TalentService } from './talent.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';

@ApiTags('Talent')
@Controller('talent')
export class TalentController {
  constructor(private readonly svc: TalentService) {}

  /**
   * Browse approved candidate profiles — teaser only, no contact info.
   * Auth required: recruiters and hiring managers are the primary audience.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Browse approved candidate profiles (teaser — no contact details)' })
  @ApiQuery({ name: 'search',        required: false })
  @ApiQuery({ name: 'roleType',      required: false })
  @ApiQuery({ name: 'marketField',   required: false })
  @ApiQuery({ name: 'marketSegment', required: false })
  @ApiQuery({ name: 'workMode',      required: false })
  @ApiQuery({ name: 'page',          required: false, type: Number })
  @ApiQuery({ name: 'limit',         required: false, type: Number })
  browse(
    @Query('search')        search?:        string,
    @Query('roleType')      roleType?:      string,
    @Query('marketField')   marketField?:   string,
    @Query('marketSegment') marketSegment?: string,
    @Query('workMode')      workMode?:      string,
    @Query('page')          page?:          string,
    @Query('limit')         limit?:         string,
  ) {
    return this.svc.browse({ search, roleType, marketField, marketSegment, workMode, page: Number(page)||1, limit: Number(limit)||20 });
  }

  @Get(':profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single approved candidate profile (teaser)' })
  findById(@Param('profileId') profileId: string) {
    return this.svc.findById(profileId);
  }

  @Get(':profileId/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full contact details for an unlocked candidate. Call POST /wallet/unlock-profile/:id first.' })
  getDetails(@Param('profileId') profileId: string, @CurrentUser('id') userId: string) {
    return this.svc.getDetails(profileId, userId);
  }
}
