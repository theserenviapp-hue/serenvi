import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ShoppingBag,
  Heart,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  type?: string;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
  gender?: string;
}

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'new';

const PAGE_SIZE = 24;

/** Curated taxonomy — mapped to `category` / `gender` fields in the DB.
 *  Each chip resolves to a filter function + optional URL param. */
const curatedChips: Array<{ label: string; match: (p: Product) => boolean; param?: string }> = [
  { label: 'All',           match: () => true },
  { label: 'Women',         match: (p) => /women|female/i.test(p.gender || ''), param: 'g=Women' },
  { label: 'Men',           match: (p) => /men|male/i.test(p.gender || ''),     param: 'g=Men' },
  { label: 'Dresses',       match: (p) => /dress/i.test(p.category) },
  { label: 'Tops & Tees',   match: (p) => /top|tshirt|t-shirt|tee|shirt|camisole/i.test(p.category) },
  { label: 'Bottoms',       match: (p) => /pant|trouser|jean|jegging|skirt|short/i.test(p.category) },
  { label: 'Outerwear',     match: (p) => /jacket|coat|hoodie|sweatshirt|sweater|cardigan/i.test(p.category) },
  { label: 'Footwear',      match: (p) => /foot|shoe|sandal|sneaker|heel|loafer|boot/i.test(p.category) },
  { label: 'Home & Living', match: (p) => /home|living|decor|kitchen|lamp/i.test(p.category) },
  { label: 'Beauty',        match: (p) => /beauty|skin|hair|fragrance|cosmetic/i.test(p.category) },
];

const firstImage = (src?: string) => (src ? src.split(',')[0].trim() : '');

const formatINR = (n: number) =>
  `₹${Math.round(n).toLocaleString('en-IN')}`;

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [query, setQuery] = useState(params.get('q') ?? '');
  const [active, setActive] = useState<string>(() => {
    if (params.get('g') === 'Women') return 'Women';
    if (params.get('g') === 'Men') return 'Men';
    if (params.get('c') === 'Footwear') return 'Footwear';
    if (params.get('c') === 'Home') return 'Home & Living';
    if (params.get('c') === 'Beauty') return 'Beauty';
    return 'All';
  });
  const [sort, setSort] = useState<SortKey>(() => {
    const s = params.get('sort');
    return (['price-asc', 'price-desc', 'new', 'relevance'].includes(s || '') ? s : 'relevance') as SortKey;
  });
  const [maxPrice, setMaxPrice] = useState<number | null>(() => {
    const m = params.get('max');
    return m ? Number(m) : null;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Sync URL with state (shallow)
  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (active === 'Women') next.set('g', 'Women');
    if (active === 'Men')   next.set('g', 'Men');
    if (active === 'Footwear') next.set('c', 'Footwear');
    if (active === 'Home & Living') next.set('c', 'Home');
    if (active === 'Beauty') next.set('c', 'Beauty');
    if (sort !== 'relevance') next.set('sort', sort);
    if (maxPrice) next.set('max', String(maxPrice));
    setParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, active, sort, maxPrice]);

  useEffect(() => {
    api
      .get('/products?take=2000')
      .then((res) => setProducts(res.data.products || res.data || []))
      .catch((e) => console.error('Products fetch failed', e))
      .finally(() => setLoading(false));
  }, []);

  // Derived lists
  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 10000 };
    const ps = products.map((p) => Number(p.price));
    return { min: Math.min(...ps), max: Math.max(...ps) };
  }, [products]);

  const filtered = useMemo(() => {
    const chip = curatedChips.find((c) => c.label === active) ?? curatedChips[0];
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => chip.match(p));

    if (q) {
      list = list.filter((p) =>
        [p.name, p.category, p.description, p.gender].some((f) =>
          (f || '').toLowerCase().includes(q),
        ),
      );
    }
    if (maxPrice) list = list.filter((p) => Number(p.price) <= maxPrice);

    switch (sort) {
      case 'price-asc':  list = [...list].sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price-desc': list = [...list].sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'new':        list = [...list].reverse(); break;
      default: break;
    }
    return list;
  }, [products, active, query, sort, maxPrice]);

  // Reset pagination on filter change
  useEffect(() => { setPage(1); }, [active, query, sort, maxPrice]);

  const pageItems = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = pageItems.length < filtered.length;

  const addToCart = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setAddingId(productId);
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      // Small toast via native alert-less UX — reuse chip pulse or toast lib later
      // For now, a very quiet confirmation:
      const el = document.getElementById(`pc-${productId}`);
      if (el) {
        el.classList.add('ring-2', 'ring-saffron');
        setTimeout(() => el.classList.remove('ring-2', 'ring-saffron'), 700);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ---------- Editorial hero ---------- */}
      <section className="relative overflow-hidden rounded-pebble border border-ink/10 bg-paper">
        <div className="grid md:grid-cols-12">
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
            <div className="eyebrow">Spring Edit · 2026</div>
            <div className="mt-6">
              <h1 className="font-display text-display-sm md:text-display tracking-tightest text-balance">
                A bazaar, <em className="not-italic text-saffron" style={{ fontStyle: 'italic' }}>refined.</em><br />
                Hand-picked for the modern&nbsp;home.
              </h1>
              <p className="mt-5 text-ash max-w-md text-pretty leading-relaxed">
                Sarees, sneakers, sweaters and sideboards — {products.length.toLocaleString('en-IN')} pieces
                curated from ateliers across India, delivered to your door and earning your network on every sale.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setActive('Women')} className="btn-primary">Shop Women <ChevronRight size={16} /></button>
              <button onClick={() => setActive('Men')} className="btn-secondary">Shop Men</button>
              <button onClick={() => { setSort('new'); setActive('All'); }} className="btn-ghost">New arrivals</button>
            </div>
          </div>
          <div className="md:col-span-5 relative min-h-[260px] md:min-h-full bg-sand">
            {/* Sequenced editorial tiles from actual product images */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1">
              {products.slice(0, 9).map((p, i) => (
                <div
                  key={p.id}
                  className={`overflow-hidden ${i === 4 ? 'col-span-1 row-span-1' : ''}`}
                  style={{ animation: `fadeUp .6s ${i * 50}ms both` }}
                >
                  <img
                    src={firstImage(p.imageUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 right-3 bg-ink text-ivory text-xs font-mono tracking-wider px-2.5 py-1 rounded">
              LIVE · {products.length} SKUs
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Toolbar ---------- */}
      <section className="space-y-5">
        {/* Search + controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 h-12 bg-paper border border-ink/15 rounded-pebble focus-within:border-ink">
            <Search size={18} className="text-ash" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${products.length.toLocaleString('en-IN')} products…`}
              className="flex-1 bg-transparent outline-none text-ink placeholder:text-ash"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear" className="text-ash hover:text-ink">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="btn-secondary btn-sm"
              aria-pressed={filtersOpen}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none pl-9 pr-8 py-2 bg-paper border border-ink/15 rounded-pebble text-sm focus:outline-none focus:border-ink"
                aria-label="Sort"
              >
                <option value="relevance">Sort: Curated</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <ArrowUpDown size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ash" />
            </div>
          </div>
        </div>

        {/* Advanced filter drawer */}
        {filtersOpen && (
          <div className="card animate-fade-up">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="eyebrow mb-3">Maximum price</div>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={maxPrice ?? priceBounds.max}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-ink"
                />
                <div className="flex items-center justify-between mt-2 text-sm text-ash font-mono">
                  <span>{formatINR(priceBounds.min)}</span>
                  <span className="text-ink font-sans font-medium">Up to {formatINR(maxPrice ?? priceBounds.max)}</span>
                  <span>{formatINR(priceBounds.max)}</span>
                </div>
              </div>
              <div>
                <div className="eyebrow mb-3">Quick picks</div>
                <div className="flex flex-wrap gap-2">
                  {[999, 1499, 1999, 2999].map((v) => (
                    <button key={v} onClick={() => setMaxPrice(v)} className="chip">
                      Under {formatINR(v)}
                    </button>
                  ))}
                  <button onClick={() => setMaxPrice(null)} className="chip">
                    Any price
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curated chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1 -mx-1 px-1">
          {curatedChips.map((c) => (
            <button
              key={c.label}
              onClick={() => setActive(c.label)}
              className={`chip whitespace-nowrap ${active === c.label ? 'chip-active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between pt-2 rule">
          <div className="text-sm text-ash pt-3">
            <span className="text-ink font-semibold">{filtered.length.toLocaleString('en-IN')}</span>
            {' '}pieces
            {active !== 'All' && <> in <em className="not-italic text-ink">{active}</em></>}
            {query && <> matching <em className="not-italic text-ink">“{query}”</em></>}
          </div>
        </div>
      </section>

      {/* ---------- Grid ---------- */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-pebble overflow-hidden border border-ink/10">
              <div className="aspect-[4/5] skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-2/3 skeleton rounded" />
                <div className="h-3 w-1/3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-ink/15 rounded-pebble">
          <div className="font-display text-2xl text-ink mb-1">Nothing matches — yet.</div>
          <div className="text-ash">Try a broader search or clear filters.</div>
          <button
            onClick={() => { setQuery(''); setMaxPrice(null); setActive('All'); }}
            className="btn-secondary mt-5"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {pageItems.map((p, idx) => (
              <article
                id={`pc-${p.id}`}
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="product-card"
                style={{ animation: `fadeUp .45s ${Math.min(idx, 12) * 20}ms both` }}
              >
                <div className="product-media">
                  {p.imageUrl ? (
                    <img src={firstImage(p.imageUrl)} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-ash font-display italic">
                      no image
                    </div>
                  )}
                  {Number(p.price) < 1500 && (
                    <span className="absolute top-3 left-3 bg-ink text-ivory text-[10px] font-mono tracking-widest px-2 py-1 rounded">
                      UNDER ₹1.5K
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper/90 border border-ink/10 flex items-center justify-center text-ink/70 hover:text-saffron transition"
                    aria-label="Save"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-[10px] font-mono tracking-wider text-ash uppercase">
                    {p.category}{p.gender ? ` · ${p.gender}` : ''}
                  </div>
                  <h3 className="mt-1 text-[0.95rem] leading-snug text-ink font-sans font-medium line-clamp-2">
                    {p.name}
                  </h3>

                  <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                    <div>
                      <div className="font-display text-lg text-ink leading-none">
                        {formatINR(Number(p.price))}
                      </div>
                      {p.stockQuantity === 0 && (
                        <div className="text-[11px] text-rose mt-1">Out of stock</div>
                      )}
                    </div>
                    <button
                      onClick={(e) => addToCart(e, p.id)}
                      disabled={p.stockQuantity === 0 || addingId === p.id}
                      className="group/btn inline-flex items-center gap-1.5 px-3 py-2 rounded-pebble border border-ink/15 text-ink text-sm font-medium hover:bg-ink hover:text-ivory hover:border-ink transition disabled:opacity-50"
                      aria-label="Add to cart"
                    >
                      {addingId === p.id ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShoppingBag size={14} />
                      )}
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button onClick={() => setPage((p) => p + 1)} className="btn-secondary">
                Load more <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;
