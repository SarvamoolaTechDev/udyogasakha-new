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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectProfileDto = exports.ApproveProfileDto = exports.AddExperienceDto = exports.UpsertProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class UpsertProfileDto {
}
exports.UpsertProfileDto = UpsertProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RoleType }),
    (0, class_validator_1.IsEnum)(client_1.RoleType),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "roleType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Arjun Nair' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1998-04-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Male' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543210' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'arjun@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bengaluru' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'React, Node.js, AWS' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpsertProfileDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'B.Tech / B.E.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "highestDegree", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Computer Science' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'IIT Bombay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "institution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2022 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1970),
    (0, class_validator_1.Max)(2040),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "yearOfPassing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '8.4 CGPA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { rf0: 'IIT Bombay', rf1: 'B.Tech CS 3rd Year' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], UpsertProfileDto.prototype, "roleFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Software Engineer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "appliedFor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TCS Digital' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "appliedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentType }),
    (0, class_validator_1.IsEnum)(client_1.PaymentType),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "payment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CertOpt }),
    (0, class_validator_1.IsEnum)(client_1.CertOpt),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "certificate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.WorkMode }),
    (0, class_validator_1.IsEnum)(client_1.WorkMode),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "workMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.EmpOption }),
    (0, class_validator_1.IsEnum)(client_1.EmpOption),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "employmentOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MarketSegment }),
    (0, class_validator_1.IsEnum)(client_1.MarketSegment),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "marketSegment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Karnataka' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "preferredLocation", void 0);
class AddExperienceDto {
}
exports.AddExperienceDto = AddExperienceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Full Stack Developer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AddExperienceDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Infosys' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AddExperienceDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2021-06-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], AddExperienceDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-08-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], AddExperienceDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Built microservices handling 10M daily requests.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], AddExperienceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AddExperienceDto.prototype, "displayOrder", void 0);
class ApproveProfileDto {
}
exports.ApproveProfileDto = ApproveProfileDto;
class RejectProfileDto {
}
exports.RejectProfileDto = RejectProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Contact details missing or inconsistent.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], RejectProfileDto.prototype, "reason", void 0);
//# sourceMappingURL=profile.dto.js.map