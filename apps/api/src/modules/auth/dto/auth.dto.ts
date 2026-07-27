import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'arjun.nair@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Str0ng@Pass', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  password: string;

  @ApiProperty({ example: 'Arjun Nair' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '+919876543210', description: 'Mobile number — used for UPI payment reconciliation and contact. Must be unique across all accounts.' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[+]?[0-9]{10,15}$/, { message: 'Enter a valid mobile number (10–15 digits, optional + prefix)' })
  phone: string;
}

export class LoginDto {
  @ApiProperty({ example: 'arjun.nair@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'you@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'The raw token from the reset link emailed to the user' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  newPassword: string;
}
