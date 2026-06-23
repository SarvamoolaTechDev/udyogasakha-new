/**
 * Consistent pagination helpers used across all list endpoints.
 */
export interface PageParams {
    page: number;
    limit: number;
    skip: number;
}
export interface Paginated<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/** Parse and clamp page/limit from raw query string values. */
export declare function parsePage(rawPage?: string | number, rawLimit?: string | number, maxLimit?: number): PageParams;
/** Wrap a data array + count into the standard paginated response shape. */
export declare function paginate<T>(data: T[], total: number, params: PageParams): Paginated<T>;
