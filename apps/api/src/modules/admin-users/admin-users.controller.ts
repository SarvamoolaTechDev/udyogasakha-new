import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService, CreateAdminUserDto, UpdateAdminUserDto } from './admin-users.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';
import { Roles, RolesGuard } from '../../common/guards/auth.guards';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ResetPasswordDto {
  @ApiProperty() @IsString() @MinLength(8) newPassword: string;
}

@ApiTags('Admin Users')
@Controller('admin-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')          // only ADMIN role can manage other admins
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly svc: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all admin users and moderators' })
  list() {
    return this.svc.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin user or moderator' })
  create(@Body() dto: CreateAdminUserDto, @CurrentUser('id') adminId: string) {
    return this.svc.create(dto, adminId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin user (name, role, active status)' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto, @CurrentUser('id') adminId: string) {
    return this.svc.update(id, dto, adminId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an admin user' })
  remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.svc.remove(id, adminId);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset an admin user\'s password (ADMIN only)' })
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.svc.resetPassword(id, dto.newPassword);
  }
}
