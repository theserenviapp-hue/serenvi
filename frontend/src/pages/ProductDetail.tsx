import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Zap, Truck, ShieldCheck, RotateCcw, Check } from 'lucide-react';
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

const splitCsv = (s?: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * The DB `sizes` column was polluted by the original CSV import which wrote
 * the "Size/Color Variants" field straight through — so many rows contain
 * colour strings like "offwhite", "bluebeige" instead of real sizes.
 *
 * normalizeSizes() accepts the raw DB value and returns a clean size list:
 *  - if every token looks like a real clothing/shoe size → use as-is
 *  - otherwise fall back to a sensible default based on category & gender
 */
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FREE'];
const isClothingSize = (s: string) => CLOTHING_SIZES.includes(s.toUpperCase());
const isNumericSize  = (s: string) => /^\d{1,2}(\.\d)?$/.test(s.trim()); // 6, 7, 8.5, 38

function normalizeSizes(raw: string | undefined, category: string | undefined, gender: string | undefined): string[] {
  const tokens = splitCsv(raw);
  const looksLikeSize = tokens.length > 0 && tokens.every((t) => isClothingSize(t) || isNumericSize(t));
  if (looksLikeSize) return tokens.map((t) => t.toUpperCase());

  const cat = (category || '').toLowerCase();
  if (/foot|shoe|sandal|sneaker|heel|loafer|boot/.test(cat)) {
    // Indian men/women shoe size range
    return /men|male/i.test(gender || '')
      ? ['7', '8', '9', '10', '11']
      : ['4', '5', '6', '7', '8'];
  }
  if (/home|living|kitchen|decor|lamp|bag|wallet|accessor|jewel|watch|beauty|cosmet/.test(cat)) {
    return []; // no size concept
  }
  return /men|male/i.test(gender || '')
    ? ['S', 'M', 'L', 'XL', 'XXL']
    : ['S', 'M', 'L', 'XL'];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const images = useMemo(() => splitCsv(product?.imageUrl), [product]);
  const sizes  = useMemo(
    () => normalizeSizes(product?.sizes, product?.category, product?.gender),
    [product],
  );
  const inStock = (product?.stockQuantity ?? 0) > 0;

  const addOrBuy = async (redirect = false) => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size first.');
      return;
    }
    setAddingToCart(true);
    try {
      await api.post('/cart/add', {
        productId: product.id,
        quantity,
        selectedSize: selectedSize || undefined,
      });
      if (redirect) navigate('/cart');
      else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square skeleton rounded-pebble" />
        <div className="space-y-4">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-10 w-3/4 skeleton rounded" />
          <div className="h-6 w-1/3 skeleton rounded" />
          <div className="h-24 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 font-display text-ash text-2xl">Product not found.</div>;
  }

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ash mb-6">
        <button onClick={() => navigate('/shop')} className="flex items-center gap-1 hover:text-ink transition">
          <ArrowLeft size={14} /> Shop
        </button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-ink truncate max-w-[40ch]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7 grid grid-cols-12 gap-3">
          {images.length > 1 && (
            <div className="col-span-12 lg:col-span-2 flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-visible scrollbar-hidden">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-20 lg:w-full lg:h-24 overflow-hidden rounded-md border transition ${
                    activeImage === i ? 'border-ink' : 'border-ink/15 hover:border-ink/40'
                  }`}
                  aria-label={`View ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className={`col-span-12 ${images.length > 1 ? 'lg:col-span-10' : ''} order-1 lg:order-2`}>
            <div className="relative aspect-[4/5] rounded-pebble overflow-hidden bg-sand">
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full font-display italic text-ash">
                  no image
                </div>
              )}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button className="w-10 h-10 rounded-full bg-paper/90 border border-ink/10 flex items-center justify-center text-ink hover:text-saffron transition" aria-label="Save">
                  <Heart size={16} />
                </button>
                <button className="w-10 h-10 rounded-full bg-paper/90 border border-ink/10 flex items-center justify-center text-ink hover:text-saffron transition" aria-label="Share">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="eyebrow">{product.category}{product.gender ? ` · ${product.gender}` : ''}</div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl leading-tight text-balance text-ink">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="font-display text-3xl md:text-4xl text-ink">{formatINR(Number(product.price))}</div>
            <div className="text-sm text-ash">incl. all taxes</div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-moss' : 'bg-rose'}`} />
            <span className={inStock ? 'text-moss' : 'text-rose'}>
              {inStock ? `In stock · ${product.stockQuantity} left` : 'Out of stock'}
            </span>
          </div>

          {product.description && (
            <p className="text-ink/80 leading-relaxed text-pretty">{product.description}</p>
          )}

          {/* Size */}
          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="eyebrow">Size</div>
                <button className="text-xs text-ash hover:text-ink underline underline-offset-4">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] h-11 px-3 rounded-pebble border font-medium transition ${
                      selectedSize === s
                        ? 'bg-ink text-ivory border-ink'
                        : 'bg-paper text-ink border-ink/15 hover:border-ink'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {inStock && (
            <div>
              <div className="eyebrow mb-3">Quantity</div>
              <div className="inline-flex items-center border border-ink/15 rounded-pebble">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 text-xl hover:bg-ink/5"
                  aria-label="Decrease"
                >−</button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="w-11 h-11 text-xl hover:bg-ink/5"
                  aria-label="Increase"
                >+</button>
              </div>
            </div>
          )}

          {/* CTAs */}
          {inStock && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => addOrBuy(false)}
                disabled={addingToCart}
                className={`btn-secondary flex-1 h-12 ${added ? 'bg-moss text-ivory border-moss' : ''}`}
              >
                {added ? <><Check size={16} /> Added</>
                  : addingToCart ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <><ShoppingBag size={16} /> Add to bag</>}
              </button>
              <button
                onClick={() => addOrBuy(true)}
                disabled={addingToCart}
                className="btn-saffron flex-1 h-12"
              >
                <Zap size={16} /> Buy now
              </button>
            </div>
          )}

          {/* Promise */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-ink/10">
            {[
              { icon: Truck,       label: 'Free over ₹1,999' },
              { icon: ShieldCheck, label: 'Authentic pieces' },
              { icon: RotateCcw,   label: '7-day returns' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1 py-3">
                <f.icon size={18} className="text-ink" />
                <span className="text-xs text-ash">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
