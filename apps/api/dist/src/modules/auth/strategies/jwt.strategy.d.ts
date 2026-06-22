import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../../../config/app-config.service';
declare const JwtStrategy_base: new (...args: any[]) => InstanceType<typeof Strategy>;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly auth;
    constructor(auth: AuthService, config: AppConfigService);
    validate(payload: {
        sub: string;
    }): unknown;
}
export {};
