import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly c: ConfigService) {}
  get port()              { return this.c.get<number>('PORT', 3001); }
  get nodeEnv()           { return this.c.get<string>('NODE_ENV', 'development'); }
  get isProduction()      { return this.nodeEnv === 'production'; }
  get jwtSecret()         { return this.c.getOrThrow<string>('JWT_SECRET'); }
  get jwtExpiresIn()      { return this.c.get<string>('JWT_EXPIRES_IN', '15m'); }
  get jwtRefreshSecret()  { return this.c.getOrThrow<string>('JWT_REFRESH_SECRET'); }
  get jwtRefreshExpires() { return this.c.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'); }
  get allowedOrigins()    { return (this.c.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')).split(',').map(s => s.trim()); }
  get redisUrl()          { return this.c.get<string>('REDIS_URL', 'redis://localhost:6379'); }
}
