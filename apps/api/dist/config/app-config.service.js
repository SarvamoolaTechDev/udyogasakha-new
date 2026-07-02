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
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    constructor(c) {
        this.c = c;
    }
    get port() { return this.c.get('PORT', 3001); }
    get nodeEnv() { return this.c.get('NODE_ENV', 'development'); }
    get isProduction() { return this.nodeEnv === 'production'; }
    get jwtSecret() { return this.c.getOrThrow('JWT_SECRET'); }
    get jwtExpiresIn() { return this.c.get('JWT_EXPIRES_IN', '15m'); }
    get jwtRefreshSecret() { return this.c.getOrThrow('JWT_REFRESH_SECRET'); }
    get jwtRefreshExpires() { return this.c.get('JWT_REFRESH_EXPIRES_IN', '7d'); }
    get allowedOrigins() { return (this.c.get('ALLOWED_ORIGINS', 'http://localhost:3000')).split(',').map(s => s.trim()); }
    get redisUrl() { return this.c.get('REDIS_URL', 'redis://localhost:6379'); }
    // ⚠️ Defaults to enabled. Set ENABLE_SWAGGER=false in Railway env vars before real public launch.
    get enableSwagger() { return this.c.get('ENABLE_SWAGGER', 'true') === 'true'; }
    get webUrl() { return this.c.get('WEB_URL', 'http://localhost:3000'); }
    // ── Azure Communication Service (email) ─────────────────────────────────────
    // If unset, EmailService logs to console instead of sending — see EmailService.
    get azureCommunicationConnectionString() {
        return this.c.get('AZURE_COMMUNICATION_CONNECTION_STRING', '');
    }
    get azureEmailSenderAddress() {
        return this.c.get('AZURE_EMAIL_SENDER_ADDRESS', 'DoNotReply@udyogasakha.in');
    }
    // ── Razorpay ─────────────────────────────────────────────────────────────────
    // Standard Checkout surfaces UPI, Cards, Netbanking, Wallets, EMI and Pay
    // Later automatically based on what's enabled in the Razorpay Dashboard —
    // nothing here restricts payment method. International cards require a
    // separate activation step with Razorpay (KYC + business documents).
    get razorpayKeyId() { return this.c.get('RAZORPAY_KEY_ID', ''); }
    get razorpayKeySecret() { return this.c.get('RAZORPAY_KEY_SECRET', ''); }
    get razorpayWebhookSecret() { return this.c.get('RAZORPAY_WEBHOOK_SECRET', ''); }
    get razorpayConfigured() { return !!(this.razorpayKeyId && this.razorpayKeySecret); }
    // ── File Storage ─────────────────────────────────────────────────────────────
    // 'local' (default) → LocalStorageAdapter, files on disk — fine for dev,
    // but ephemeral on most PaaS hosts (Railway included — wiped on redeploy).
    // 'azure' → AzureBlobStorageAdapter — persistent, needs AZURE_STORAGE_* below.
    get storageProvider() {
        return this.c.get('STORAGE_PROVIDER', 'local');
    }
    get azureStorageConnectionString() {
        return this.c.get('AZURE_STORAGE_CONNECTION_STRING', '');
    }
    get azureStorageContainerName() {
        return this.c.get('AZURE_STORAGE_CONTAINER_NAME', 'udyogasakha-documents');
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map