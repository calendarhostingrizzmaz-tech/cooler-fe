import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const SettingsPage: React.FC = () => {
  const { token, admin, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', adminId: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const payload: any = {};
    if (form.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    if (form.adminId) payload.adminId = form.adminId;

    if (Object.keys(payload).length === 0) {
      setError('Please fill in at least one field to update.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.patch(`${API}/admin/credentials`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msg = res.data?.data?.message || res.data?.message || 'Credentials updated!';
      setSuccess(msg + ' Check your email for a notification.');
      setForm({ email: '', password: '', adminId: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">⚙️ Admin Panel</span>
        <div className="flex items-center gap-4">
          <Link to="/admin/items" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Items</Link>
          <Link to="/admin/settings" className="font-medium text-blue-600 border-b-2 border-blue-600 pb-0.5">Settings</Link>
          <Link to="/" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">← Store</Link>
          <button onClick={() => { logout(); navigate('/'); }} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Logged in as <span className="font-medium text-gray-700">{admin?.email}</span> · ID: <span className="font-mono text-gray-700">{admin?.adminId}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Update Credentials</h2>
          <p className="text-sm text-gray-500 mb-5">
            Fill only the fields you want to change. An email notification will be sent automatically.
          </p>

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl p-4 mb-4 text-sm">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="newemail@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Admin ID</label>
              <input
                value={form.adminId}
                onChange={(e) => setForm({ ...form, adminId: e.target.value })}
                placeholder="ADM-002"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? '⏳ Updating...' : '📧 Save & Send Notification Email'}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-800 mb-1">📌 How it works</h3>
          <p className="text-amber-700 text-sm">
            After updating, the system sends an automated email to your current admin address listing all changes made. Make sure your SMTP settings in <code className="bg-amber-100 px-1 rounded">.env.development</code> are configured.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
