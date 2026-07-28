import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (c: ConfigService) => ({ secret: c.getOrThrow('JWT_SECRET') }),
    }),
  ],
  controllers: [AdminAuthController],
  providers:   [AdminAuthService],
  exports:     [AdminAuthService],
})
export class AdminAuthModule {}
