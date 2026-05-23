import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  stockQuantity: number;
  type: string;
  gender?: string;
  sizes?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Parse sizes from comma-separated string
  const getSizes = (sizesStr?: string): string[] => {
    if (!sizesStr) return [];
    return sizesStr.split(',').map(s => s.trim()).filter(Boolean);
  };

  // Parse images from comma-separated string
  const getImages = (imageUrl?: string): string[] => {
    if (!imageUrl) return [];
    return imageUrl.split(',').map(s => s.trim()).filter(Boolean);
  };

  // Color labels derived from image count  
  const colorLabels = ['Default', 'Variant 2', 'Variant 3', 'Variant 4', 'Variant 5', 'Variant 6'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔍 Fetching product with ID:', id);
        const response = await api.get(`/products/${id}`);
        console.log('✅ Product fetched:', response.data);
        setProduct(response.data);
      } catch (error: any) {
        console.error('❌ Failed to fetch product:', error);
        console.error('Error details:', error.response?.data || error.message);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if size is required but not selected
    if (product.sizes && getSizes(product.sizes).length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }
    
    setAddingToCart(true);
    try {
      await api.post('/cart/add', { 
        productId: product.id, 
        quantity,
        selectedSize: selectedSize || undefined 
      });
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Check if size is required but not selected
    if (product.sizes && getSizes(product.sizes).length > 0 && !selectedSize) {
      alert('Please select a size before proceeding to checkout');
      return;
    }
    
    setAddingToCart(true);
    try {
      await api.post('/cart/add', { 
        productId: product.id, 
        quantity,
        selectedSize: selectedSize || undefined 
      });
      navigate('/cart');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    console.warn('⚠️ Product is null after loading');
    return <div className="text-center py-12 text-slate-400">Product not found</div>;
  }

  const images = getImages(product.imageUrl);
  const hasMultipleImages = images.length > 1;
  const inStock = product.stockQuantity > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/shop')}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden aspect-square flex items-center justify-center">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>

          {/* Thumbnail Scroll Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveImage(idx); setSelectedColor(idx); }}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    activeImage === idx
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                      : 'border-slate-700 hover:border-slate-500 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {product.category}
          </span>

          {/* Name */}
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-slate-500 text-sm">Inclusive of all taxes</span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className={`text-sm font-medium ${inStock ? 'text-emerald-400' : 'text-red-400'}`}>
              {inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="text-slate-300 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Color / Variant Selector */}
          {hasMultipleImages && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select Variant</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedColor(idx); setActiveImage(idx); }}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      selectedColor === idx
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <img src={img} alt={`Variant ${idx + 1}`} className="w-10 h-10 rounded object-cover" />
                    <span className="text-sm font-medium whitespace-nowrap">{colorLabels[idx] || `Variant ${idx + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gender & Sizes Info */}
          {(product.gender || product.sizes) && (
            <div className="grid grid-cols-2 gap-4">
              {product.gender && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">For</h3>
                  <p className="text-slate-200 font-medium">{product.gender}</p>
                </div>
              )}
              {product.sizes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Available Sizes</h3>
                  <p className="text-slate-200 font-medium">{product.sizes}</p>
                </div>
              )}
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && getSizes(product.sizes).length > 0 && (
            <div className="space-y-3 p-4 rounded-lg bg-slate-800/50 border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Select Size</h3>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Required</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getSizes(product.sizes).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 font-bold text-base transition-all duration-200 flex items-center justify-center ${
                      selectedSize === size
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/30'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-amber-400">⚠️ Please select a size to continue</p>
              )}
              {selectedSize && (
                <p className="text-xs text-emerald-400">✓ {selectedSize} selected</p>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-700/50"></div>

          {/* Quantity Selector */}
          {inStock && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition font-bold text-lg flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-14 text-center text-xl font-bold text-slate-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition font-bold text-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {inStock && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  addedFeedback
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20'
                } disabled:opacity-50`}
              >
                {addedFeedback ? (
                  <>✓ Added to Cart</>
                ) : addingToCart ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>🛒 Add to Cart</>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                ⚡ Buy Now
              </button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: '🚚', text: 'Free Delivery' },
              { icon: '️', text: 'Genuine Product' },
              { icon: '💳', text: 'Secure Payment' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-lg">{f.icon}</span>
                <span className="text-slate-400 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
