import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { StorageModule } from './common/storage/storage.module';
import { EmailModule } from './common/email/email.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MarketModule } from './modules/market/market.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { UserDocumentsModule } from './modules/user-documents/user-documents.module';
import { VerificationModule } from './modules/verification/verification.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SearchModule }   from './modules/search/search.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Global rate limit: 60 req / 60 s per IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    // BullMQ — Redis connection shared by all queues
    BullModule.forRootAsync({
      imports:    [AppConfigModule],
      inject:     [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        redis: cfg.redisUrl,
        defaultJobOptions: {
          attempts:         3,
          backoff:          { type: 'exponential', delay: 2000 },
          removeOnComplete: 200,
          removeOnFail:     500,
        },
      }),
    }),

    PrismaModule,
    AppConfigModule,

    // @Global() modules — services injectable everywhere without re-importing
    StorageModule,
    EmailModule,
    AuditModule,
    NotificationsModule,

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    ProfilesModule,
    MarketModule,
    DocumentsModule,
    UserDocumentsModule,
    VerificationModule,
    ReportsModule,
    PaymentsModule,
    SearchModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
