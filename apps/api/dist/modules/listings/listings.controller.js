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
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const listings_service_1 = require("./listings.service");
const listing_dto_1 = require("./dto/listing.dto");
const update_listing_dto_1 = require("./dto/update-listing.dto");
const auth_guards_1 = require("../../common/guards/auth.guards");
const client_1 = require("@prisma/client");
let ListingsController = class ListingsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(dto, userId) {
        return this.svc.create(dto, userId);
    }
    findAll(search, role, market, mode, paid, cert, page, limit) {
        return this.svc.findAll({ search, role, market, mode, paid, cert, page: +page, limit: +limit });
    }
    getPending(page, limit) {
        return this.svc.findPending(page, limit);
    }
    findOne(id) {
        return this.svc.findById(id);
    }
    getSimilar(id, role) {
        return this.svc.findSimilar(id, role);
    }
    async update(id, userId, dto) {
        try {
            return await this.svc.update(id, userId, dto);
        }
        catch (e) {
            if (e.message?.startsWith('Forbidden'))
                throw new common_1.ForbiddenException(e.message);
            if (e.message?.startsWith('Cannot'))
                throw new common_1.BadRequestException(e.message);
            throw e;
        }
    }
    approve(id, modId) {
        return this.svc.approve(id, modId);
    }
    reject(id, modId, dto) {
        return this.svc.reject(id, modId, dto.reason);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Post a job / RFP — enters moderation queue' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_dto_1.CreateListingDto, String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Browse approved listings with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'market', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'mode', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'paid', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'cert', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('market')),
    __param(3, (0, common_1.Query)('mode')),
    __param(4, (0, common_1.Query)('paid')),
    __param(5, (0, common_1.Query)('cert')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Paginated pending listings' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single listing by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/similar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get similar listings for the same role type' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getSimilar", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Edit a pending or rejected listing (poster only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Approve a listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Reject a listing with a reason' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, listing_dto_1.RejectListingDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "reject", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listings_service_1.ListingsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map