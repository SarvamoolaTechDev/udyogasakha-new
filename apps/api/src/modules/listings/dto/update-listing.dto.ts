import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateListingDto } from './listing.dto';

/**
 * All fields from CreateListingDto are optional for updates.
 * marketField is excluded — it is set by the moderator, not the poster.
 */
export class UpdateListingDto extends PartialType(
  OmitType(CreateListingDto, ['marketField'] as const),
) {}
