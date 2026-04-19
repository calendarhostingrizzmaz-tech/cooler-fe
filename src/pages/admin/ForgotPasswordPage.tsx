import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function pickMessage(res: { data?: { data?: { message?: string }; message?: string } }): string | undefined {
  const d = res.data?.data;
  if (d && typeof d.message === 'string') return d.message;
  if (res.data && typeof res.data.message === 'string') return res.data.message;
  return undefined;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('watercoolern@gmail.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await axios.post(`${API}/admin/forgot-password/request`, { email: email.trim() });
      const msg = pickMessage(res) || 'Check your recovery inbox for the code.';
      setInfo(msg);
      setStep('reset');
    } catch (err: unknown) {
      const data = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data : undefined;
      setError(data?.message || 'Could not send code. Try again or check server email settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/forgot-password/reset`, {
        email: email.trim(),
        otp: otp.replace(/\D/g, '').slice(0, 6),
        newPassword,
      });
      const msg = pickMessage(res) || 'Password updated.';
      setInfo(msg);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      window.setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err: unknown) {
      const data = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data : undefined;
      setError(data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📧</div>
          <h1 className="text-2xl font-bold text-gray-900">Reset admin password</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Enter your admin login email. A 6-digit code will be sent to the recovery inbox (not to this email).
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 mb-5 text-sm text-center">
            ⚠️ {error}
          </div>
        )}
        {info && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 mb-5 text-sm text-center">
            {info}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestCode}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin login email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {loading ? 'Sending…' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code from email</label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="000000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 tracking-widest text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setError('');
                setInfo('');
                setOtp('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              ← Request a new code
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/admin/login" className="text-blue-600 font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
