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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/pagination");
let MarketService = class MarketService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        // $queryRaw avoids the Prisma groupBy circular-type-reference TS error (Prisma bug)
        const [profiles, listings] = await this.prisma.$transaction([
            this.prisma.$queryRaw `
        SELECT market_field AS "marketField", status, COUNT(*)::int AS count
        FROM candidate_profiles
        GROUP BY market_field, status
      `,
            this.prisma.$queryRaw `
        SELECT market_field AS "marketField", status, COUNT(*)::int AS count
        FROM job_listings
        GROUP BY market_field, status
      `,
        ]);
        const sum = (rows, field, status) => rows
            .filter(r => r.marketField === field && (status === undefined || r.status === status))
            .reduce((s, r) => s + Number(r.count), 0);
        return {
            profilesByMarket: {
                IT_FIELD: sum(profiles, client_1.MarketField.IT_FIELD, client_1.ProfileStatus.APPROVED),
                NON_IT_FIELD: sum(profiles, client_1.MarketField.NON_IT_FIELD, client_1.ProfileStatus.APPROVED),
                SERVICES: sum(profiles, client_1.MarketField.SERVICES, client_1.ProfileStatus.APPROVED),
            },
            listingsByMarket: {
                IT_FIELD: sum(listings, client_1.MarketField.IT_FIELD, client_1.ProfileStatus.APPROVED),
                NON_IT_FIELD: sum(listings, client_1.MarketField.NON_IT_FIELD, client_1.ProfileStatus.APPROVED),
                SERVICES: sum(listings, client_1.MarketField.SERVICES, client_1.ProfileStatus.APPROVED),
            },
            total: {
                pending: profiles.filter(r => r.status === client_1.ProfileStatus.PENDING).reduce((s, r) => s + Number(r.count), 0),
                approved: profiles.filter(r => r.status === client_1.ProfileStatus.APPROVED).reduce((s, r) => s + Number(r.count), 0),
                rejected: profiles.filter(r => r.status === client_1.ProfileStatus.REJECTED).reduce((s, r) => s + Number(r.count), 0),
            },
        };
    }
    async getByRole() {
        // $queryRaw for the same reason — groupBy by: ['roleType'] also triggers the Prisma TS bug
        const rows = await this.prisma.$queryRaw `
      SELECT role_type AS "roleType", COUNT(*)::int AS count
      FROM candidate_profiles
      WHERE status = 'APPROVED'
      GROUP BY role_type
      ORDER BY count DESC
    `;
        return rows.map(r => ({ role: r.roleType, count: Number(r.count) }));
    }
    async getAllApproved(rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit, 100);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.candidateProfile.findMany({
                where: { status: client_1.ProfileStatus.APPROVED },
                select: {
                    id: true, fullName: true, roleType: true,
                    appliedFor: true, appliedAt: true,
                    marketField: true, marketSegment: true,
                    workMode: true, certificate: true,
                    employmentOption: true, submittedAt: true,
                    user: { select: { email: true } },
                },
                orderBy: { reviewedAt: 'desc' },
                skip: p.skip,
                take: p.limit,
            }),
            this.prisma.candidateProfile.count({ where: { status: client_1.ProfileStatus.APPROVED } }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketService);
//# sourceMappingURL=market.service.js.map