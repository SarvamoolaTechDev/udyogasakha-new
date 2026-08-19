import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports:     [WalletModule],
  controllers: [ProfilesController],
  providers:   [ProfilesService],
  exports:     [ProfilesService],
})
export class ProfilesModule {}