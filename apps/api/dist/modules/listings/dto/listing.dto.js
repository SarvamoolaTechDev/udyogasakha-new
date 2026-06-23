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
exports.RejectListingDto = exports.CreateListingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateListingDto {
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TCS Digital' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateListingDto.prototype, "organisationName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Priya Menon' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateListingDto.prototype, "contactPerson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'hr@tcs.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543210' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateListingDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ListingType }),
    (0, class_validator_1.IsEnum)(client_1.ListingType),
    __metadata("design:type", String)
], CreateListingDto.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RoleType }),
    (0, class_validator_1.IsEnum)(client_1.RoleType),
    __metadata("design:type", String)
], CreateListingDto.prototype, "targetRoleType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Software Engineer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateListingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Industry }),
    (0, class_validator_1.IsEnum)(client_1.Industry),
    __metadata("design:type", String)
], CreateListingDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bengaluru, Karnataka' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentType }),
    (0, class_validator_1.IsEnum)(client_1.PaymentType),
    __metadata("design:type", String)
], CreateListingDto.prototype, "payment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '₹18–28 LPA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateListingDto.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.WorkMode }),
    (0, class_validator_1.IsEnum)(client_1.WorkMode),
    __metadata("design:type", String)
], CreateListingDto.prototype, "workMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CertOpt }),
    (0, class_validator_1.IsEnum)(client_1.CertOpt),
    __metadata("design:type", String)
], CreateListingDto.prototype, "certificateProvided", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.EmpOption }),
    (0, class_validator_1.IsEnum)(client_1.EmpOption),
    __metadata("design:type", String)
], CreateListingDto.prototype, "employmentOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ExperienceLevel }),
    (0, class_validator_1.IsEnum)(client_1.ExperienceLevel),
    __metadata("design:type", String)
], CreateListingDto.prototype, "experienceRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Duration }),
    (0, class_validator_1.IsEnum)(client_1.Duration),
    __metadata("design:type", String)
], CreateListingDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'React, Node.js, AWS' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateListingDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Health Insurance, PF, Laptop' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateListingDto.prototype, "facilities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Join TCS Digital to build cloud solutions...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateListingDto.prototype, "experienceDetail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "responsibilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "requirements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MarketField }),
    (0, class_validator_1.IsEnum)(client_1.MarketField),
    __metadata("design:type", String)
], CreateListingDto.prototype, "marketField", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '💻' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateListingDto.prototype, "icon", void 0);
class RejectListingDto {
}
exports.RejectListingDto = RejectListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Missing contact details' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], RejectListingDto.prototype, "reason", void 0);
//# sourceMappingURL=listing.dto.js.map