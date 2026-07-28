import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class AdminLoginDto {
  @ApiProperty() @IsEmail()   email:    string;
  @ApiProperty() @IsString()  password: string;
}

class AdminChangePasswordDto {
  @ApiProperty() @IsString()             currentPassword: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword:   string;
}

@ApiTags('Admin Auth')
@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly svc: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin portal login — validates against admin_users table' })
  login(@Body() dto: AdminLoginDto) {
    return this.svc.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin user info' })
  me(@CurrentUser('id') adminId: string) {
    return this.svc.me(adminId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change admin password' })
  changePassword(@CurrentUser('id') adminId: string, @Body() dto: AdminChangePasswordDto) {
    return this.svc.changePassword(adminId, dto.currentPassword, dto.newPassword);
  }
}
