import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
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

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      if (quantity <= 0) {
        await api.delete(`/cart/${productId}`);
        setItems(items.filter((i) => i.productId !== productId));
      } else {
        await api.put('/cart/update', { productId, quantity });
        setItems(items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await api.delete(`/cart/${productId}`);
      setItems(items.filter((i) => i.productId !== productId));
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Empty your entire bag?')) return;
    await api.delete('/cart').catch(() => {});
    setItems([]);
  };

  const subtotal = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!items.length) return;
    const cartItems = items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-28 skeleton rounded-pebble" />)}
        </div>
        <div className="h-48 skeleton rounded-pebble" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <header className="flex items-end justify-between mb-8">
        <div>
          <div className="eyebrow">Your bag</div>
          <h1 className="font-display text-display-sm md:text-display mt-2">
            {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}<span className="text-saffron">.</span>
          </h1>
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="btn-ghost text-rose hover:bg-rose/10">
            <Trash2 size={16} /> Empty bag
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-ink/15 rounded-pebble bg-paper">
          <ShoppingBag size={32} className="mx-auto text-ash mb-3" />
          <p className="font-display text-2xl text-ink">Your bag is empty.</p>
          <p className="text-ash mt-1">Let&apos;s find something you&apos;ll love.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary mt-6">
            Browse the shop <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 p-4 bg-paper border border-ink/10 rounded-pebble hover:border-ink/25 transition"
              >
                <button
                  onClick={() => navigate(`/product/${item.productId}`)}
                  className="w-24 h-28 rounded-md overflow-hidden bg-sand flex-shrink-0"
                >
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl.split(',')[0].trim()}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ash font-display italic">—</div>
                  )}
                </button>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="eyebrow">{item.product.category}</div>
                  <h3
                    className="mt-1 font-medium text-ink truncate cursor-pointer hover:underline underline-offset-4 decoration-saffron"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.product.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <div className="inline-flex items-center border border-ink/15 rounded-pebble">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={updating === item.productId}
                        className="w-9 h-9 flex items-center justify-center hover:bg-ink/5 disabled:opacity-50"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={updating === item.productId || item.quantity >= item.product.stockQuantity}
                        className="w-9 h-9 flex items-center justify-center hover:bg-ink/5 disabled:opacity-50"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg">{formatINR(Number(item.product.price) * item.quantity)}</div>
                      <div className="text-xs text-ash">{formatINR(Number(item.product.price))} each</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  disabled={updating === item.productId}
                  aria-label="Remove"
                  className="self-start text-ash hover:text-rose transition p-2"
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-36 h-fit">
            <div className="card space-y-4">
              <div className="eyebrow">Order summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ash">Subtotal ({totalItems})</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">Delivery</span>
                  <span className={shipping === 0 ? 'text-moss font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'Free' : formatINR(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-ash">
                    Add {formatINR(1999 - subtotal)} more for free delivery
                  </div>
                )}
              </div>
              <div className="rule" />
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-ink">Total</span>
                <span className="font-display text-2xl">{formatINR(total)}</span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full h-12">
                Checkout <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/shop')} className="btn-ghost w-full">
                Keep shopping
              </button>
            </div>

            <div className="mt-4 text-xs text-ash text-center">
              Secure payment · Free returns within 7 days
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
