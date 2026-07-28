import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminUserDto {
  @ApiProperty()                            @IsEmail()              email:    string;
  @ApiProperty()                            @IsString()             name:     string;
  @ApiProperty()          @MinLength(8)     @IsString()             password: string;
  @ApiPropertyOptional({ enum: AdminRole }) @IsEnum(AdminRole) @IsOptional() role?: AdminRole;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional() @IsString()  @IsOptional() name?:     string;
  @ApiPropertyOptional() @IsOptional()              isActive?: boolean;
  @ApiPropertyOptional({ enum: AdminRole }) @IsEnum(AdminRole) @IsOptional() role?: AdminRole;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, createdById: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateAdminUserDto, createdById: string) {
    const existing = await this.prisma.adminUser.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (existing) throw new ConflictException('An admin user with this email already exists');

    const hash = await bcrypt.hash(dto.password, 12);
    return this.prisma.adminUser.create({
      data: {
        email:        dto.email.toLowerCase().trim(),
        name:         dto.name,
        passwordHash: hash,
        role:         dto.role ?? AdminRole.MODERATOR,
        createdById,
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateAdminUserDto, requestingAdminId: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin user not found');

    // Prevent self-deactivation
    if (dto.isActive === false && id === requestingAdminId) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    return this.prisma.adminUser.update({
      where: { id },
      data:  dto,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
  }

  async remove(id: string, requestingAdminId: string) {
    if (id === requestingAdminId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const admin = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin user not found');

    await this.prisma.adminUser.delete({ where: { id } });
    return { message: 'Admin user removed' };
  }

  async resetPassword(id: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.adminUser.update({ where: { id }, data: { passwordHash: hash } });
    return { message: 'Password reset successfully' };
  }
}
