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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/pagination");
const audit_service_1 = require("../audit/audit.service");
const SAFE_SELECT = {
    id: true, email: true, name: true, phone: true,
    city: true, roles: true, createdAt: true, updatedAt: true,
};
let UsersService = class UsersService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async getMe(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateMe(id, dto) {
        const before = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        const after = await this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });
        await this.audit.log({
            entityType: 'user', entityId: id, action: 'PROFILE_UPDATED', actorId: id,
            oldState: { name: before?.name, phone: before?.phone, city: before?.city },
            newState: { name: after.name, phone: after.phone, city: after.city },
        });
        return after;
    }
    async findAll(search, rawPage, rawLimit) {
        const p = (0, pagination_1.parsePage)(rawPage, rawLimit);
        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ],
        } : {};
        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({ where, select: SAFE_SELECT, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_1.paginate)(data, total, p);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { ...SAFE_SELECT, profiles: { select: { roleType: true, status: true, submittedAt: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map