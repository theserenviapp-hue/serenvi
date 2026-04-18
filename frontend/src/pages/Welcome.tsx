import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Wallet, Truck, ShieldCheck, Instagram, Twitter, Youtube, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import Logo from '../components/Common/Logo';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  gender?: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const firstImage = (s?: string) => (s ? s.split(',')[0].trim() : '');
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * Public marketing / preview page.
 *
 * Accessible WITHOUT login so that:
 *   - external reviewers (Razorpay, Google, etc.) can verify the business
 *     model, pricing and product catalogue before login is required
 *   - SEO crawlers can index the brand
 *
 * Hits only public backend endpoints (/products) — no auth header needed.
 */
const Welcome: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/products?take=12`)
      .then((r) => setProducts(r.data.products || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const priceBand =
    products.length > 0
      ? {
          min: Math.min(...products.map((p) => Number(p.price))),
          max: Math.max(...products.map((p) => Number(p.price))),
        }
      : null;

  return (
    <div className="min-h-screen bg-editorial bg-grain text-ink">
      {/* Ticker */}
      <div className="bg-ink text-ivory text-xs md:text-[13px] overflow-hidden">
        <div className="marquee-track flex gap-10 py-2 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, c) =>
            [
              'Free shipping over ₹1,999',
              '·',
              '15 levels of network commissions',
              '·',
              'Hand-picked from ateliers across India',
              '·',
              'Secure payments by Razorpay',
              '·',
            ].map((t, i) => <span key={`${c}-${i}`}>{t}</span>),
          )}
        </div>
      </div>

      {/* Masthead */}
      <header className="border-b border-ink/10 bg-ivory/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/welcome" className="text-ink"><Logo className="h-9 w-auto" /></Link>
          <nav className="hidden md:flex gap-6 text-sm text-ink/75">
            <a href="#shop"     className="hover:text-ink transition">Shop</a>
            <a href="#pricing"  className="hover:text-ink transition">Pricing</a>
            <a href="#how"      className="hover:text-ink transition">How it works</a>
            <a href="#contact"  className="hover:text-ink transition">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn-primary btn-sm">Join</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-24 grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-7">
          <div className="eyebrow">Est. 2026 · India</div>
          <h1 className="mt-5 font-display text-display md:text-display-lg leading-[0.98] text-balance">
            A bazaar, <em className="not-italic text-saffron" style={{ fontStyle: 'italic' }}>refined.</em>
            <br />
            Earned, and shared.
          </h1>
          <p className="mt-6 text-ink/75 text-lg max-w-xl leading-relaxed">
            Serenvi is a curated catalogue of fashion, footwear, home &amp; living and beauty
            — delivered across India, and paid forward through a 15-level referral network.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">Join the network</Link>
            <a href="#shop" className="btn-secondary">Browse products</a>
          </div>
          {priceBand && (
            <div className="mt-8 eyebrow">
              Pricing · {formatINR(priceBand.min)} – {formatINR(priceBand.max)} · All prices incl. taxes
            </div>
          )}
        </div>

        {/* Hero visual */}
        <div className="md:col-span-5">
          <div className="aspect-[4/5] relative rounded-pebble overflow-hidden bg-sand border border-ink/10">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1">
              {products.slice(0, 4).map((p) => (
                <img
                  key={p.id}
                  src={firstImage(p.imageUrl)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ))}
            </div>
            <div className="absolute bottom-3 left-3 bg-ink text-ivory text-[10px] font-mono tracking-widest px-2 py-1 rounded">
              LIVE CATALOGUE
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-ink/10 bg-paper/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShoppingBag, title: 'Curated catalogue',    body: `${products.length || '700+'} pieces hand-picked from Indian ateliers and brands.` },
            { icon: Users,       title: '15-level network',     body: 'Every signup carries a sponsor — earnings propagate 15 levels up.' },
            { icon: Wallet,      title: 'Transparent wallet',   body: 'Real-time balance, transfers, withdrawals and audit log for every user.' },
            { icon: ShieldCheck, title: 'Secure payments',      body: 'Razorpay-backed checkout for UPI, cards, net-banking, and wallets.' },
          ].map((b) => (
            <div key={b.title} className="flex flex-col gap-2">
              <b.icon size={20} className="text-saffron" />
              <div className="font-display text-lg text-ink">{b.title}</div>
              <div className="text-sm text-ash text-pretty">{b.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Product preview */}
      <section id="shop" className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="eyebrow">Sample of the shop</div>
            <h2 className="mt-2 font-display text-display-sm md:text-display text-ink text-balance">
              Pieces, in rotation.
            </h2>
          </div>
          <Link to="/login" className="btn-secondary btn-sm">Sign in to browse full catalogue</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] skeleton rounded-pebble" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-media">
                  {p.imageUrl ? (
                    <img src={firstImage(p.imageUrl)} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ash italic font-display">no image</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-[10px] font-mono tracking-wider text-ash uppercase">
                    {p.category}{p.gender ? ` · ${p.gender}` : ''}
                  </div>
                  <h3 className="mt-1 font-medium line-clamp-2">{p.name}</h3>
                  <div className="mt-3 font-display text-lg">{formatINR(Number(p.price))}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Pricing / business model */}
      <section id="pricing" className="bg-paper border-y border-ink/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-2 gap-12">
          <div>
            <div className="eyebrow">How Serenvi makes money</div>
            <h2 className="mt-3 font-display text-display-sm md:text-display text-ink text-balance">
              Retail margin. <br />Shared upward.
            </h2>
            <p className="mt-5 text-ink/80 leading-relaxed text-pretty max-w-prose">
              Serenvi sells physical goods (apparel, footwear, home &amp; living, beauty) at retail
              prices ranging from {priceBand ? `${formatINR(priceBand.min)} to ${formatINR(priceBand.max)}` : '₹499 to ₹9,999'}.
              Every purchase settles instantly via Razorpay. A portion of the retail margin is
              distributed as commission to up to 15 levels of the buyer&apos;s sponsor chain, forming a
              transparent referral-based distribution network.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink/80">
              <li>• Retail product sale via Razorpay checkout (UPI, Cards, Netbanking, Wallets)</li>
              <li>• Commission computed per sale, credited to sponsors&apos; wallets in real time</li>
              <li>• Monthly leadership salary for qualifying ranks</li>
              <li>• On-demand withdrawal to linked bank account (verified via email OTP)</li>
            </ul>
          </div>

          <div id="how" className="rounded-pebble border border-ink/10 bg-sand p-8">
            <div className="eyebrow">How it works</div>
            <ol className="mt-4 space-y-5">
              {[
                { n: '01', t: 'Browse & buy',        b: 'Any signed-in user can purchase from 700+ SKUs. Checkout through Razorpay.' },
                { n: '02', t: 'Earn as you share',   b: 'Share your 6-character referral code. Every purchase they make earns you.' },
                { n: '03', t: 'Grow the network',    b: 'Their referrals build your downline, up to 15 levels deep.' },
                { n: '04', t: 'Withdraw earnings',   b: 'Cash out to any verified Indian bank account via the wallet page.' },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="font-mono text-xs text-saffron tracking-widest pt-1">{s.n}</span>
                  <div>
                    <div className="font-display text-lg">{s.t}</div>
                    <div className="text-sm text-ash text-pretty">{s.b}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="eyebrow">Contact</div>
        <h2 className="mt-3 font-display text-display-sm text-ink">Questions? Write to us.</h2>
        <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
          <a href="mailto:support@serenvi.app" className="flex items-center gap-3 p-4 border border-ink/10 rounded-pebble bg-paper hover:border-ink transition">
            <Mail size={18} className="text-saffron" />
            <div>
              <div className="text-xs text-ash">Email</div>
              <div className="font-medium">support@serenvi.app</div>
            </div>
          </a>
          <a href="tel:+911800000000" className="flex items-center gap-3 p-4 border border-ink/10 rounded-pebble bg-paper hover:border-ink transition">
            <Phone size={18} className="text-saffron" />
            <div>
              <div className="text-xs text-ash">Phone</div>
              <div className="font-medium">+91 1800-00-0000</div>
            </div>
          </a>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="border-t border-ink/10 bg-paper">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-ink">
            <Logo variant="mark" className="h-9 w-9" />
            <div className="text-sm">
              <div className="font-display text-ink text-lg">Serenvi Trading Co.</div>
              <div className="text-xs text-ash font-mono tracking-wide uppercase">Modern · Indian · Bazaar</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-ink/60">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-ink"><Instagram size={16} /></a>
            <a href="https://twitter.com"   target="_blank" rel="noreferrer" aria-label="Twitter"   className="hover:text-ink"><Twitter   size={16} /></a>
            <a href="https://youtube.com"   target="_blank" rel="noreferrer" aria-label="Youtube"   className="hover:text-ink"><Youtube   size={16} /></a>
          </div>

          <div className="text-xs text-ash">
            © {new Date().getFullYear()} Serenvi · GST 29AAAAA0000A1Z5 · Made in India
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
