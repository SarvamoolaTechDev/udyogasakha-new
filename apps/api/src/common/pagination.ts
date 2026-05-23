/**
 * Consistent pagination helpers used across all list endpoints.
 */

export interface PageParams {
  page:  number;
  limit: number;
  skip:  number;
}

export interface Paginated<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

/** Parse and clamp page/limit from raw query string values. */
export function parsePage(rawPage?: string | number, rawLimit?: string | number, maxLimit = 50): PageParams {
  const page  = Math.max(1, Number(rawPage)  || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(rawLimit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

/** Wrap a data array + count into the standard paginated response shape. */
export function paginate<T>(data: T[], total: number, params: PageParams): Paginated<T> {
  return {
    data,
    total,
    page:       params.page,
    limit:      params.limit,
    totalPages: Math.max(1, Math.ceil(total / params.limit)),
  };
}
