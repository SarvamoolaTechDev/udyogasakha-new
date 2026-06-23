import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly audit;
    constructor(prisma: PrismaService, jwt: JwtService, config: AppConfigService, audit: AuditService);
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
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    logout(userId: string): Promise<void>;
    validateUser(userId: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        passwordHash: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private issue;
}
