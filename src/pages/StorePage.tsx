import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Slider, { Settings as SlickSettings } from 'react-slick';
import { useCart } from '../context/CartContext';
import { parseItemsListResponse } from '../utils/parseItemsListResponse';
import {
  itemEffectiveUnitPrice,
  itemHasDiscount,
  itemGalleryUrls,
  itemPrimaryImage,
} from '../utils/itemPrice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Category {
  id: number;
  name: string;
}

interface ItemImageRow {
  id: number;
  url: string;
  sortOrder: number;
}

interface Item {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number | null;
  image: string;
  images?: ItemImageRow[];
  description: string;
  categoryId?: number;
  category?: Category;
}

const ITEMS_PER_PAGE = 8;

const StorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  /** Which gallery image is shown on each product card (grid only). */
  const [gridImageIndexById, setGridImageIndexById] = useState<Record<number, number>>({});
  const modalGallerySliderRef = useRef<Slider | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryQuery, setCategoryQuery] = useState('');
  const { addToCart } = useCart();

  const page = useMemo((): number => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1;
  }, [searchParams]);

  const minPriceFilter = useMemo((): number | null => {
    const raw = searchParams.get('minPrice');
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }, [searchParams]);

  const maxPriceFilter = useMemo((): number | null => {
    const raw = searchParams.get('maxPrice');
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }, [searchParams]);

  const [minPriceDraft, setMinPriceDraft] = useState('');
  const [maxPriceDraft, setMaxPriceDraft] = useState('');

  useEffect(() => {
    setMinPriceDraft(searchParams.get('minPrice') ?? '');
    setMaxPriceDraft(searchParams.get('maxPrice') ?? '');
  }, [searchParams]);

  const selectedCategoryId = useMemo((): number | null => {
    const raw = searchParams.get('categoryId');
    if (raw == null || raw === '') return null;
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) return null;
    if (categories.length > 0 && !categories.some((c) => c.id === id)) return null;
    return id;
  }, [searchParams, categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const raw = searchParams.get('categoryId');
    if (raw == null || raw === '') return;
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      setSearchParams(
        (p) => {
          const next = new URLSearchParams(p);
          next.delete('categoryId');
          return next;
        },
        { replace: true },
      );
      return;
    }
    if (categories.length > 0 && !categories.some((c) => c.id === id)) {
      setSearchParams(
        (p) => {
          const next = new URLSearchParams(p);
          next.delete('categoryId');
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, categories, setSearchParams]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategoryId, minPriceFilter, maxPriceFilter]);

  useEffect(() => {
    if (loading || totalPages < 1) return;
    if (page > totalPages) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (totalPages <= 1) next.delete('page');
          else next.set('page', String(totalPages));
          return next;
        },
        { replace: true },
      );
    }
  }, [loading, page, totalPages, setSearchParams]);

  const goToPage = (p: number) => {
    const nextP = Math.max(1, p);
    if (nextP === page) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextP <= 1) next.delete('page');
        else next.set('page', String(nextP));
        return next;
      },
      { replace: true },
    );
    const targetTop = resultsTopRef.current?.getBoundingClientRect().top;
    if (targetTop != null) {
      window.scrollTo({ top: Math.max(0, window.scrollY + targetTop - 96), behavior: 'smooth' });
    }
  };

  const applyPriceFilter = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        const minT = minPriceDraft.trim();
        const maxT = maxPriceDraft.trim();
        if (minT === '') next.delete('minPrice');
        else next.set('minPrice', minT);
        if (maxT === '') next.delete('maxPrice');
        else next.set('maxPrice', maxT);
        return next;
      },
      { replace: true },
    );
  };

  const clearPriceFilter = () => {
    setMinPriceDraft('');
    setMaxPriceDraft('');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('minPrice');
        next.delete('maxPrice');
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      const payload = res.data?.data;
      const raw = Array.isArray(payload) ? payload : [];
      const byId = new Map<number, Category>();
      for (const c of raw) {
        if (c && typeof c.id === 'number' && !byId.has(c.id)) {
          byId.set(c.id, c as Category);
        }
      }
      setCategories(Array.from(byId.values()));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `${API}/items?page=${page}&limit=${ITEMS_PER_PAGE}`;
      if (selectedCategoryId != null) {
        url += `&categoryId=${selectedCategoryId}`;
      }
      if (minPriceFilter != null) {
        url += `&minPrice=${minPriceFilter}`;
      }
      if (maxPriceFilter != null) {
        url += `&maxPrice=${maxPriceFilter}`;
      }
      const res = await axios.get(url);
      const { items: list, lastPage, total } = parseItemsListResponse(res);
      setItems(list as Item[]);
      setTotalPages(lastPage);
      setTotalCount(total);
    } catch {
      setItems([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const syncCategoryToUrl = (categoryId: number | null) => {
    setSearchParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (categoryId == null) {
          next.delete('categoryId');
        } else {
          next.set('categoryId', String(categoryId));
        }
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  const activeCategoryName =
    selectedCategoryId != null
      ? categories.find((c) => c.id === selectedCategoryId)?.name
      : null;

  const filteredCategories = useMemo((): Category[] => {
    const q = categoryQuery.trim().toLowerCase();
    if (q === '') return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categoryQuery]);

  const shouldAutoScrollCategories = filteredCategories.length > 1;

  const handleAdd = (item: Item, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      itemId: String(item.id),
      name: item.name,
      price: itemEffectiveUnitPrice(item),
      image: itemPrimaryImage(item),
      compareAtPrice: itemHasDiscount(item) ? Number(item.price) : undefined,
    });
    setToast(`${item.name} added to cart!`);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg z-50 font-medium animate-bounce">
          ✅ {toast}
        </div>
      )}

      <div ref={resultsTopRef} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
        <p className="text-gray-500 mt-1">
          Discover our premium collection
          {activeCategoryName ? (
            <span className="block mt-2 text-sm font-semibold text-blue-700">
              Showing:{' '}
              <span className="font-black text-blue-600">{activeCategoryName}</span>
            </span>
          ) : null}
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  syncCategoryToUrl(null);
                  setCategoryQuery('');
                }}
                className={`shrink-0 whitespace-nowrap rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  selectedCategoryId === null
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50'
                    : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                All Products
              </button>
              <div className="relative min-w-[min(100%,16rem)] flex-1 sm:max-w-md">
                <input
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  placeholder="Search category..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {categoryQuery.trim() !== '' ? (
                  <button
                    type="button"
                    onClick={() => setCategoryQuery('')}
                    aria-label="Clear category search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-400 lg:text-right">
              {filteredCategories.length} of {categories.length} categories
            </p>
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="rounded-2xl">
            <Slider
              key={`cat-slider-${filteredCategories.map((c) => c.id).join('-')}`}
              {...({
                // infinite clones slides for the loop — reads as duplicate category pills
                infinite: false,
                autoplay: shouldAutoScrollCategories,
                speed: 500,
                autoplaySpeed: 2200,
                cssEase: 'ease-in-out',
                arrows: true,
                swipeToSlide: true,
                variableWidth: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                pauseOnHover: true,
                adaptiveHeight: false,
              } satisfies SlickSettings)}
            >
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="pr-2">
                  <button
                    type="button"
                    onClick={() => syncCategoryToUrl(cat.id)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      selectedCategoryId === cat.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50'
                        : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                </div>
              ))}
            </Slider>
          </div>
        ) : categories.length > 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center text-sm font-medium text-gray-500">
            No categories match your search. Clear the search or choose <span className="font-bold text-gray-700">All Products</span>.
          </p>
        ) : null}
      </div>

      {/* Price filter (effective / sale unit price, PKR) */}
      <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Min PKR</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={minPriceDraft}
            onChange={(e) => setMinPriceDraft(e.target.value)}
            placeholder="0"
            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Max PKR</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={maxPriceDraft}
            onChange={(e) => setMaxPriceDraft(e.target.value)}
            placeholder="Any"
            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="button"
          onClick={applyPriceFilter}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
        >
          Apply
        </button>
        {(minPriceFilter != null || maxPriceFilter != null) && (
          <button
            type="button"
            onClick={clearPriceFilter}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Clear price
          </button>
        )}
        <p className="w-full text-xs text-gray-400 sm:ml-2 sm:w-auto">
          Filters by the price you pay (uses sale price when discounted).
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-24 min-h-[50vh]">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl font-medium">
                {minPriceFilter != null || maxPriceFilter != null
                  ? 'No products in this price range'
                  : selectedCategoryId != null
                    ? 'No products in this category'
                    : 'No products yet'}
              </p>
              <p className="text-sm mt-2">
                {minPriceFilter != null || maxPriceFilter != null
                  ? 'Adjust min/max or clear the price filter.'
                  : selectedCategoryId != null
                    ? 'Try another category or view all products.'
                    : 'Check back soon!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => {
              const gallery = itemGalleryUrls(item);
              const rawIdx = gridImageIndexById[item.id] ?? 0;
              const imgIdx =
                gallery.length > 0 ? Math.min(Math.max(0, rawIdx), gallery.length - 1) : 0;
              const cardImageSrc =
                gallery.length > 0 ? gallery[imgIdx] : itemPrimaryImage(item);
              const cyclePrev = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (gallery.length < 2) return;
                setGridImageIndexById((m) => ({
                  ...m,
                  [item.id]: (imgIdx - 1 + gallery.length) % gallery.length,
                }));
              };
              const cycleNext = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (gallery.length < 2) return;
                setGridImageIndexById((m) => ({
                  ...m,
                  [item.id]: (imgIdx + 1) % gallery.length,
                }));
              };
              return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-gray-50">
                  <img
                    src={cardImageSrc}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  {gallery.length > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label="Previous product photo"
                        onClick={cyclePrev}
                        className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 active:scale-95"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next product photo"
                        onClick={cycleNext}
                        className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 active:scale-95"
                      >
                        ›
                      </button>
                      <span className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black tabular-nums text-white backdrop-blur-sm">
                        {imgIdx + 1} / {gallery.length}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {item.category?.name || 'Other'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors truncate">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xl font-black text-blue-600 flex flex-wrap items-baseline gap-2">
                      {itemHasDiscount(item) ? (
                        <>
                          <span>PKR {itemEffectiveUnitPrice(item).toFixed(2)}</span>
                          <span className="text-sm font-bold text-gray-400 line-through">
                            PKR {Number(item.price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span>PKR {Number(item.price).toFixed(2)}</span>
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">Details</span>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-800">
              {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalCount)}
            </span>{' '}
            of <span className="font-semibold text-gray-800">{totalCount}</span> products
          </p>
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-2 text-sm font-medium text-gray-600">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-400">All on one page</span>
          )}
        </div>
      )}

      {/* Category tags — colors aligned with store (blue / gray / white) */}
      {!loading && categories.length > 0 ? (
        <section className="mt-10" aria-labelledby="store-category-tags-heading">
          <div className="max-w-lg rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2
              id="store-category-tags-heading"
              className="mb-4 text-left text-sm font-bold text-gray-900"
            >
              Tags
            </h2>
            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={() => {
                  syncCategoryToUrl(null);
                  setCategoryQuery('');
                }}
                className={`w-fit max-w-full rounded-xl border px-3 py-2.5 text-left text-xs font-bold uppercase leading-snug tracking-wide transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500/40 ${
                  selectedCategoryId === null
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                }`}
                aria-pressed={selectedCategoryId === null}
              >
                All products
              </button>
              {categories.map((cat) => {
                const active = selectedCategoryId === cat.id;
                return (
                  <button
                    key={`tag-${cat.id}`}
                    type="button"
                    onClick={() => syncCategoryToUrl(cat.id)}
                    className={`w-fit max-w-full rounded-xl border px-3 py-2.5 text-left text-xs font-bold uppercase leading-snug tracking-wide transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500/40 ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50'
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                    aria-pressed={active}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Product Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[100] px-4 py-8 overflow-y-auto animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors z-10 shadow-sm"
            >
              ✕
            </button>

            {/* Left: image gallery */}
            <div className="relative md:w-1/2 bg-gray-50 h-64 md:min-h-[320px] md:h-auto flex flex-col justify-center">
              {itemGalleryUrls(selectedItem).length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous product photo"
                    onClick={() => modalGallerySliderRef.current?.slickPrev()}
                    className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70 active:scale-95 md:left-4"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Next product photo"
                    onClick={() => modalGallerySliderRef.current?.slickNext()}
                    className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70 active:scale-95 md:right-4"
                  >
                    ›
                  </button>
                  <Slider
                    key={selectedItem.id}
                    ref={modalGallerySliderRef}
                    {...({
                      dots: true,
                      arrows: false,
                      infinite: true,
                      speed: 400,
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      adaptiveHeight: true,
                    } satisfies SlickSettings)}
                  >
                    {itemGalleryUrls(selectedItem).map((src, idx) => (
                      <div key={`${src}-${idx}`} className="px-1 outline-none">
                        <img
                          src={src}
                          alt={`${selectedItem.name} — ${idx + 1}`}
                          className="w-full h-64 md:h-96 object-cover rounded-2xl md:rounded-none"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/600x600?text=No+Image';
                          }}
                        />
                      </div>
                    ))}
                  </Slider>
                </>
              ) : (
                <img
                  src={itemPrimaryImage(selectedItem)}
                  alt={selectedItem.name}
                  className="w-full h-full min-h-[16rem] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
                  }}
                />
              )}
            </div>

            {/* Right: Content */}
            <div className="md:w-1/2 p-8 flex flex-col">
              <div className="mb-6">
                <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedItem.name}</h2>
                <div className="flex flex-wrap items-baseline gap-3">
                  {itemHasDiscount(selectedItem) ? (
                    <>
                      <span className="text-3xl font-bold text-blue-600">
                        PKR {itemEffectiveUnitPrice(selectedItem).toFixed(2)}
                      </span>
                      <span className="text-xl font-semibold text-gray-400 line-through">
                        PKR {Number(selectedItem.price).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-blue-600">
                      PKR {Number(selectedItem.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                <div
                  className="prose prose-sm max-w-none text-gray-600 text-base leading-relaxed rich-description"
                  dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                />
              </div>

              <button
                onClick={() => { handleAdd(selectedItem); setSelectedItem(null); }}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl text-xl font-black hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-200"
              >
                Add to Cart
              </button>
            </div>
          </div>
          {/* Backdrop Click */}
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedItem(null)} />
        </div>
      )}
    </div>
  );
};

export default StorePage;
