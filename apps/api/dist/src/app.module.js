"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const bull_1 = require("@nestjs/bull");
const prisma_module_1 = require("./prisma/prisma.module");
const app_config_module_1 = require("./config/app-config.module");
const app_config_service_1 = require("./config/app-config.service");
const storage_module_1 = require("./common/storage/storage.module");
const http_logger_middleware_1 = require("./common/middleware/http-logger.middleware");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const listings_module_1 = require("./modules/listings/listings.module");
const profiles_module_1 = require("./modules/profiles/profiles.module");
const market_module_1 = require("./modules/market/market.module");
const documents_module_1 = require("./modules/documents/documents.module");
const user_documents_module_1 = require("./modules/user-documents/user-documents.module");
const verification_module_1 = require("./modules/verification/verification.module");
const reports_module_1 = require("./modules/reports/reports.module");
const health_module_1 = require("./modules/health/health.module");
const audit_module_1 = require("./modules/audit/audit.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(http_logger_middleware_1.HttpLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            // Global rate limit: 60 req / 60 s per IP
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
            // BullMQ — Redis connection shared by all queues
            bull_1.BullModule.forRootAsync({
                imports: [app_config_module_1.AppConfigModule],
                inject: [app_config_service_1.AppConfigService],
                useFactory: (cfg) => ({
                    redis: cfg.redisUrl,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 2000 },
                        removeOnComplete: 200,
                        removeOnFail: 500,
                    },
                }),
            }),
            prisma_module_1.PrismaModule,
            app_config_module_1.AppConfigModule,
            // @Global() modules — services injectable everywhere without re-importing
            storage_module_1.StorageModule,
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
            // Feature modules
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            listings_module_1.ListingsModule,
            profiles_module_1.ProfilesModule,
            market_module_1.MarketModule,
            documents_module_1.DocumentsModule,
            user_documents_module_1.UserDocumentsModule,
            verification_module_1.VerificationModule,
            reports_module_1.ReportsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map