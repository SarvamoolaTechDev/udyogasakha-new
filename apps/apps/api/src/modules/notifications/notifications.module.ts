import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './notifications.processor';
import { QUEUES } from '../../common/queues';

// @Global() so NotificationsService can be injected anywhere (e.g. ProfilesService)
// without each consuming module needing to import NotificationsModule.
@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.NOTIFICATIONS }),
  ],
  controllers: [NotificationsController],
  providers:   [NotificationsService, NotificationsProcessor],
  exports:     [NotificationsService],
})
export class NotificationsModule {}
