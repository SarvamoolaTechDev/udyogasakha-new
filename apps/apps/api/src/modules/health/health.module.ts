import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@SkipThrottle()   // Health probes from k8s / load balancers must never hit rate limits
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe — always 200 if process is up' })
  liveness() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks PostgreSQL connection' })
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', db: 'connected', ts: new Date().toISOString() };
    } catch {
      return { status: 'not_ready', db: 'disconnected', ts: new Date().toISOString() };
    }
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
