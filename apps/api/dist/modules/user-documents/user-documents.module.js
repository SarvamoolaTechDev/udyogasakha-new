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
exports.UserDocumentsModule = exports.UserDocumentsController = exports.UserDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const platform_express_2 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const common_2 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_interface_1 = require("../../common/storage/storage.interface");
const auth_guards_1 = require("../../common/guards/auth.guards");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
let UserDocumentsService = class UserDocumentsService {
    constructor(prisma, audit, storage) {
        this.prisma = prisma;
        this.audit = audit;
        this.storage = storage;
    }
    async upload(userId, documentType, file) {
        if (file.size > MAX_SIZE)
            throw new common_1.BadRequestException('File too large — maximum 10 MB');
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
    async listForUser(userId) {
        const docs = await this.prisma.userDocument.findMany({ where: { userId }, orderBy: { uploadedAt: 'desc' } });
        return docs.map(d => ({ ...d, url: this.storage.getUrl(d.storageKey) }));
    }
    async delete(docId, userId) {
        const doc = await this.prisma.userDocument.findFirst({ where: { id: docId, userId } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        await this.storage.delete(doc.storageKey);
        await this.audit.log({ entityType: 'user_document', entityId: docId, action: 'DELETED', actorId: userId });
        return this.prisma.userDocument.delete({ where: { id: docId } });
    }
    // Moderator: list all pending verification docs for a user
    async listForVerification(userId) {
        const docs = await this.prisma.userDocument.findMany({ where: { userId, verifiedAt: null }, orderBy: { uploadedAt: 'desc' } });
        return docs.map(d => ({ ...d, url: this.storage.getUrl(d.storageKey) }));
    }
};
exports.UserDocumentsService = UserDocumentsService;
exports.UserDocumentsService = UserDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(storage_interface_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService, Object])
], UserDocumentsService);
let UserDocumentsController = class UserDocumentsController {
    constructor(svc) {
        this.svc = svc;
    }
    upload(userId, docType, file) {
        return this.svc.upload(userId, docType, file);
    }
    list(userId) {
        return this.svc.listForUser(userId);
    }
    delete(id, userId) {
        return this.svc.delete(id, userId);
    }
    listForModerator(userId) {
        return this.svc.listForVerification(userId);
    }
};
exports.UserDocumentsController = UserDocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a KYC / identity document (replaces existing of same type)' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_2.Body)('documentType')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], UserDocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my identity documents with download URLs' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserDocumentsController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an identity document' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserDocumentsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] List all unverified documents for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserDocumentsController.prototype, "listForModerator", null);
exports.UserDocumentsController = UserDocumentsController = __decorate([
    (0, swagger_1.ApiTags)('User Documents (KYC)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('user-documents'),
    __metadata("design:paramtypes", [UserDocumentsService])
], UserDocumentsController);
let UserDocumentsModule = class UserDocumentsModule {
};
exports.UserDocumentsModule = UserDocumentsModule;
exports.UserDocumentsModule = UserDocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [platform_express_2.MulterModule.register({ storage: (0, multer_1.memoryStorage)() })],
        controllers: [UserDocumentsController],
        providers: [UserDocumentsService],
        exports: [UserDocumentsService],
    })
], UserDocumentsModule);
//# sourceMappingURL=user-documents.module.js.map