import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsArray,
  IsInt, Min, Max, MaxLength, IsEmail, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  RoleType, PaymentType, WorkMode, CertOpt, EmpOption,
  MarketSegment, MarketField,
} from '@prisma/client';

export class UpsertProfileDto {
  @ApiProperty({ enum: RoleType })
  @IsEnum(RoleType)
  roleType: RoleType;

  // ── Personal ──────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Arjun Nair' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: '1998-04-15' })
  @IsOptional() @IsString() @MaxLength(20)
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional() @IsString() @MaxLength(30)
  gender?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'arjun@example.com' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  /** Comma-separated string or array — normalised in service */
  @ApiPropertyOptional({ example: 'React, Node.js, AWS' })
  @IsOptional()
  skills?: string | string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  summary?: string;

  // ── Education ─────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'B.Tech / B.E.' })
  @IsOptional() @IsString() @MaxLength(100)
  highestDegree?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional() @IsString() @MaxLength(100)
  specialization?: string;

  @ApiPropertyOptional({ example: 'IIT Bombay' })
  @IsOptional() @IsString() @MaxLength(200)
  institution?: string;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional() @IsInt() @Min(1970) @Max(2040)
  @Type(() => Number)
  yearOfPassing?: number;

  @ApiPropertyOptional({ example: '8.4 CGPA' })
  @IsOptional() @IsString() @MaxLength(50)
  grade?: string;

  // ── Role-specific extra fields (arbitrary key→value) ─────────────────────

  @ApiPropertyOptional({ example: { rf0: 'IIT Bombay', rf1: 'B.Tech CS 3rd Year' } })
  @IsOptional() @IsObject()
  roleFields?: Record<string, string>;

  // ── Submission details ────────────────────────────────────────────────────

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  appliedFor: string;

  @ApiProperty({ example: 'TCS Digital' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  appliedAt: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  payment: PaymentType;

  @ApiProperty({ enum: CertOpt })
  @IsEnum(CertOpt)
  certificate: CertOpt;

  @ApiProperty({ enum: WorkMode })
  @IsEnum(WorkMode)
  workMode: WorkMode;

  @ApiProperty({ enum: EmpOption })
  @IsEnum(EmpOption)
  employmentOption: EmpOption;

  @ApiProperty({ enum: MarketSegment })
  @IsEnum(MarketSegment)
  marketSegment: MarketSegment;

  @ApiPropertyOptional({ example: 'Karnataka' })
  @IsOptional() @IsString() @MaxLength(100)
  preferredLocation?: string;
}

export class AddExperienceDto {
  @ApiProperty({ example: 'Full Stack Developer' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Infosys' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  company: string;

  @ApiPropertyOptional({ example: '2021-06-01' })
  @IsOptional() @IsString() @MaxLength(20)
  fromDate?: string;

  @ApiPropertyOptional({ example: '2023-08-01' })
  @IsOptional() @IsString() @MaxLength(20)
  toDate?: string;

  @ApiPropertyOptional({ example: 'Built microservices handling 10M daily requests.' })
  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  @Type(() => Number)
  displayOrder?: number;
}

export class ApproveProfileDto {
  @ApiProperty({ enum: MarketField })
  @IsEnum(MarketField)
  marketField: MarketField;
}

export class RejectProfileDto {
  @ApiProperty({ example: 'Contact details missing or inconsistent.' })
  @IsString() @IsNotEmpty() @MaxLength(1000)
  reason: string;
}
