import {
  Injectable, ExecutionContext, createParamDecorator,
  SetMetadata, CanActivate, UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) throw err ?? new UnauthorizedException('Authentication required');
    return user;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required?.length) return true;
    const user = ctx.switchToHttp().getRequest().user;
    return required.some(r => (user?.roles ?? []).includes(r));
  }
}

export const CurrentUser = createParamDecorator((field: string | undefined, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest().user;
  return field ? user?.[field] : user;
});
