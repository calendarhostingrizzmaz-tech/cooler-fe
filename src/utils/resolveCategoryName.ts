/** Prefer the live categories list (by id) over nested item.category from list responses. */
export function resolveCategoryName(
  categoryId: number | undefined | null,
  categories: { id: number; name: string }[],
  fallback?: { name?: string } | null,
): string | null {
  if (categoryId != null) {
    const match = categories.find((c) => c.id === categoryId);
    if (match?.name) return match.name;
  }
  return fallback?.name?.trim() || null;
}

export const CATEGORIES_UPDATED_EVENT = 'cooler:categories-updated';

export function notifyCategoriesUpdated(): void {
  window.dispatchEvent(new Event(CATEGORIES_UPDATED_EVENT));
}
