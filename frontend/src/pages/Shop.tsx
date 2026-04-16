import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
}

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  useEffect(() => {
    // Load products and cart count independently — product list should
    // render even if cart call fails (e.g. transient auth issue).
    api
      .get('/products')
      .then((res) => setProducts(res.data.products || res.data || []))
      .catch((e) => console.error('Products fetch failed', e))
      .finally(() => setLoading(false));

    api
      .get('/cart/count')
      .then((res) => setCartCount(res.data.count || 0))
      .catch((e) => console.warn('Cart count fetch failed', e));
  }, []);

  const addToCart = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setAddingId(productId);
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      setCartCount(prev => prev + 1);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            🛍️ SERENVI Shop
          </h1>
          <p className="text-slate-400">Premium products for your lifestyle</p>
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="relative px-5 py-3 bg-slate-800 border border-cyan-500/30 rounded-xl text-slate-300 hover:text-white hover:border-cyan-400 transition flex items-center gap-2 group"
        >
          <span className="text-xl">🛒</span>
          <span className="font-semibold group-hover:text-cyan-400 transition">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden hover:border-cyan-400/80 transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10"
          >
            {/* Product Image */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 h-48 flex items-center justify-center border-b border-slate-700 overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl.split(',')[0].trim()} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-6xl">📦</span>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-cyan-400 transition">{product.name}</h3>
              <p className="text-slate-400 text-sm mb-1">{product.category}</p>
              {product.description && <p className="text-slate-500 text-xs mb-3 line-clamp-2">{product.description}</p>}

              {/* Price */}
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                ₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>

              {/* Add to Cart Button */}
              <button
                onClick={(e) => addToCart(e, product.id)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={product.stockQuantity === 0 || addingId === product.id}
              >
                {addingId === product.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : product.stockQuantity === 0 ? (
                  'Out of Stock'
                ) : (
                  <>🛒 Add to Cart</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Products */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No products available</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
