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
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string | null;
        passwordHash: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string | null;
        updatedAt: Date;
    }>;
}
export {};
