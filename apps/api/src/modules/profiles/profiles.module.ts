import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

// AuditService is provided globally via @Global() AuditModule — no explicit import needed here.
@Module({ controllers: [ProfilesController], providers: [ProfilesService], exports: [ProfilesService] })
export class ProfilesModule {}
