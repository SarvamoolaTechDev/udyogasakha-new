import { ConfigService } from '@nestjs/config';
export declare class AppConfigService {
    private readonly c;
    constructor(c: ConfigService);
    get port(): number;
    get nodeEnv(): string;
    get isProduction(): boolean;
    get jwtSecret(): string;
    get jwtExpiresIn(): string;
    get jwtRefreshSecret(): string;
    get jwtRefreshExpires(): string;
    get allowedOrigins(): string[];
    get redisUrl(): string;
    get enableSwagger(): boolean;
    get webUrl(): string;
    get azureCommunicationConnectionString(): string;
    get azureEmailSenderAddress(): string;
    get razorpayKeyId(): string;
    get razorpayKeySecret(): string;
    get razorpayWebhookSecret(): string;
    get razorpayConfigured(): boolean;
    get storageProvider(): string;
    get azureStorageConnectionString(): string;
    get azureStorageContainerName(): string;
}
