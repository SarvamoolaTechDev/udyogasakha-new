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
const prisma_service_1 = require("../../prisma/prisma.service");
const app_config_service_1 = require("../../config/app-config.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, audit) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.audit = audit;
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
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map