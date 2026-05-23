import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl?: string;
    stockQuantity: number;
  };
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      if (quantity <= 0) {
        await api.delete(`/cart/${productId}`);
        setItems(items.filter(i => i.productId !== productId));
      } else {
        await api.put('/cart/update', { productId, quantity });
        setItems(items.map(i => i.productId === productId ? { ...i, quantity } : i));
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await api.delete(`/cart/${productId}`);
      setItems(items.filter(i => i.productId !== productId));
    } catch (error) {
      console.error('Failed to remove item', error);
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    const cartItems = items.map(item => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            🛒 Your Cart
          </h1>
          <p className="text-slate-400 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <span className="text-7xl block">🛒</span>
          <p className="text-slate-400 text-xl">Your cart is empty</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 flex gap-4 items-center hover:border-cyan-500/40 transition"
            >
              {/* Image */}
              <div
                className="w-24 h-24 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl.split(',')[0].trim()} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg font-semibold text-slate-100 truncate cursor-pointer hover:text-cyan-400 transition"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  {item.product.name}
                </h3>
                <p className="text-slate-500 text-sm">{item.product.category}</p>
                <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-1">
                  ₹{item.product.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={updating === item.productId}
                  className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition flex items-center justify-center text-sm font-bold disabled:opacity-50"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-slate-100">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={updating === item.productId || item.quantity >= item.product.stockQuantity}
                  className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition flex items-center justify-center text-sm font-bold disabled:opacity-50"
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right flex-shrink-0 w-24">
                <p className="text-lg font-bold text-slate-100">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                disabled={updating === item.productId}
                className="text-slate-500 hover:text-red-400 transition p-2 disabled:opacity-50"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Order Summary */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="text-lg font-bold text-slate-100">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  ₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-green-700 transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                ✓ Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
