import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly jwt:     JwtService,
    private readonly config:  AppConfigService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // isAdmin: true in payload tells JwtStrategy to validate against admin_users table
    // roles array uses the same string values as UserRole so existing @Roles() guards work
    const payload = {
      sub:     admin.id,
      email:   admin.email,
      roles:   [admin.role],   // 'ADMIN' or 'MODERATOR'
      isAdmin: true,
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });

    return {
      accessToken,
      admin: {
        id:    admin.id,
        email: admin.email,
        name:  admin.name,
        role:  admin.role,
      },
    };
  }

  async me(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where:  { id: adminId },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    if (!admin) throw new UnauthorizedException();
    return admin;
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data:  { passwordHash: hash },
    });

    return { message: 'Password changed successfully' };
  }
}
