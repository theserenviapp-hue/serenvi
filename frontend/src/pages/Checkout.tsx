import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const PAYMENT_METHODS = [
  { id: 'WALLET', label: 'Wallet Balance', icon: '💰', desc: 'Pay from your SERENVI wallet' },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [processing, setProcessing] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const state = location.state as { cartItems?: CartItem[] } | null;
    if (!state?.cartItems || state.cartItems.length === 0) {
      navigate('/shop');
      return;
    }
    setCartItems(state.cartItems);
  }, [location.state, navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return (
      address.fullName.trim() &&
      address.phone.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim() &&
      paymentMethod
    );
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }

    setProcessing(true);

    // For UPI / Card / Bank — use Razorpay checkout
    if (paymentMethod !== 'WALLET') {
      try {
        // 1. Create Razorpay order on backend
        const cartSummary = cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const orderRes = await api.post('/payments/create-order', {
          amount: totalPrice,
          cartSummary,
        });

        const { orderId, keyId } = orderRes.data;

        // 2. Open Razorpay checkout
        const options = {
          key: keyId,
          amount: Math.round(totalPrice * 100),
          currency: 'INR',
          name: 'SERENVI',
          description: cartSummary,
          order_id: orderId,
          prefill: {
            name: address.fullName,
            contact: address.phone,
          },
          theme: { color: '#06b6d4' },
          handler: async (response: any) => {
            // 3. Verify payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // 4. Create sale records after payment verified
              await completeSaleRecords();
            } else {
              alert('❌ Payment verification failed. Contact support.');
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error: any) {
        alert(error.response?.data?.message || '❌ Failed to initiate payment');
        setProcessing(false);
      }
      return;
    }

    // For WALLET payment — direct purchase
    await completeSaleRecords();
  };

  const completeSaleRecords = async () => {
    try {
      let successCount = 0;
      let errorMsg = '';

      for (const item of cartItems) {
        try {
          await api.post('/sales', {
            productId: item.productId,
            quantity: item.quantity,
            paymentMethod,
          });
          successCount++;
        } catch (error: any) {
          errorMsg = error.response?.data?.message || 'Purchase failed';
          break;
        }
      }

      if (successCount === cartItems.length) {
        alert('✅ Order placed successfully!');
        navigate('/shop');
      } else {
        alert(`⚠️ Partial purchase. ${successCount} of ${cartItems.length} items purchased.\n${errorMsg}`);
        navigate('/shop');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '❌ Order failed');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/shop')}
          className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-sm"
        >
          ← Back to Shop
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-slate-400 text-sm">{totalItems} item{totalItems > 1 ? 's' : ''} · ₹{totalPrice.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              📍 Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-sm mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={address.addressLine1}
                  onChange={handleInputChange}
                  placeholder="House No, Building, Street"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-sm mb-1">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={address.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Landmark, Area (optional)"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleInputChange}
                  placeholder="400001"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              💳 Payment Method
            </h2>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="text-slate-100 font-semibold">{method.label}</p>
                    <p className="text-slate-400 text-sm">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Order Summary */}
        <div className="space-y-6">
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <p className="text-slate-200">{item.name}</p>
                    <p className="text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-slate-300 font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Shipping</span>
                <span className="text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-100 pt-2 border-t border-slate-700">
                <span>Total</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing || !isFormValid()}
              className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-lg hover:from-emerald-600 hover:to-green-700 transition shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? '⏳ Processing...' : `Place Order · ₹${totalPrice.toLocaleString('en-IN')}`}
            </button>

            <p className="text-slate-500 text-xs text-center mt-3">
              By placing this order you agree to our terms & conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
