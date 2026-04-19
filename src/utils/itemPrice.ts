/** Unit price charged at checkout (sale price when a valid discount is set). */
export function itemEffectiveUnitPrice(item: {
  price: number;
  discountedPrice?: number | null;
}): number {
  const p = Number(item.price);
  const d = item.discountedPrice != null ? Number(item.discountedPrice) : NaN;
  if (Number.isFinite(d) && d > 0 && d < p) {
    return d;
  }
  return p;
}

export function itemHasDiscount(item: {
  price: number;
  discountedPrice?: number | null;
}): boolean {
  const p = Number(item.price);
  const d = item.discountedPrice != null ? Number(item.discountedPrice) : NaN;
  return Number.isFinite(d) && d > 0 && d < p;
}

export type ItemWithGallery = {
  image: string;
  images?: { url: string; sortOrder?: number }[] | null;
};

/** Ordered image URLs (falls back to legacy `image` when no gallery rows). */
export function itemGalleryUrls(item: ItemWithGallery): string[] {
  if (item.images && item.images.length > 0) {
    return [...item.images]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((x) => x.url)
      .filter(Boolean);
  }
  if (item.image?.trim()) return [item.image.trim()];
  return [];
}

export function itemPrimaryImage(item: ItemWithGallery): string {
  const urls = itemGalleryUrls(item);
  return urls[0] || 'https://placehold.co/400x400?text=No+Image';
}
