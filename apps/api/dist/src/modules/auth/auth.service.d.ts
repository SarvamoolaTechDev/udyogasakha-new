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
    }): unknown;
    login(dto: {
        email: string;
        password: string;
    }): unknown;
    refresh(userId: string, token: string): unknown;
    changePassword(userId: string, currentPassword: string, newPassword: string): unknown;
    logout(userId: string): any;
    validateUser(userId: string): unknown;
    private issue;
}
