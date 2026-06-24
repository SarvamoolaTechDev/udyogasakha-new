import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../../config/app-config.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly auth;
    constructor(auth: AuthService, config: AppConfigService);
    validate(payload: {
        sub: string;
    }): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        passwordHash: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
