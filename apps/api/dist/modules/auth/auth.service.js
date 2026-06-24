"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_config_service_1 = require("../../config/app-config.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, audit, notify) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.audit = audit;
        this.notify = notify;
    }
    async register(dto) {
        if (await this.prisma.user.findUnique({ where: { email: dto.email } })) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash: hash, roles: [client_1.UserRole.PARTICIPANT] },
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
            entityId: user.id,
            action: 'REGISTERED',
            actorId: user.id,
            actorEmail: user.email,
            newState: { email: user.email, name: user.name, roles: user.roles },
        });
        return this.issue(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            // Log failed attempt — don't expose whether the email exists
            await this.audit.log({
                entityType: 'auth',
                entityId: dto.email,
                action: 'LOGIN_FAILED',
                metadata: { email: dto.email },
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.audit.log({
            entityType: 'auth',
            entityId: user.id,
            action: 'LOGIN',
            actorId: user.id,
            actorEmail: user.email,
        });
        return this.issue(user);
    }
    async refresh(userId, token) {
        const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
        if (!stored || stored.userId !== userId || stored.used || stored.expiresAt < new Date()) {
            // Possible replay attack — revoke all tokens and log it
            await this.prisma.refreshToken.updateMany({ where: { userId }, data: { used: true } });
            await this.audit.log({
                entityType: 'auth',
                entityId: userId,
                action: 'REFRESH_TOKEN_REPLAY_SUSPECTED',
                actorId: userId,
            });
            throw new common_1.UnauthorizedException('Invalid refresh token');
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
    async forgotPassword(email) {
        const genericResponse = { message: 'If an account exists with that email, a reset link has been sent.' };
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return genericResponse;
        // Invalidate any previously-issued, still-unused tokens for this user first
        await this.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        });
        await this.notify.send({
            userId: user.id,
            subject: 'Reset your Udyoga Sakha password',
            body: 'Click the link to set a new password. This link expires in 1 hour. If you did not request this, you can safely ignore this email.',
            link: `/reset-password?token=${rawToken}`,
            email: user.email,
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
    async resetPassword(rawToken, newPassword) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
        if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('This reset link is invalid or has expired. Please request a new one.');
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
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const hash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
        // Revoke all refresh tokens — force re-login on all devices
        await this.prisma.refreshToken.updateMany({ where: { userId }, data: { used: true } });
        await this.audit.log({
            entityType: 'auth', entityId: userId, action: 'PASSWORD_CHANGED', actorId: userId,
        });
        return { message: 'Password changed. Please log in again.' };
    }
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({ where: { userId }, data: { used: true } });
        await this.audit.log({
            entityType: 'auth',
            entityId: userId,
            action: 'LOGOUT',
            actorId: userId,
        });
    }
    async validateUser(userId) {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }
    async issue(user) {
        const payload = { sub: user.id, roles: user.roles };
        const accessToken = this.jwt.sign(payload, { expiresIn: this.config.jwtExpiresIn, secret: this.config.jwtSecret });
        const refreshToken = this.jwt.sign(payload, { expiresIn: this.config.jwtRefreshExpires, secret: this.config.jwtRefreshSecret });
        await this.prisma.refreshToken.create({
            data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        });
        return { accessToken, refreshToken, expiresIn: 900 };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        app_config_service_1.AppConfigService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map