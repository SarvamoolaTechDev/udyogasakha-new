import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../common/guards/auth.guards';
import { UserRole } from '@prisma/client';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get('recent')
  @ApiOperation({ summary: '[Admin] Most recent platform-wide audit entries' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecent(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getRecent(page, limit);
  }

  @Get('entity/:type/:id')
  @ApiOperation({ summary: '[Admin] Audit log for a specific entity' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getForEntity(
    @Param('type') type: string,
    @Param('id')   id:   string,
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getForEntity(type, id, page, limit);
  }

  @Get('actor/:id')
  @ApiOperation({ summary: '[Admin] All actions performed by a specific actor' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getForActor(
    @Param('id')    actorId: string,
    @Query('page')  page?:   string,
    @Query('limit') limit?:  string,
  ) {
    return this.svc.getForActor(actorId, page, limit);
  }
}
