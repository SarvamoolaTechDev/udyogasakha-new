"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = exports.DocumentsController = exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const platform_express_2 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_interface_1 = require("../../common/storage/storage.interface");
const auth_guards_1 = require("../../common/guards/auth.guards");
const client_1 = require("@prisma/client");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
let DocumentsService = class DocumentsService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async upload(profileId, documentType, file) {
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File too large — maximum 10 MB allowed');
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
                filename: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                storageKey,
            },
        });
    }
    async getForProfile(profileId) {
        const docs = await this.prisma.candidateDocument.findMany({
            where: { profileId },
            orderBy: { uploadedAt: 'desc' },
        });
        // Attach a download URL to each document
        return docs.map(d => ({ ...d, url: this.storage.getUrl(d.storageKey) }));
    }
    async deleteDoc(docId, userId) {
        const doc = await this.prisma.candidateDocument.findFirst({
            where: { id: docId },
            include: { profile: true },
        });
        if (!doc || doc.profile.userId !== userId) {
            throw new common_1.NotFoundException('Document not found');
        }
        await this.storage.delete(doc.storageKey);
        return this.prisma.candidateDocument.delete({ where: { id: docId } });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(storage_interface_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], DocumentsService);
let DocumentsController = class DocumentsController {
    constructor(svc) {
        this.svc = svc;
    }
    upload(profileId, docType, file) {
        return this.svc.upload(profileId, docType, file);
    }
    getForProfile(profileId) {
        return this.svc.getForProfile(profileId);
    }
    deleteDoc(docId, userId) {
        return this.svc.deleteDoc(docId, userId);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(':profileId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document for a profile (replaces existing of same type)' }),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Body)('documentType')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':profileId'),
    (0, swagger_1.ApiOperation)({ summary: 'List all documents for a profile (includes download URLs)' }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getForProfile", null);
__decorate([
    (0, common_1.Delete)(':docId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a document (must be the owner)' }),
    __param(0, (0, common_1.Param)('docId')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "deleteDoc", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [DocumentsService])
], DocumentsController);
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [platform_express_2.MulterModule.register({ storage: (0, multer_1.memoryStorage)() })],
        controllers: [DocumentsController],
        providers: [DocumentsService],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map