declare const UpdateListingDto_base: import("@nestjs/common").Type<Partial<T>>;
/**
 * All fields from CreateListingDto are optional for updates.
 * marketField is excluded — it is set by the moderator, not the poster.
 */
export declare class UpdateListingDto extends UpdateListingDto_base {
}
export {};
