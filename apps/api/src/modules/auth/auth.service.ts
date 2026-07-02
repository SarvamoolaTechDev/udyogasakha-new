import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly jwt:     JwtService,
    private readonly config:  AppConfigService,
    private readonly audit:   AuditService,
    private readonly notify:  NotificationsService,
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

  /**
   * Generates a one-time reset token, emails the link, and always returns
   * the same generic message — regardless of whether the email exists.
   * This prevents attackers from using this endpoint to enumerate valid
   * registered email addresses.
   */
  async forgotPassword(email: string) {
    const genericResponse = { message: 'If an account exists with that email, a reset link has been sent.' };

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return genericResponse;

    // Invalidate any previously-issued, still-unused tokens for this user first
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    const rawToken  = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId:    user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.notify.send({
      userId:  user.id,
      subject: 'Reset your Udyoga Sakha password',
      body:    'Click the link to set a new password. This link expires in 1 hour. If you did not request this, you can safely ignore this email.',
      link:    `/reset-password?token=${rawToken}`,
      email:   user.email,
    });

    await this.audit.log({
      entityType: 'auth', entityId: user.id, action: 'PASSWORD_RESET_REQUESTED', actorId: user.id,
    });

    return genericResponse;
  }

  /**
   * Validates the raw token against its stored hash, checks expiry/used state,
   * sets the new password, and revokes all existing sessions (refresh tokens)
   * so the reset takes effect everywhere immediately.
   */
  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired. Please request a new one.');
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: hash } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      this.prisma.refreshToken.updateMany({ where: { userId: resetToken.userId }, data: { used: true } }),
    ]);

    await this.audit.log({
      entityType: 'auth', entityId: resetToken.userId, action: 'PASSWORD_RESET_COMPLETED', actorId: resetToken.userId,
    });

    return { message: 'Password reset successfully. Please log in with your new password.' };
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

    // Security alert — if the user didn't initiate this, they need to act immediately
    await this.notify.send({
      userId,
      subject: 'Your password was changed',
      body:    [
        'Your Sarvamoola Udyoga Sakha account password was just changed.',
        'All existing sessions have been signed out.',
        '',
        'If you made this change, no action is needed.',
        'If you did NOT change your password, please reset it immediately using the "Forgot password?" link on the sign-in page.',
      ].join('\n'),
      link:  '/forgot-password',
      email: user.email,
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
