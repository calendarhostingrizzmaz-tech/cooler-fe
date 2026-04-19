/**
 * Normalizes GET /items after the API envelope `{ data: ... }` wrapper.
 * Supports paginated `{ data: Item[], lastPage, page, total }` and plain arrays.
 */
export function parseItemsListResponse(res: { data?: { data?: unknown } }): {
  items: unknown[];
  lastPage: number;
  total: number;
  page: number;
} {
  const inner = res.data?.data;

  if (
    inner &&
    typeof inner === 'object' &&
    !Array.isArray(inner) &&
    'lastPage' in inner &&
    Array.isArray((inner as { data?: unknown }).data)
  ) {
    const page = inner as { data: unknown[]; lastPage?: number; total?: number; page?: number };
    const total = Number(page.total);
    const pageNum = Number(page.page);
    return {
      items: page.data,
      lastPage: Math.max(1, Number(page.lastPage) || 1),
      total: Number.isFinite(total) ? total : page.data.length,
      page: Number.isFinite(pageNum) ? pageNum : 1,
    };
  }

  if (Array.isArray(inner)) {
    return { items: inner, lastPage: 1, total: inner.length, page: 1 };
  }

  return { items: [], lastPage: 1, total: 0, page: 1 };
}
