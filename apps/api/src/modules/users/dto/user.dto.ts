import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Arjun Nair' })
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;
}
