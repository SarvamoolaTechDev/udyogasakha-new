import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../../config/app-config.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '../../../common/user-role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly auth:   AuthService,
    private readonly prisma: PrismaService,
    config: AppConfigService,
  ) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.jwtSecret });
  }

  async validate(payload: { sub: string; isAdmin?: boolean }) {
    // ── Admin portal token ────────────────────────────────────────────────────
    // Tokens issued by AdminAuthService carry isAdmin:true and a sub that is
    // an AdminUser.id. Validate against admin_users table, never user table.
    if (payload.isAdmin) {
      const admin = await this.prisma.adminUser.findUnique({
        where:  { id: payload.sub },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
      if (!admin || !admin.isActive) throw new UnauthorizedException();
      // Return shape compatible with existing @Roles() guards
      return { id: admin.id, email: admin.email, name: admin.name, roles: [admin.role] as UserRole[], isAdmin: true };
    }

    // ── Main platform token ────────────────────────────────────────────────────
    const user = await this.auth.validateUser(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
