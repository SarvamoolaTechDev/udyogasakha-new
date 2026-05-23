import {
  Injectable, BadRequestException, NotFoundException,
  Controller, Post, Delete, Get, Param,
  UploadedFile, UseInterceptors, UseGuards, Body,
  Module, Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaService } from '../../prisma/prisma.service';
import { IStorageService, STORAGE_SERVICE } from '../../common/storage/storage.interface';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';
import { DocumentType } from '@prisma/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async upload(profileId: string, documentType: DocumentType, file: Express.Multer.File) {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large — maximum 10 MB allowed');
    }

    // Upload via the storage abstraction
    const storageKey = await this.storage.upload(file.originalname, file.buffer, file.mimetype);

    // Replace existing document of the same type for this profile (one per type)
    const existing = await this.prisma.candidateDocument.findFirst({ where: { profileId, documentType } });
    if (existing) {
      await this.storage.delete(existing.storageKey);
      await this.prisma.candidateDocument.delete({ where: { id: existing.id } });
    }

    return this.prisma.candidateDocument.create({
      data: {
        profileId,
        documentType,
        filename:   file.originalname,
        mimeType:   file.mimetype,
        sizeBytes:  file.size,
        storageKey,
      },
    });
  }

  async getForProfile(profileId: string) {
    const docs = await this.prisma.candidateDocument.findMany({
      where:   { profileId },
      orderBy: { uploadedAt: 'desc' },
    });

    // Attach a download URL to each document
    return docs.map(d => ({ ...d, url: this.storage.getUrl(d.storageKey) }));
  }

  async deleteDoc(docId: string, userId: string) {
    const doc = await this.prisma.candidateDocument.findFirst({
      where:   { id: docId },
      include: { profile: true },
    });
    if (!doc || doc.profile.userId !== userId) {
      throw new NotFoundException('Document not found');
    }

    await this.storage.delete(doc.storageKey);
    return this.prisma.candidateDocument.delete({ where: { id: docId } });
  }
}

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @Post(':profileId/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document for a profile (replaces existing of same type)' })
  upload(
    @Param('profileId') profileId:   string,
    @Body('documentType') docType:   DocumentType,
    @UploadedFile() file:            Express.Multer.File,
  ) {
    return this.svc.upload(profileId, docType, file);
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'List all documents for a profile (includes download URLs)' })
  getForProfile(@Param('profileId') profileId: string) {
    return this.svc.getForProfile(profileId);
  }

  @Delete(':docId')
  @ApiOperation({ summary: 'Delete a document (must be the owner)' })
  deleteDoc(@Param('docId') docId: string, @CurrentUser('id') userId: string) {
    return this.svc.deleteDoc(docId, userId);
  }
}

@Module({
  imports:     [MulterModule.register({ storage: memoryStorage() })],
  controllers: [DocumentsController],
  providers:   [DocumentsService],
})
export class DocumentsModule {}
