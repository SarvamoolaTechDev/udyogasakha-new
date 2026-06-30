import { IsEnum, IsString, IsOptional, IsInt, Min, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentPurpose } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ enum: PaymentPurpose, example: PaymentPurpose.LISTING_FEATURE })
  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;

  @ApiPropertyOptional({ description: 'ID of the entity being paid for, e.g. a JobListing.id', example: 'uuid-of-listing' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  /**
   * Amount in the major currency unit (rupees, not paise) — converted to
   * paise server-side. Keeping the API surface in rupees avoids an easy
   * "forgot to multiply by 100" bug in frontend code.
   */
  @ApiProperty({ example: 499, description: 'Amount in rupees (or major unit of the chosen currency)' })
  @IsInt()
  @Min(1)
  amount: number;

  /**
   * ISO 4217 currency code. Defaults to INR for domestic payments.
   * For international payers, pass the currency you wish to charge in
   * (e.g. USD, EUR, GBP) — requires international payments to be enabled
   * on the Razorpay account; see PaymentsService.createOrder() for the
   * validation that enforces this.
   */
  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;
}
