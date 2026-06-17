import {
  Injectable, NotFoundException,
  Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { AuditService } from '../audit/audit.service';
import { ReportStatus, ReportSubjectType, UserRole } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

class SubmitReportDto {
  @ApiProperty({ enum: ReportSubjectType })
  @IsEnum(ReportSubjectType)
  subjectType: ReportSubjectType;

  @ApiProperty({ example: 'uuid-of-the-reported-entity' })
  @IsString() @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'Misleading information in listing' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  reason: string;

  @ApiPropertyOptional({ example: 'The salary listed is fabricated. I confirmed with the company directly.' })
  @IsOptional() @IsString() @MaxLength(2000)
  detail?: string;
}

class ResolveReportDto {
  @ApiProperty({ example: 'Listing reviewed and corrected by the poster.' })
  @IsString() @IsNotEmpty() @MaxLength(1000)
  resolution: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  async submit(reporterId: string, dto: SubmitReportDto) {
    const report = await this.prisma.report.create({
      data: { reporterId, subjectType: dto.subjectType, subjectId: dto.subjectId, reason: dto.reason, detail: dto.detail },
    });
    await this.audit.log({ entityType: 'report', entityId: report.id, action: 'SUBMITTED', actorId: reporterId, newState: { subjectType: dto.subjectType, reason: dto.reason } });
    return report;
  }

  async getMyReports(reporterId: string) {
    return this.prisma.report.findMany({ where: { reporterId }, orderBy: { createdAt: 'desc' } });
  }

  async getPending(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where:   { status: ReportStatus.PENDING },
        include: { reporter: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'asc' },
        skip: p.skip, take: p.limit,
      }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
    ]);
    return paginate(data, total, p);
  }

  async resolve(id: string, modId: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    const updated = await this.prisma.report.update({
      where: { id },
      data: { status: ReportStatus.RESOLVED, resolution: dto.resolution, resolvedBy: modId, resolvedAt: new Date() },
    });
    await this.audit.log({ entityType: 'report', entityId: id, action: 'RESOLVED', actorId: modId, metadata: { resolution: dto.resolution } });
    return updated;
  }

  async dismiss(id: string, modId: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    const updated = await this.prisma.report.update({
      where: { id },
      data: { status: ReportStatus.DISMISSED, resolution: dto.resolution, resolvedBy: modId, resolvedAt: new Date() },
    });
    await this.audit.log({ entityType: 'report', entityId: id, action: 'DISMISSED', actorId: modId });
    return updated;
  }
}

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an abuse or misconduct report' })
  submit(@CurrentUser('id') userId: string, @Body() dto: SubmitReportDto) {
    return this.svc.submit(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my submitted reports' })
  getMy(@CurrentUser('id') userId: string) {
    return this.svc.getMyReports(userId);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Paginated pending reports queue' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getPending(page, limit);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Resolve a report' })
  resolve(@Param('id') id: string, @CurrentUser('id') modId: string, @Body() dto: ResolveReportDto) {
    return this.svc.resolve(id, modId, dto);
  }

  @Patch(':id/dismiss')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Dismiss a report as invalid' })
  dismiss(@Param('id') id: string, @CurrentUser('id') modId: string, @Body() dto: ResolveReportDto) {
    return this.svc.dismiss(id, modId, dto);
  }
}

@Module({ controllers: [ReportsController], providers: [ReportsService] })
export class ReportsModule {}
