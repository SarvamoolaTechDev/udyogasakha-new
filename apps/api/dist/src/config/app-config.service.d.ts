import { ConfigService } from '@nestjs/config';
export declare class AppConfigService {
    private readonly c;
    constructor(c: ConfigService);
    get port(): number;
    get nodeEnv(): string;
    get isProduction(): boolean;
    get jwtSecret(): Exclude<T, undefined>;
    get jwtExpiresIn(): string;
    get jwtRefreshSecret(): Exclude<T, undefined>;
    get jwtRefreshExpires(): string;
    get allowedOrigins(): any;
    get redisUrl(): string;
}
