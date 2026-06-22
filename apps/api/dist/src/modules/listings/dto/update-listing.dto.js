"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateListingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const listing_dto_1 = require("./listing.dto");
/**
 * All fields from CreateListingDto are optional for updates.
 * marketField is excluded — it is set by the moderator, not the poster.
 */
class UpdateListingDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(listing_dto_1.CreateListingDto, ['marketField'])) {
}
exports.UpdateListingDto = UpdateListingDto;
//# sourceMappingURL=update-listing.dto.js.map