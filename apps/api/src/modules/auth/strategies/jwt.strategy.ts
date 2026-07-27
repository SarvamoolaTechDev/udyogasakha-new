import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserRole } from '@prisma/client';
import { AppConfigService } from '../../../../config/app-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly auth: AuthService, config: AppConfigService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.jwtSecret });
  }
  async validate(payload: { sub: string }) {
    const user = await this.auth.validateUser(payload.sub);
    if (!user) throw new UnauthorizedException();
    // Cast roles: MySQL Json column returns runtime array, TS type is JsonValue
    return { ...user, roles: (user.roles ?? []) as UserRole[] };
  }
}
