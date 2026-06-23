"use strict";
/**
 * Consistent pagination helpers used across all list endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePage = parsePage;
exports.paginate = paginate;
/** Parse and clamp page/limit from raw query string values. */
function parsePage(rawPage, rawLimit, maxLimit = 50) {
    const page = Math.max(1, Number(rawPage) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number(rawLimit) || 20));
    return { page, limit, skip: (page - 1) * limit };
}
/** Wrap a data array + count into the standard paginated response shape. */
function paginate(data, total, params) {
    return {
        data,
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
}
//# sourceMappingURL=pagination.js.map