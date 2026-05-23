import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto, RejectListingDto } from './dto/listing.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { UserRole } from '@prisma/client';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly svc: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a job / RFP — enters moderation queue' })
  create(@Body() dto: CreateListingDto, @CurrentUser('id') userId: string) {
    return this.svc.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Browse approved listings with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role',   required: false })
  @ApiQuery({ name: 'market', required: false })
  @ApiQuery({ name: 'mode',   required: false })
  @ApiQuery({ name: 'paid',   required: false })
  @ApiQuery({ name: 'cert',   required: false })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  findAll(
    @Query('search') search?: string,
    @Query('role')   role?:   string,
    @Query('market') market?: string,
    @Query('mode')   mode?:   string,
    @Query('paid')   paid?:   string,
    @Query('cert')   cert?:   string,
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
  ) {
    return this.svc.findAll({ search, role, market, mode, paid, cert, page: +page!, limit: +limit! });
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Moderator] Paginated pending listings' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findPending(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single listing by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar listings for the same role type' })
  getSimilar(@Param('id') id: string, @Query('role') role: string) {
    return this.svc.findSimilar(id, role);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Moderator] Approve a listing' })
  approve(@Param('id') id: string, @CurrentUser('id') modId: string) {
    return this.svc.approve(id, modId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Moderator] Reject a listing with a reason' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') modId: string,
    @Body() dto: RejectListingDto,
  ) {
    return this.svc.reject(id, modId, dto.reason);
  }
}
