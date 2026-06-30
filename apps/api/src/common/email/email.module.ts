import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

// @Global() so EmailService can be injected anywhere (e.g. NotificationsProcessor)
// without each consuming module needing to import EmailModule.
@Global()
@Module({
  providers: [EmailService],
  exports:   [EmailService],
})
export class EmailModule {}
