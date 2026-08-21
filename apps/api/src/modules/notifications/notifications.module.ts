import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './notifications.processor';
import { QUEUES } from '../../common/queues';
import { EmailService } from '../../common/email/email.service';

// @Global() so NotificationsService can be injected anywhere (e.g. ProfilesService)
// without each consuming module needing to import NotificationsModule.
@Global()
@Module({
  imports: [
    ...(process.env.REDIS_URL ? [BullModule.registerQueue({ name: QUEUES.NOTIFICATIONS })] : []),
  ],
  controllers: [NotificationsController],
  providers:   [NotificationsService, NotificationsProcessor, EmailService],
  exports:     [NotificationsService],
})
export class NotificationsModule {}
