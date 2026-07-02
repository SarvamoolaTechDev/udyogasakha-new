import {
  Injectable, NotFoundException, ConflictException,
  Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VerificationStatus, UserRole } from '@prisma/client';
import { parsePage, paginate } from '../../common/pagination';

class RequestVerificationDto {
  @ApiProperty({ type: [String], description: 'IDs of user_documents to include in this request' })
  @IsArray() @IsString({ each: true }) @IsNotEmpty()
  documentIds: string[];
}

class ReviewVerificationDto {
  @ApiProperty({ example: 'Documents verified successfully' })
  @IsString() @IsNotEmpty()
  reviewNote: string;
}

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly audit:   AuditService,
    private readonly notify:  NotificationsService,
  ) {}

  async requestVerification(userId: string, dto: RequestVerificationDto) {
    // Only one pending request allowed per user at a time
    const existing = await this.prisma.verificationRequest.findFirst({
      where: { userId, status: VerificationStatus.PENDING },
    });
    if (existing) throw new ConflictException('You already have a pending verification request.');

    const req = await this.prisma.verificationRequest.create({
      data: { userId, documentIds: dto.documentIds },
    });

    await this.audit.log({ entityType: 'verification', entityId: req.id, action: 'REQUESTED', actorId: userId });
    return req;
  }

  async getMyRequests(userId: string) {
    return this.prisma.verificationRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getPending(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.verificationRequest.findMany({
        where: { status: VerificationStatus.PENDING },
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'asc' },
        skip: p.skip, take: p.limit,
      }),
      this.prisma.verificationRequest.count({ where: { status: VerificationStatus.PENDING } }),
    ]);
    return paginate(data, total, p);
  }

  async approve(id: string, modId: string, dto: ReviewVerificationDto) {
    const req = await this.prisma.verificationRequest.findUnique({
      where:   { id },
      include: { user: { select: { email: true } } },
    });
    if (!req) throw new NotFoundException('Verification request not found');

    const [updated] = await this.prisma.$transaction([
      this.prisma.verificationRequest.update({
        where: { id },
        data: { status: VerificationStatus.APPROVED, reviewNote: dto.reviewNote, reviewerId: modId, reviewedAt: new Date() },
      }),
      // Mark each document as verified
      ...req.documentIds.map(docId =>
        this.prisma.userDocument.updateMany({ where: { id: docId }, data: { verifiedAt: new Date(), verifierId: modId } })
      ),
      // Upgrade trust to L1
      this.prisma.trustRecord.upsert({
        where:  { userId: req.userId },
        update: { currentLevel: 'L1', lastUpdated: new Date() },
        create: { userId: req.userId, currentLevel: 'L1' },
      }),
    ]);

    await this.audit.log({ entityType: 'verification', entityId: id, action: 'APPROVED', actorId: modId, metadata: { note: dto.reviewNote } });
    await this.notify.send({
      userId:  req.userId,
      subject: 'Identity verification approved ✅',
      body:    'Your identity documents have been verified and your trust level has been updated to L1.\n\nYou can now access additional features on the Sarvamoola Udyoga Sakha platform.',
      link:    '/settings',
      email:   (req as any).user?.email,
    });
    return updated;
  }

  async reject(id: string, modId: string, dto: ReviewVerificationDto) {
    const req = await this.prisma.verificationRequest.findUnique({
      where:   { id },
      include: { user: { select: { email: true } } },
    });
    if (!req) throw new NotFoundException('Verification request not found');

    const updated = await this.prisma.verificationRequest.update({
      where: { id },
      data: { status: VerificationStatus.REJECTED, reviewNote: dto.reviewNote, reviewerId: modId, reviewedAt: new Date() },
    });

    await this.audit.log({ entityType: 'verification', entityId: id, action: 'REJECTED', actorId: modId, metadata: { note: dto.reviewNote } });
    await this.notify.send({
      userId:  req.userId,
      subject: 'Verification request could not be approved',
      body:    `Your identity verification request could not be approved.\n\nReason: ${dto.reviewNote}\n\nPlease re-upload clearer copies of your documents and submit a new request.`,
      link:    '/settings',
      email:   (req as any).user?.email,
    });
    return updated;
  }
}

@ApiTags('Verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(private readonly svc: VerificationService) {}

  @Post('request')
  @ApiOperation({ summary: 'Submit a document verification request (L1)' })
  request(@CurrentUser('id') userId: string, @Body() dto: RequestVerificationDto) {
    return this.svc.requestVerification(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my verification request history' })
  getMy(@CurrentUser('id') userId: string) {
    return this.svc.getMyRequests(userId);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Paginated pending verification requests' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getPending(page, limit);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Approve verification request — marks docs verified, upgrades to L1' })
  approve(@Param('id') id: string, @CurrentUser('id') modId: string, @Body() dto: ReviewVerificationDto) {
    return this.svc.approve(id, modId, dto);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] Reject verification request with note' })
  reject(@Param('id') id: string, @CurrentUser('id') modId: string, @Body() dto: ReviewVerificationDto) {
    return this.svc.reject(id, modId, dto);
  }
}

@Module({ controllers: [VerificationController], providers: [VerificationService] })
export class VerificationModule {}
