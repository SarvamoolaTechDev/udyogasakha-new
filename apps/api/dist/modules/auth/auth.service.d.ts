import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WalletService } from '../wallet/wallet.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly audit;
    private readonly notify;
    private readonly wallet;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, config: AppConfigService, audit: AuditService, notify: NotificationsService, wallet: WalletService);
    register(dto: {
        email: string;
        password: string;
        name: string;
        phone?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    sendVerificationEmail(userId: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    refresh(userId: string, token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * Generates a one-time reset token, emails the link, and always returns
     * the same generic message — regardless of whether the email exists.
     * This prevents attackers from using this endpoint to enumerate valid
     * registered email addresses.
     */
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    /**
     * Validates the raw token against its stored hash, checks expiry/used state,
     * sets the new password, and revokes all existing sessions (refresh tokens)
     * so the reset takes effect everywhere immediately.
     */
    resetPassword(rawToken: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    logout(userId: string): Promise<void>;
    validateUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        emailVerified: boolean;
        emailVerifyToken: string | null;
        emailVerifyExpiry: Date | null;
        phone: string;
        passwordHash: string;
        roles: import("@prisma/client/runtime/library").JsonValue;
        city: string | null;
        updatedAt: Date;
    }>;
    private issue;
}
