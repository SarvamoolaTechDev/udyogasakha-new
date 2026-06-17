import {
  Injectable, BadRequestException, NotFoundException,
  Controller, Post, Delete, Get, Param,
  UploadedFile, UseInterceptors, UseGuards,
  Module, Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Body } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IStorageService, STORAGE_SERVICE } from '../../common/storage/storage.interface';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guards';
import { UserDocumentType, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class UserDocumentsService {
  constructor(
    private readonly prisma:   PrismaService,
    private readonly audit:    AuditService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async upload(userId: string, documentType: UserDocumentType, file: Express.Multer.File) {
    if (file.size > MAX_SIZE) throw new BadRequestException('File too large — maximum 10 MB');

    const storageKey = await this.storage.upload(file.originalname, file.buffer, file.mimetype);

    // One document per type per user — replace existing
    const existing = await this.prisma.userDocument.findFirst({ where: { userId, documentType } });
    if (existing) {
      await this.storage.delete(existing.storageKey);
      await this.prisma.userDocument.delete({ where: { id: existing.id } });
    }

    const doc = await this.prisma.userDocument.create({
      data: { userId, documentType, filename: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, storageKey },
    });

    await this.audit.log({ entityType: 'user_document', entityId: doc.id, action: 'UPLOADED', actorId: userId, newState: { documentType, filename: file.originalname } });
    return { ...doc, url: this.storage.getUrl(doc.storageKey) };
  }

  async listForUser(userId: string) {
    const docs = await this.prisma.userDocument.findMany({ where: { userId }, orderBy: { uploadedAt: 'desc' } });
    return docs.map(d => ({ ...d, url: this.storage.getUrl(d.storageKey) }));
  }

  async delete(docId: string, userId: string) {
    const doc = await this.prisma.userDocument.findFirst({ where: { id: docId, userId } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.storage.delete(doc.storageKey);
    await this.audit.log({ entityType: 'user_document', entityId: docId, action: 'DELETED', actorId: userId });
    return this.prisma.userDocument.delete({ where: { id: docId } });
  }

  // Moderator: list all pending verification docs for a user
  async listForVerification(userId: string) {
    const docs = await this.prisma.userDocument.findMany({ where: { userId, verifiedAt: null }, orderBy: { uploadedAt: 'desc' } });
    return docs.map(d => ({ ...d, url: this.storage.getUrl(d.storageKey) }));
  }
}

@ApiTags('User Documents (KYC)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-documents')
export class UserDocumentsController {
  constructor(private readonly svc: UserDocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a KYC / identity document (replaces existing of same type)' })
  upload(
    @CurrentUser('id') userId: string,
    @Body('documentType') docType: UserDocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.upload(userId, docType, file);
  }

  @Get()
  @ApiOperation({ summary: 'List my identity documents with download URLs' })
  list(@CurrentUser('id') userId: string) {
    return this.svc.listForUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an identity document' })
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.delete(id, userId);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: '[Moderator] List all unverified documents for a user' })
  listForModerator(@Param('userId') userId: string) {
    return this.svc.listForVerification(userId);
  }
}

@Module({
  imports:     [MulterModule.register({ storage: memoryStorage() })],
  controllers: [UserDocumentsController],
  providers:   [UserDocumentsService],
  exports:     [UserDocumentsService],
})
export class UserDocumentsModule {}
