import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const statusCode = ctx.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(map(data => ({ data, statusCode, timestamp: new Date().toISOString() })));
  }
}
