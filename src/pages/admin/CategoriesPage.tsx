import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Category {
  id: number;
  name: string;
}

const CategoriesPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/categories`);
      const payload = res.data?.data;
      setCategories(Array.isArray(payload) ? payload : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAdd = () => {
    setEditCategory(null);
    setName('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCategory) {
        await axios.patch(`${API}/categories/${editCategory.id}`, { name }, authHeader);
        showToast('Category updated!');
      } else {
        await axios.post(`${API}/categories`, { name }, authHeader);
        showToast('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (name === 'Other') {
      showToast('Cannot delete the default "Other" category.', 'error');
      return;
    }
    if (!window.confirm(`Delete category "${name}"? Items in this category must be reassigned first.`)) return;
    try {
      await axios.delete(`${API}/categories/${id}`, authHeader);
      showToast('Category deleted.');
      fetchCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete category.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">⚙️ Admin Panel</span>
        <div className="flex items-center gap-4">
          <Link to="/admin/items" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Items</Link>
          <Link to="/admin/categories" className="font-medium text-blue-600 border-b-2 border-blue-600 pb-0.5">Categories</Link>
          <Link to="/admin/settings" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Settings</Link>
          <Link to="/" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">← Store</Link>
          <button onClick={() => { logout(); navigate('/'); }} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {toast && (
          <div className={`fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg z-50 text-white font-medium ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toastType === 'success' ? '✅' : '❌'} {toast}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            + Add Category
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading categories…</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">#{cat.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {cat.name}
                      {cat.name === 'Other' && <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase">Default</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {cat.name !== 'Other' && (
                        <>
                          <button
                            onClick={() => openEdit(cat)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-5">{editCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSave}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Beverages, Electronics"
                />
              </div>
              <div className="flex gap-3">
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
                  {saving ? 'Saving...' : editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
