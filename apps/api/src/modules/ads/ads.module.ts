import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports:     [WalletModule, NotificationsModule],
  controllers: [AdsController],
  providers:   [AdsService],
  exports:     [AdsService],
})
export class AdsModule {}
