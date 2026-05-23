import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsArray,
  MaxLength, IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ListingType, RoleType, Industry, PaymentType, WorkMode,
  CertOpt, EmpOption, ExperienceLevel, Duration, MarketField,
} from '@prisma/client';

export class CreateListingDto {
  @ApiProperty({ example: 'TCS Digital' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  organisationName: string;

  @ApiPropertyOptional({ example: 'Priya Menon' })
  @IsOptional() @IsString() @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'hr@tcs.com' })
  @IsOptional() @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional() @IsString() @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ enum: RoleType })
  @IsEnum(RoleType)
  targetRoleType: RoleType;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  title: string;

  @ApiProperty({ enum: Industry })
  @IsEnum(Industry)
  industry: Industry;

  @ApiProperty({ example: 'Bengaluru, Karnataka' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  location: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  payment: PaymentType;

  @ApiPropertyOptional({ example: '₹18–28 LPA' })
  @IsOptional() @IsString() @MaxLength(100)
  salary?: string;

  @ApiProperty({ enum: WorkMode })
  @IsEnum(WorkMode)
  workMode: WorkMode;

  @ApiProperty({ enum: CertOpt })
  @IsEnum(CertOpt)
  certificateProvided: CertOpt;

  @ApiProperty({ enum: EmpOption })
  @IsEnum(EmpOption)
  employmentOption: EmpOption;

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experienceRequired: ExperienceLevel;

  @ApiProperty({ enum: Duration })
  @IsEnum(Duration)
  duration: Duration;

  /**
   * Accept either a comma-separated string (from HTML form) or an array (from API).
   * The service normalises this before writing to the DB.
   */
  @ApiPropertyOptional({ example: 'React, Node.js, AWS' })
  @IsOptional()
  skills?: string | string[];

  @ApiPropertyOptional({ example: 'Health Insurance, PF, Laptop' })
  @IsOptional()
  facilities?: string | string[];

  @ApiProperty({ example: 'Join TCS Digital to build cloud solutions...' })
  @IsString() @IsNotEmpty() @MaxLength(5000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  experienceDetail?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  responsibilities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ enum: MarketField })
  @IsEnum(MarketField)
  marketField: MarketField;

  @ApiPropertyOptional({ example: '💻' })
  @IsOptional() @IsString() @MaxLength(10)
  icon?: string;
}

export class RejectListingDto {
  @ApiProperty({ example: 'Missing contact details' })
  @IsString() @IsNotEmpty() @MaxLength(1000)
  reason: string;
}
