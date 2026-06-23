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
exports.ReportsModule = exports.ReportsController = exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_guards_1 = require("../../common/guards/auth.guards");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/pagination");
class SubmitReportDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ enum: client_1.ReportSubjectType }),
    (0, class_validator_1.IsEnum)(client_1.ReportSubjectType),
    __metadata("design:type", String)
], SubmitReportDto.prototype, "subjectType", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'uuid-of-the-reported-entity' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitReportDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Misleading information in listing' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SubmitReportDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'The salary listed is fabricated. I confirmed with the company directly.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SubmitReportDto.prototype, "detail", void 0);
class ResolveReportDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Listing reviewed and corrected by the poster.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], ResolveReportDto.prototype, "resolution", void 0);
let ReportsService = class ReportsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async submit(reporterId, dto) {
        const report = await this.prisma.report.create({
            data: { reporterId, subjectType: dto.subjectType, subjectId: dto.subjectId, reason: dto.reason, detail: dto.detail },
        });
        await this.audit.log({ entityType: 'report', entityId: report.id, action: 'SUBMITTED', actorId: reporterId, newState: { subjectType: dto.subjectType, reason: dto.reason } });
        return report;
    }
    async getMyReports(reporterId) {
        return this.prisma.report.findMany({ where: { reporterId }, orderBy: { createdAt: 'desc' } });
    }
    async getPending(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.report.findMany({
                where: { status: client_1.ReportStatus.PENDING },
                include: { reporter: { select: { email: true, name: true } } },
                orderBy: { createdAt: 'asc' },
                skip: p.skip, take: p.limit,
            }),
            this.prisma.report.count({ where: { status: client_1.ReportStatus.PENDING } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async resolve(id, modId, dto) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        const updated = await this.prisma.report.update({
            where: { id },
            data: { status: client_1.ReportStatus.RESOLVED, resolution: dto.resolution, resolvedBy: modId, resolvedAt: new Date() },
        });
        await this.audit.log({ entityType: 'report', entityId: id, action: 'RESOLVED', actorId: modId, metadata: { resolution: dto.resolution } });
        return updated;
    }
    async dismiss(id, modId, dto) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        const updated = await this.prisma.report.update({
            where: { id },
            data: { status: client_1.ReportStatus.DISMISSED, resolution: dto.resolution, resolvedBy: modId, resolvedAt: new Date() },
        });
        await this.audit.log({ entityType: 'report', entityId: id, action: 'DISMISSED', actorId: modId });
        return updated;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ReportsService);
let ReportsController = class ReportsController {
    constructor(svc) {
        this.svc = svc;
    }
    submit(userId, dto) {
        return this.svc.submit(userId, dto);
    }
    getMy(userId) {
        return this.svc.getMyReports(userId);
    }
    getPending(page, limit) {
        return this.svc.getPending(page, limit);
    }
    resolve(id, modId, dto) {
        return this.svc.resolve(id, modId, dto);
    }
    dismiss(id, modId, dto) {
        return this.svc.dismiss(id, modId, dto);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an abuse or misconduct report' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubmitReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my submitted reports' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getMy", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Paginated pending reports queue' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Resolve a report' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ResolveReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Patch)(':id/dismiss'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Dismiss a report as invalid' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ResolveReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "dismiss", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [ReportsService])
], ReportsController);
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({ controllers: [ReportsController], providers: [ReportsService] })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map