import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-5">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/store"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=?';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg truncate">{item.name}</h3>
              <p className="text-blue-600 font-bold text-lg">
                {item.compareAtPrice != null && item.compareAtPrice > item.price ? (
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span>PKR {item.price.toFixed(2)} each</span>
                    <span className="text-sm text-gray-400 line-through font-semibold">
                      PKR {item.compareAtPrice.toFixed(2)}
                    </span>
                  </span>
                ) : (
                  <>PKR {item.price.toFixed(2)} each</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-gray-900">PKR {(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.itemId)}
                className="text-red-500 hover:text-red-700 text-sm font-medium mt-1 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold text-gray-700">Total</span>
          <span className="text-3xl font-bold text-blue-600">PKR {totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Proceed to Checkout →
        </button>
        <Link
          to="/"
          className="block text-center mt-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
