import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

// @Global() so AuditService can be injected anywhere without re-importing the module
@Global()
@Module({
  controllers: [AuditController],
  providers:   [AuditService],
  exports:     [AuditService],
})
export class AuditModule {}
