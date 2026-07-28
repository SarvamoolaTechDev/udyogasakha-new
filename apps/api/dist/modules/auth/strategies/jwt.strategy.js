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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const auth_service_1 = require("../auth.service");
const app_config_service_1 = require("../../../config/app-config.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(auth, prisma, config) {
        super({ jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.jwtSecret });
        this.auth = auth;
        this.prisma = prisma;
    }
    async validate(payload) {
        // ── Admin portal token ────────────────────────────────────────────────────
        // Tokens issued by AdminAuthService carry isAdmin:true and a sub that is
        // an AdminUser.id. Validate against admin_users table, never user table.
        if (payload.isAdmin) {
            const admin = await this.prisma.adminUser.findUnique({
                where: { id: payload.sub },
                select: { id: true, email: true, name: true, role: true, isActive: true },
            });
            if (!admin || !admin.isActive)
                throw new common_1.UnauthorizedException();
            // Return shape compatible with existing @Roles() guards
            return { id: admin.id, email: admin.email, name: admin.name, roles: [admin.role], isAdmin: true };
        }
        // ── Main platform token ────────────────────────────────────────────────────
        const user = await this.auth.validateUser(payload.sub);
        if (!user)
            throw new common_1.UnauthorizedException();
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        prisma_service_1.PrismaService,
        app_config_service_1.AppConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map