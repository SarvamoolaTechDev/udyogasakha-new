import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../../config/app-config.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '../../../common/user-role.enum';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly auth;
    private readonly prisma;
    constructor(auth: AuthService, prisma: PrismaService, config: AppConfigService);
    validate(payload: {
        sub: string;
        isAdmin?: boolean;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string | null;
        emailVerified: boolean;
        emailVerifyToken: string | null;
        emailVerifyExpiry: Date | null;
        passwordHash: string;
        roles: import("@prisma/client/runtime/library").JsonValue;
    } | {
        id: string;
        email: string;
        name: string;
        roles: UserRole[];
        isAdmin: boolean;
    }>;
}
export {};
