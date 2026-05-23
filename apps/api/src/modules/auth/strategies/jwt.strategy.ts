import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../../../config/app-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly auth: AuthService, config: AppConfigService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.jwtSecret });
  }
  async validate(payload: { sub: string }) {
    const user = await this.auth.validateUser(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
