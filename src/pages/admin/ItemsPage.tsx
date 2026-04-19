import React, { useState, useEffect, useCallback } from 'react';
import axios, { isAxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { parseItemsListResponse } from '../../utils/parseItemsListResponse';
import {
  itemEffectiveUnitPrice,
  itemHasDiscount,
  itemGalleryUrls,
} from '../../utils/itemPrice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const MAX_PRODUCT_IMAGES = 5;

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

const emptyForm = {
  name: '',
  price: '',
  discountedPrice: '',
  description: '',
  categoryId: '',
};

const ADMIN_ITEMS_PAGE_SIZE = 12;

const ItemsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [listPage, setListPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  /** All image URLs in order (S3). Index 0 = cover / list thumbnail. */
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), type === 'error' ? 8000 : 3000);
  };

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  /** Auth only — do not set Content-Type on FormData (browser must send multipart boundary). */
  const multipartAuthHeaders = token
    ? { Authorization: `Bearer ${token}` as const }
    : {};

  /** Upload each chosen file to S3 immediately; returned URLs are appended in order. */
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Snapshot files first: `FileList` is live — clearing `input.value` empties it before we read.
    const files = e.target.files?.length ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (!files.length) return;

    if (!token) {
      showToast('Please log in again to upload images.', 'error');
      return;
    }

    const room = MAX_PRODUCT_IMAGES - galleryUrls.length;
    if (room <= 0) {
      showToast(`Maximum ${MAX_PRODUCT_IMAGES} images per product. Remove one to add another.`, 'error');
      return;
    }
    const toUpload = files.slice(0, room);
    if (files.length > toUpload.length) {
      showToast(
        `Only ${toUpload.length} more image(s) allowed (max ${MAX_PRODUCT_IMAGES} total). Extra files were skipped.`,
        'error',
      );
    }

    setIsUploading(true);
    const added: string[] = [];
    try {
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await axios.post(`${API}/items/upload`, fd, {
          headers: multipartAuthHeaders,
        });
        // API wraps payload: { statusCode, message, data: { url } } (ResponseInterceptor)
        const body = res.data as { data?: { url?: string }; url?: string } | undefined;
        const url = body?.data?.url ?? body?.url;
        if (typeof url === 'string' && url.trim()) {
          added.push(url.trim());
        } else {
          showToast('Upload did not return a URL', 'error');
        }
      }
      if (added.length) {
        setGalleryUrls((prev) => [...prev, ...added]);
        showToast(`${added.length} image(s) uploaded to S3.`, 'success');
      }
    } catch (err) {
      const detail = isAxiosError(err)
        ? (err.response?.data as { message?: string | string[] } | undefined)?.message
        : undefined;
      const msg = Array.isArray(detail)
        ? detail.join(', ')
        : typeof detail === 'string'
          ? detail
          : err instanceof Error
            ? err.message
            : '';
      showToast(
        msg
          ? `Upload failed: ${msg}`
          : 'Could not upload image to S3. Check login, API URL, and AWS settings.',
        'error',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeGalleryAt = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveGallery = (index: number, delta: -1 | 1) => {
    setGalleryUrls((prev) => {
      const j = index + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  /** Makes this image the cover (first in list = main preview on store). */
  const makeCover = (index: number) => {
    if (index <= 0) return;
    setGalleryUrls((prev) => {
      const next = [...prev];
      const [slot] = next.splice(index, 1);
      next.unshift(slot);
      return next;
    });
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/items?page=${listPage}&limit=${ADMIN_ITEMS_PAGE_SIZE}`,
      );
      const { items: list, lastPage, total } = parseItemsListResponse(res);
      setItems((list || []) as Item[]);
      setTotalPages(lastPage);
      setTotalCount(total);
    } catch {
      setItems([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [listPage]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      const payload = res.data?.data;
      setCategories(Array.isArray(payload) ? payload : []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  useEffect(() => {
    if (!loading && totalPages >= 1 && listPage > totalPages) {
      setListPage(totalPages);
    }
  }, [loading, listPage, totalPages]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setGalleryUrls([]);
    setShowModal(true);
  };

  const openEdit = (item: Item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      price: String(item.price),
      discountedPrice:
        item.discountedPrice != null && item.discountedPrice !== undefined
          ? String(item.discountedPrice)
          : '',
      description: item.description,
      categoryId: String(item.categoryId || ''),
    });
    const urls = itemGalleryUrls(item);
    setGalleryUrls(urls);
    if (urls.length > MAX_PRODUCT_IMAGES) {
      showToast(
        `This product has ${urls.length} images. Delete extras so there are at most ${MAX_PRODUCT_IMAGES} before saving.`,
        'error',
      );
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryUrls.length > MAX_PRODUCT_IMAGES) {
      showToast(`At most ${MAX_PRODUCT_IMAGES} images per product. Remove some images first.`, 'error');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('discountedPrice', form.discountedPrice.trim());
      formData.append('description', form.description);
      if (form.categoryId) {
        formData.append('categoryId', form.categoryId);
      }

      formData.append('imageUrls', JSON.stringify(galleryUrls.slice(0, MAX_PRODUCT_IMAGES)));

      if (editItem) {
        await axios.patch(`${API}/items/${editItem.id}`, formData, {
          headers: multipartAuthHeaders,
        });
        showToast('Item updated successfully!');
      } else {
        await axios.post(`${API}/items`, formData, {
          headers: multipartAuthHeaders,
        });
        showToast('Item created successfully!');
      }
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/items/${id}`, authHeader);
      showToast('Item deleted.');
      fetchItems();
    } catch {
      showToast('Failed to delete item.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">⚙️ Admin Panel</span>
        <div className="flex items-center gap-4">
          <Link to="/admin/items" className="font-medium text-blue-600 border-b-2 border-blue-600 pb-0.5">Items</Link>
          <Link to="/admin/categories" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Categories</Link>
          <Link to="/admin/settings" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Settings</Link>
          <Link to="/" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">← Store</Link>
          <button onClick={() => { logout(); navigate('/'); }} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {toast && (
          <div className={`fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg z-50 text-white font-medium ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toastType === 'success' ? '✅' : '❌'} {toast}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Items</h1>
            {!loading && totalCount > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {(listPage - 1) * ADMIN_ITEMS_PAGE_SIZE + 1}–
                {Math.min(listPage * ADMIN_ITEMS_PAGE_SIZE, totalCount)} of {totalCount} products
              </p>
            )}
          </div>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            + Add Item
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading items…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-lg font-medium">No items yet. Add your first product!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Image</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {itemGalleryUrls(item)
                            .slice(0, 3)
                            .map((src, i) => (
                              <img
                                key={`${item.id}-${i}`}
                                src={src}
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://placehold.co/40x40?text=?';
                                }}
                              />
                            ))}
                        </div>
                        {itemGalleryUrls(item).length > 3 ? (
                          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                            +{itemGalleryUrls(item).length - 3}
                          </span>
                        ) : itemGalleryUrls(item).length > 1 ? (
                          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                            {itemGalleryUrls(item).length} photos
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-blue-600 font-semibold">
                      {itemHasDiscount(item) ? (
                        <span className="flex flex-col gap-0.5">
                          <span>PKR {itemEffectiveUnitPrice(item).toFixed(2)}</span>
                          <span className="text-xs text-gray-400 line-through font-medium">
                            PKR {Number(item.price).toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        <span>PKR {Number(item.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.category?.name || <span className="italic text-gray-400">None</span>}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                <span className="text-sm text-gray-600">
                  Page {listPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={listPage <= 1}
                    onClick={() => setListPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={listPage >= totalPages}
                    onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      }
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full items-center justify-center bg-black/50 p-4 py-8 sm:p-6">
            <div
              className="my-auto flex min-h-0 w-full max-w-2xl max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="item-modal-title"
            >
              <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-6">
                  <h2 id="item-modal-title" className="text-xl font-bold text-gray-900 mb-5">
                    {editItem ? 'Edit Item' : 'Add New Item'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Product Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (PKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="19.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discounted price (PKR){' '}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountedPrice}
                    onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Leave empty for no sale"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Must be less than regular price. Clear to remove sale.
                  </p>
                </div>
                  </div>
                  <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Category (Defaults to "Other")</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                  </div>
                  <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product images (S3)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Up to <strong>{MAX_PRODUCT_IMAGES} images</strong> per product. Files upload to <strong>S3</strong>{' '}
                  as soon as you pick them. The <strong>first</strong> image is the store cover and list thumbnail.
                  Reorder or set cover below.
                </p>
                <p className="mb-2 text-[11px] font-semibold text-gray-600">
                  {galleryUrls.length}/{MAX_PRODUCT_IMAGES} images
                </p>

                <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                  {galleryUrls[0] ? (
                    <div className="aspect-[16/10] max-h-52 bg-gray-100">
                      <img
                        src={galleryUrls[0]}
                        alt="Cover preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/640x400?text=Cover';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] max-h-52 flex items-center justify-center text-sm text-gray-400">
                      No images yet — add photos to see cover preview
                    </div>
                  )}
                  <div className="border-t border-gray-200 bg-white px-3 py-2 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      Store cover (first image)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {galleryUrls.map((url, idx) => (
                    <div
                      key={`g-${idx}-${url.slice(-32)}`}
                      className={`flex items-center gap-2 rounded-xl border p-2 ${
                        idx === 0 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {idx === 0 ? (
                          <span className="absolute bottom-0 left-0 right-0 bg-blue-600 py-0.5 text-center text-[9px] font-black text-white">
                            COVER
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] text-gray-500" title={url}>
                          {url.includes('amazonaws.com') || url.includes('s3') ? 'S3' : 'URL'} · #{idx + 1}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {idx > 0 ? (
                            <button
                              type="button"
                              onClick={() => makeCover(idx)}
                              className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700"
                            >
                              Set as cover
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGallery(idx, -1)}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={idx >= galleryUrls.length - 1}
                            onClick={() => moveGallery(idx, 1)}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryAt(idx)}
                            className="rounded-lg border border-red-100 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading || galleryUrls.length >= MAX_PRODUCT_IMAGES}
                  onChange={handleFilesChange}
                  className="hidden"
                  id="file-upload-multi"
                />
                <label
                  htmlFor="file-upload-multi"
                  className={`inline-block rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all ${
                    isUploading || galleryUrls.length >= MAX_PRODUCT_IMAGES
                      ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                      : 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading
                    ? 'Uploading to S3…'
                    : galleryUrls.length >= MAX_PRODUCT_IMAGES
                      ? `Maximum ${MAX_PRODUCT_IMAGES} images`
                      : '📁 Add images from computer'}
                </label>
                <p className="mt-1.5 text-[10px] text-gray-400">
                  Each file is uploaded to your S3 bucket immediately, then ordered in this list.
                </p>
                  </div>
                  <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Product description..."
                />
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-white p-6 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
