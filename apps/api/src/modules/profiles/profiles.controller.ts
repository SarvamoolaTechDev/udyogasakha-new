import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpsertProfileDto, AddExperienceDto, ApproveProfileDto, RejectProfileDto } from './dto/profile.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { UserRole } from '@prisma/client';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly svc: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update candidate profile for a role' })
  upsert(@CurrentUser('id') userId: string, @Body() dto: UpsertProfileDto) {
    return this.svc.upsert(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'All my profiles across all roles' })
  getMine(@CurrentUser('id') userId: string) {
    return this.svc.getMyProfiles(userId);
  }

  @Get('me/:roleType')
  @ApiOperation({ summary: 'My profile for a specific role' })
  getMineByRole(@CurrentUser('id') userId: string, @Param('roleType') rt: string) {
    return this.svc.getMyByRole(userId, rt);
  }

  @Post('me/:roleType/experience')
  @ApiOperation({ summary: 'Add an experience entry to a role profile' })
  addExp(
    @CurrentUser('id') userId: string,
    @Param('roleType') rt: string,
    @Body() dto: AddExperienceDto,
  ) {
    return this.svc.addExperience(userId, rt, dto);
  }

  @Delete('experience/:id')
  @ApiOperation({ summary: 'Delete an experience entry' })
  delExp(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.svc.deleteExperience(userId, id);
  }

  // ── Moderator routes ──────────────────────────────────────────────────────

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Paginated pending profiles' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getPending(page, limit);
  }

  @Get('approved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Paginated approved profiles' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getApproved(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getApproved(page, limit);
  }

  @Get('rejected')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Paginated rejected profiles' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRejected(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getRejected(page, limit);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Approve a profile with market field assignment' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') modId: string,
    @Body() dto: ApproveProfileDto,
  ) {
    return this.svc.approve(id, modId, dto.marketField);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Reject a profile with a reason' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') modId: string,
    @Body() dto: RejectProfileDto,
  ) {
    return this.svc.reject(id, modId, dto.reason);
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Re-open a rejected profile for re-review' })
  reactivate(@Param('id') id: string) {
    return this.svc.reactivate(id);
  }
}
