export interface StoreCategory {
  id: number;
  name: string;
  isDefault?: boolean;
}

/** Stable slugs for home-page collections — work regardless of DB category naming. */
export const HOME_COLLECTIONS = {
  'air-coolers': ['Air Coolers', 'Air Cooler'],
  'electric-water-cooler': ['Electric Water Coolers', 'Electric Water Cooler'],
  geysers: ['Geysers', 'Geaser', 'Geyser'],
} as const;

export type HomeCollectionSlug = keyof typeof HOME_COLLECTIONS;

const normalize = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, ' ').trim();

/** Match a category name loosely (handles plural/singular and minor spelling differences). */
function namesMatch(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  if (left === right) return true;
  if (left.replace(/s$/, '') === right.replace(/s$/, '')) return true;
  return left.includes(right) || right.includes(left);
}

function findByAliasList(
  categories: StoreCategory[],
  aliases: readonly string[],
): StoreCategory | undefined {
  for (const alias of aliases) {
    const match = categories.find((c) => namesMatch(c.name, alias));
    if (match) return match;
  }
  return undefined;
}

export function resolveCategoryFromQuery(
  categories: StoreCategory[],
  params: { collection?: string | null; category?: string | null },
): StoreCategory | undefined {
  const collection = params.collection?.trim().toLowerCase();
  if (collection && collection in HOME_COLLECTIONS) {
    const aliases = HOME_COLLECTIONS[collection as HomeCollectionSlug];
    const match = findByAliasList(categories, aliases);
    if (match) return match;
  }

  const categoryName = params.category?.trim();
  if (categoryName) {
    const direct = categories.find((c) => namesMatch(c.name, categoryName));
    if (direct) return direct;

    for (const aliases of Object.values(HOME_COLLECTIONS)) {
      if (aliases.some((alias) => namesMatch(alias, categoryName))) {
        const match = findByAliasList(categories, aliases);
        if (match) return match;
      }
    }
  }

  return undefined;
}

/** Default collection when opening /store with no category in the URL. */
export const DEFAULT_STORE_CATEGORY_NAMES = [
  'Electric Water Coolers',
  'Electric Water Cooler',
] as const;

export function findDefaultStoreCategory(
  categories: StoreCategory[],
): StoreCategory | undefined {
  return (
    findByAliasList(categories, DEFAULT_STORE_CATEGORY_NAMES) ??
    categories.find((c) => c.isDefault)
  );
}
