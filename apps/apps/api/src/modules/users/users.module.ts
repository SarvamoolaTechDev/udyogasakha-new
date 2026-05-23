import { Controller, Get, Patch, Param, Body, Query, UseGuards, Module } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user (no password hash)' })
  getMe(@CurrentUser('id') id: string) {
    return this.svc.getMe(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my name, phone, city' })
  updateMe(@CurrentUser('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.updateMe(id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Paginated list of all users' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  findAll(
    @Query('search') search?: string,
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
  ) {
    return this.svc.findAll(search, page, limit);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Get a user by ID with their profile statuses' })
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}

@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}
