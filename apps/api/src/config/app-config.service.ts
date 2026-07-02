import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly c: ConfigService) {}
  get port()              { return this.c.get<number>('PORT', 3001); }
  get nodeEnv()           { return this.c.get<string>('NODE_ENV', 'development'); }
  get isProduction()      { return this.nodeEnv === 'production'; }
  get jwtSecret()         { return this.c.getOrThrow<string>('JWT_SECRET'); }
  get jwtExpiresIn()      { return this.c.get<string>('JWT_EXPIRES_IN', '15m'); }
  get jwtRefreshSecret()  { return this.c.getOrThrow<string>('JWT_REFRESH_SECRET'); }
  get jwtRefreshExpires() { return this.c.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'); }
  get allowedOrigins()    { return (this.c.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')).split(',').map(s => s.trim()); }
  get redisUrl()          { return this.c.get<string>('REDIS_URL', 'redis://localhost:6379'); }
  // ⚠️ Defaults to enabled. Set ENABLE_SWAGGER=false in Railway env vars before real public launch.
  get enableSwagger()     { return this.c.get<string>('ENABLE_SWAGGER', 'true') === 'true'; }
  get webUrl()            { return this.c.get<string>('WEB_URL', 'http://localhost:3000'); }

  // ── Azure Communication Service (email) ─────────────────────────────────────
  // If unset, EmailService logs to console instead of sending — see EmailService.
  get azureCommunicationConnectionString() {
    return this.c.get<string>('AZURE_COMMUNICATION_CONNECTION_STRING', '');
  }
  get azureEmailSenderAddress() {
    return this.c.get<string>('AZURE_EMAIL_SENDER_ADDRESS', 'DoNotReply@udyogasakha.in');
  }

  // ── Razorpay ─────────────────────────────────────────────────────────────────
  // Standard Checkout surfaces UPI, Cards, Netbanking, Wallets, EMI and Pay
  // Later automatically based on what's enabled in the Razorpay Dashboard —
  // nothing here restricts payment method. International cards require a
  // separate activation step with Razorpay (KYC + business documents).
  get razorpayKeyId()        { return this.c.get<string>('RAZORPAY_KEY_ID', ''); }
  get razorpayKeySecret()    { return this.c.get<string>('RAZORPAY_KEY_SECRET', ''); }
  get razorpayWebhookSecret(){ return this.c.get<string>('RAZORPAY_WEBHOOK_SECRET', ''); }
  get razorpayConfigured()   { return !!(this.razorpayKeyId && this.razorpayKeySecret); }

  // ── File Storage ─────────────────────────────────────────────────────────────
  // 'local' (default) → LocalStorageAdapter, files on disk — fine for dev,
  // but ephemeral on most PaaS hosts (Railway included — wiped on redeploy).
  // 'azure' → AzureBlobStorageAdapter — persistent, needs AZURE_STORAGE_* below.
  get storageProvider() {
    return this.c.get<string>('STORAGE_PROVIDER', 'local');
  }
  get azureStorageConnectionString() {
    return this.c.get<string>('AZURE_STORAGE_CONNECTION_STRING', '');
  }
  get azureStorageContainerName() {
    return this.c.get<string>('AZURE_STORAGE_CONTAINER_NAME', 'udyogasakha-documents');
  }

  // ── Meilisearch ──────────────────────────────────────────────────────────────
  // Point MEILISEARCH_URL at your Meilisearch instance regardless of where
  // it's hosted (local Docker, Azure Container Instance, Azure Container Apps).
  // The code is identical in all cases — only this URL changes.
  get meilisearchUrl()       { return this.c.get<string>('MEILISEARCH_URL',        'http://localhost:7700'); }
  get meilisearchMasterKey() { return this.c.get<string>('MEILISEARCH_MASTER_KEY', ''); }
  get meilisearchEnabled()   { return !!this.meilisearchUrl; }
}
