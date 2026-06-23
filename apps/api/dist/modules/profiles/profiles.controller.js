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
exports.ProfilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const profiles_service_1 = require("./profiles.service");
const profile_dto_1 = require("./dto/profile.dto");
const auth_guards_1 = require("../../common/guards/auth.guards");
const client_1 = require("@prisma/client");
let ProfilesController = class ProfilesController {
    constructor(svc) {
        this.svc = svc;
    }
    upsert(userId, dto) {
        return this.svc.upsert(userId, dto);
    }
    getMine(userId) {
        return this.svc.getMyProfiles(userId);
    }
    getMineByRole(userId, rt) {
        return this.svc.getMyByRole(userId, rt);
    }
    addExp(userId, rt, dto) {
        return this.svc.addExperience(userId, rt, dto);
    }
    delExp(userId, id) {
        return this.svc.deleteExperience(userId, id);
    }
    // ── Moderator routes ──────────────────────────────────────────────────────
    getPending(page, limit) {
        return this.svc.getPending(page, limit);
    }
    getApproved(page, limit) {
        return this.svc.getApproved(page, limit);
    }
    getRejected(page, limit) {
        return this.svc.getRejected(page, limit);
    }
    approve(id, modId) {
        return this.svc.approve(id, modId);
    }
    reject(id, modId, dto) {
        return this.svc.reject(id, modId, dto.reason);
    }
    reactivate(id) {
        return this.svc.reactivate(id);
    }
};
exports.ProfilesController = ProfilesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update candidate profile for a role' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, profile_dto_1.UpsertProfileDto]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "upsert", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'All my profiles across all roles' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('me/:roleType'),
    (0, swagger_1.ApiOperation)({ summary: 'My profile for a specific role' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('roleType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "getMineByRole", null);
__decorate([
    (0, common_1.Post)('me/:roleType/experience'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an experience entry to a role profile' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('roleType')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, profile_dto_1.AddExperienceDto]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "addExp", null);
__decorate([
    (0, common_1.Delete)('experience/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an experience entry' }),
    __param(0, (0, auth_guards_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "delExp", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Paginated pending profiles' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('approved'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Paginated approved profiles' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "getApproved", null);
__decorate([
    (0, common_1.Get)('rejected'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Paginated rejected profiles' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "getRejected", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Approve a profile — market field already set by candidate' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Reject a profile with a reason' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guards_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, profile_dto_1.RejectProfileDto]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/reactivate'),
    (0, common_1.UseGuards)(auth_guards_1.RolesGuard),
    (0, auth_guards_1.Roles)(client_1.UserRole.MODERATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[Moderator] Re-open a rejected profile for re-review' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProfilesController.prototype, "reactivate", null);
exports.ProfilesController = ProfilesController = __decorate([
    (0, swagger_1.ApiTags)('Profiles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('profiles'),
    __metadata("design:paramtypes", [profiles_service_1.ProfilesService])
], ProfilesController);
//# sourceMappingURL=profiles.controller.js.map