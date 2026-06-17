import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly jwt:     JwtService,
    private readonly config:  AppConfigService,
    private readonly audit:   AuditService,
  ) {}

  async register(dto: { email: string; password: string; name: string; phone?: string }) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash: hash, roles: [UserRole.PARTICIPANT] },
    });

    // Create account-level profile and trust stub in the same transaction
    await this.prisma.$transaction([
      this.prisma.userProfile.create({
        data: { userId: user.id, fullName: dto.name, participantType: 'INDIVIDUAL' },
      }),
      this.prisma.trustRecord.create({
        data: { userId: user.id, currentLevel: 'L0' },
      }),
    ]);

    await this.audit.log({
      entityType: 'user',
      entityId:   user.id,
      action:     'REGISTERED',
      actorId:    user.id,
      actorEmail: user.email,
      newState:   { email: user.email, name: user.name, roles: user.roles },
    });

    return this.issue(user);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      // Log failed attempt — don't expose whether the email exists
      await this.audit.log({
        entityType: 'auth',
        entityId:   dto.email,
        action:     'LOGIN_FAILED',
        metadata:   { email: dto.email },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.audit.log({
      entityType: 'auth',
      entityId:   user.id,
      action:     'LOGIN',
      actorId:    user.id,
      actorEmail: user.email,
    });

    return this.issue(user);
  }

  async refresh(userId: string, token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.userId !== userId || stored.used || stored.expiresAt < new Date()) {
      // Possible replay attack — revoke all tokens and log it
      await this.prisma.refreshToken.updateMany({ where: { userId }, data: { used: true } });
      await this.audit.log({
        entityType: 'auth',
        entityId:   userId,
        action:     'REFRESH_TOKEN_REPLAY_SUSPECTED',
        actorId:    userId,
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { used: true } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.issue(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

    // Revoke all refresh tokens — force re-login on all devices
    await this.prisma.refreshToken.updateMany({ where: { userId }, data: { used: true } });

    await this.audit.log({
      entityType: 'auth', entityId: userId, action: 'PASSWORD_CHANGED', actorId: userId,
    });

    return { message: 'Password changed. Please log in again.' };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId }, data: { used: true } });
    await this.audit.log({
      entityType: 'auth',
      entityId:   userId,
      action:     'LOGOUT',
      actorId:    userId,
    });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  private async issue(user: { id: string; roles: UserRole[] }) {
    const payload = { sub: user.id, roles: user.roles };
    const accessToken  = this.jwt.sign(payload, { expiresIn: this.config.jwtExpiresIn,      secret: this.config.jwtSecret });
    const refreshToken = this.jwt.sign(payload, { expiresIn: this.config.jwtRefreshExpires, secret: this.config.jwtRefreshSecret });
    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    return { accessToken, refreshToken, expiresIn: 900 };
  }
}
