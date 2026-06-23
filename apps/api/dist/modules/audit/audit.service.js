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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/pagination");
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    /**
     * Append an immutable audit entry.
     * Failures are caught and logged — a failed audit write must never
     * cause the originating operation to fail.
     */
    async log(params) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    entityType: params.entityType,
                    entityId: params.entityId,
                    action: params.action,
                    actorId: params.actorId ?? null,
                    actorEmail: params.actorEmail ?? null,
                    oldState: params.oldState ?? undefined,
                    newState: params.newState ?? undefined,
                    metadata: params.metadata ?? undefined,
                },
            });
        }
        catch (err) {
            // Log the failure but never propagate — audit must not break core flows
            this.logger.error(`Audit log write failed: ${params.entityType}/${params.entityId} ${params.action}`, err instanceof Error ? err.stack : String(err));
        }
    }
    // ── Read endpoints — moderator / admin only ─────────────────────────────
    /**
     * All audit entries for a specific entity (e.g. all events on listing X).
     * Returns newest-first, paginated.
     */
    async getForEntity(entityType, entityId, rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit, 100);
        const where = { entityType, entityId };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({ where, orderBy: { ts: 'desc' }, skip: p.skip, take: p.limit }),
            this.prisma.auditLog.count({ where }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    /**
     * All audit entries performed by a specific actor (e.g. all actions by moderator X).
     * Returns newest-first, paginated.
     */
    async getForActor(actorId, rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit, 100);
        const where = { actorId };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({ where, orderBy: { ts: 'desc' }, skip: p.skip, take: p.limit }),
            this.prisma.auditLog.count({ where }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    /**
     * Recent platform-wide audit entries, useful for the admin dashboard.
     */
    async getRecent(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit, 50);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({ orderBy: { ts: 'desc' }, skip: p.skip, take: p.limit }),
            this.prisma.auditLog.count(),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map