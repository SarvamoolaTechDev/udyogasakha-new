import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';

// AuditService is provided globally via @Global() AuditModule — no explicit import needed here.
@Module({ controllers: [ListingsController], providers: [ListingsService], exports: [ListingsService] })
export class ListingsModule {}
