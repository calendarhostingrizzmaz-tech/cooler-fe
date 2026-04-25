import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/** Store WhatsApp (digits only). Used if `BUSINESS_WHATSAPP` is not set on the API. */
const DEFAULT_STORE_WHATSAPP_DIGITS = '923065758181';

type BankInfo = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchOrNote: string;
};

type CheckoutInfo = {
  whatsappDigits: string;
  bank: BankInfo;
};

function unwrapCheckoutInfo(res: { data?: { data?: CheckoutInfo } }): CheckoutInfo | null {
  const p = res.data?.data;
  if (p && typeof p === 'object' && p.bank) return p;
  return null;
}

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
  const [infoError, setInfoError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<{
    total: number;
    phone: string;
    address: string;
  } | null>(null);
  const didAutoOpenWhatsapp = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/orders/checkout-info`);
        const info = unwrapCheckoutInfo(res);
        if (!cancelled) {
          setCheckoutInfo(info || { whatsappDigits: '', bank: emptyBank() });
        }
      } catch {
        if (!cancelled) {
          setInfoError('Could not load payment details. You can still place the order.');
          setCheckoutInfo({ whatsappDigits: '', bank: emptyBank() });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const apiWaDigits = (checkoutInfo?.whatsappDigits || '').replace(/\D/g, '');
  const storeWhatsappDigits =
    apiWaDigits.length >= 10 ? apiWaDigits : DEFAULT_STORE_WHATSAPP_DIGITS;

  const waMessage = placedOrder
    ? buildWhatsappPrefillMessage(placedOrder)
    : '';

  const waUrl =
    success && placedOrder && storeWhatsappDigits.length >= 10
      ? `https://wa.me/${storeWhatsappDigits}?text=${encodeURIComponent(waMessage)}`
      : null;

  useEffect(() => {
    if (!waUrl || didAutoOpenWhatsapp.current) return;
    didAutoOpenWhatsapp.current = true;
    const id = window.setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 500);
    return () => window.clearTimeout(id);
  }, [waUrl]);

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const snapshot = {
      total: totalPrice,
      phone: phone.trim(),
      address: address.trim(),
    };
    try {
      await axios.post(`${API}/orders`, {
        items: items.map(({ itemId, name, price, quantity }) => ({
          itemId,
          name,
          price,
          quantity,
        })),
        phone: snapshot.phone,
        address: snapshot.address,
      });
      setPlacedOrder(snapshot);
      clearCart();
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-5">✅</div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Order received</h2>
        <p className="text-gray-600 mb-1">
          Pay the amount via bank transfer (outside this app), then send your payment screenshot on WhatsApp.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Total: <span className="font-bold text-blue-600">PKR {placedOrder.total.toFixed(2)}</span>
        </p>

        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full max-w-sm mx-auto items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-2xl text-lg font-black hover:brightness-110 transition-all shadow-lg shadow-green-200 mb-4"
          >
            <span className="text-2xl" aria-hidden>
              💬
            </span>
            Open WhatsApp (message ready)
          </a>
        ) : null}

        <p className="text-gray-400 text-xs mb-8">
          The store was also notified about your order. You can close this tab after sending the screenshot.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-blue-600 font-semibold hover:underline"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  const b = checkoutInfo?.bank;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-gray-500 text-sm mb-8">
        Pay by bank transfer using the details below, then place your order. After that, open WhatsApp and send your
        payment screenshot to us.
      </p>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Order summary</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.itemId} className="flex justify-between text-sm text-gray-600">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-right">
                {item.compareAtPrice != null && item.compareAtPrice > item.price ? (
                  <span className="flex flex-col items-end gap-0.5">
                    <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
                    <span className="text-xs text-gray-400 line-through">
                      PKR {(item.compareAtPrice * item.quantity).toFixed(2)}
                    </span>
                  </span>
                ) : (
                  <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900 text-lg">
          <span>Total to pay</span>
          <span className="text-blue-600">PKR {totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Bank details */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-200 p-6 mb-6 text-left text-white">
        <h2 className="font-black text-lg mb-1 tracking-tight">Bank transfer</h2>
        <p className="text-blue-100 text-sm mb-5">
          Transfer <strong className="text-white">PKR {totalPrice.toFixed(2)}</strong> using these details, then complete
          the form and confirm your order.
        </p>
        {infoError ? (
          <p className="text-amber-200 text-sm mb-4">{infoError}</p>
        ) : null}
        {b && hasAnyBankField(b) ? (
          <dl className="space-y-3 text-sm">
            {b.bankName ? (
              <div>
                <dt className="text-blue-200 text-xs font-bold uppercase tracking-wider">Bank</dt>
                <dd className="font-semibold text-white">{b.bankName}</dd>
              </div>
            ) : null}
            {b.accountTitle ? (
              <div>
                <dt className="text-blue-200 text-xs font-bold uppercase tracking-wider">Account title</dt>
                <dd className="font-semibold text-white">{b.accountTitle}</dd>
              </div>
            ) : null}
            {b.accountNumber ? (
              <div>
                <dt className="text-blue-200 text-xs font-bold uppercase tracking-wider">Account number</dt>
                <dd className="font-mono font-bold text-lg tracking-wide">{b.accountNumber}</dd>
              </div>
            ) : null}
            {b.iban ? (
              <div>
                <dt className="text-blue-200 text-xs font-bold uppercase tracking-wider">IBAN</dt>
                <dd className="font-mono font-semibold break-all">{b.iban}</dd>
              </div>
            ) : null}
            {b.branchOrNote ? (
              <div>
                <dt className="text-blue-200 text-xs font-bold uppercase tracking-wider">Note</dt>
                <dd className="text-blue-50">{b.branchOrNote}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-blue-100 text-sm">
            Bank details are not set on the server yet. Add{' '}
            <code className="bg-white/10 px-1 rounded">PAYMENT_*</code> variables in the backend{' '}
            <code className="bg-white/10 px-1 rounded">.env.development</code> file.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-5 text-lg">Delivery & contact</h2>

        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 mb-4 text-sm">⚠️ {error}</div>
        ) : null}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number (WhatsApp preferred)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+923001234567"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Area, street, city"
            required
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-black hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
        >
          {loading ? 'Placing order…' : 'I have paid — place order'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          After this step you will get a button to open WhatsApp and send your payment screenshot.
        </p>
      </form>
    </div>
  );
};

function emptyBank(): BankInfo {
  return { bankName: '', accountTitle: '', accountNumber: '', iban: '', branchOrNote: '' };
}

function hasAnyBankField(b: BankInfo): boolean {
  return !!(b.bankName || b.accountTitle || b.accountNumber || b.iban || b.branchOrNote);
}

function buildWhatsappPrefillMessage(o: { total: number; phone: string; address: string }): string {
  return [
    'Assalamualaikum,',
    '',
    `I placed an order — total PKR ${o.total.toFixed(2)}.`,
    '',
    `My phone: ${o.phone}`,
    `Delivery address: ${o.address}`,
    '',
    'Bank payment screenshot is attached below.',
  ].join('\n');
}

export default CheckoutPage;
