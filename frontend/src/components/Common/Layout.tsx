import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Wallet,
  Trophy,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';
import Logo from './Logo';
import Footer from './Footer';
import api from '../../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Editorial Bazaar layout.
 * - Top: announcement ticker + masthead + primary category nav.
 * - Mobile: drawer with the same structure.
 * - Atmosphere: subtle grain + radial warmth behind content.
 * - Includes Footer on every page.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawer, setDrawer] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(
    (user?.publicMetadata as any)?.role === 'admin'
  );

  // Authoritative check from backend /me; Clerk metadata is only a hint.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/me')
      .then((res) => {
        if (!cancelled && res.data?.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Close drawer on route change
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  // Live cart count (best-effort)
  useEffect(() => {
    let alive = true;
    const tick = () => {
      api.get('/cart/count')
        .then(r => { if (alive) setCartCount(r.data.count || 0); })
        .catch(() => {});
    };
    tick();
    const t = window.setInterval(tick, 20_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  const primaryCats: Array<{ label: string; q: string }> = [
    { label: 'Women',        q: 'g=Women' },
    { label: 'Men',          q: 'g=Men' },
    { label: 'Footwear',     q: 'c=Footwear' },
    { label: 'Home & Living',q: 'c=Home' },
    { label: 'Beauty',       q: 'c=Beauty' },
    { label: 'New',          q: 'sort=new' },
    { label: 'Sale',         q: 'sort=price-asc' },
  ];

  const accountLinks = [
    { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/shop',         label: 'Shop',         icon: Store },
    { to: '/cart',         label: 'Cart',         icon: ShoppingBag },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
    { to: '/team',         label: 'My Team',      icon: Users },
    { to: '/wallet',       label: 'Wallet',       icon: Wallet },
    { to: '/history',      label: 'History',      icon: HistoryIcon },
    { to: '/settings',     label: 'Settings',     icon: SettingsIcon },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];

  const isActive = (p: string) => location.pathname === p;

  return (
    <div className="min-h-screen flex flex-col bg-editorial bg-grain text-ink">
      {/* Announcement ticker */}
      <div className="bg-ink text-ivory text-xs md:text-[13px] overflow-hidden">
        <div className="marquee-track flex gap-10 py-2 whitespace-nowrap font-sans tracking-wide">
          {Array.from({ length: 2 }).flatMap((_, c) =>
            [
              'Free shipping over ₹1,999',
              '·',
              'Earn on every share — 15 levels of commission',
              '·',
              'Hand-picked from ateliers across India',
              '·',
              'New arrivals every Monday',
              '·',
            ].map((t, i) => <span key={`${c}-${i}`}>{t}</span>)
          )}
        </div>
      </div>

      {/* Masthead */}
      <header className="sticky top-0 z-40 bg-ivory/85 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 py-3 md:py-4">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden -ml-1 p-2 text-ink"
              aria-label="Open menu"
              onClick={() => setDrawer(true)}
            >
              <Menu size={22} />
            </button>

            {/* Wordmark */}
            <Link to="/dashboard" aria-label="Serenvi home" className="flex items-center gap-2 text-ink">
              <span className="hidden md:inline-block" style={{ color: 'var(--ink)' }}>
                <Logo className="h-9 w-auto" />
              </span>
              <span className="md:hidden" style={{ color: 'var(--ink)' }}>
                <Logo variant="mark" className="h-8 w-8" />
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={submitSearch} className="flex-1 mx-2 md:mx-6 max-w-2xl">
              <label className="flex items-center gap-2 px-3 md:px-4 h-11 bg-paper border border-ink/15 rounded-pebble focus-within:border-ink transition">
                <Search size={18} className="text-ash shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for sarees, sneakers, lamps…"
                  className="flex-1 bg-transparent outline-none text-ink placeholder:text-ash text-sm md:text-base"
                />
                <kbd className="hidden md:inline text-[10px] font-mono text-ash border border-ink/15 rounded px-1.5 py-0.5">↵</kbd>
              </label>
            </form>

            {/* Icon actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full hover:bg-ink/5 transition text-ink"
                aria-label={`Cart (${cartCount})`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-saffron text-ivory rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <div className="pl-1 border-l border-ink/10 h-8 hidden md:block" />
              <div className="hidden md:block">
                <UserButton afterSignOutUrl="/login" />
              </div>
            </div>
          </div>

          {/* Primary categories — hidden on mobile (drawer) */}
          <nav className="hidden md:flex items-center justify-center gap-1 overflow-x-auto scrollbar-hidden -mt-1 pb-3">
            {primaryCats.map((c, i) => (
              <Link
                key={c.label}
                to={`/shop?${c.q}`}
                className={`relative px-3 py-1.5 text-[0.93rem] font-medium tracking-tight whitespace-nowrap text-ink/75 hover:text-ink transition ${
                  i === primaryCats.length - 1 ? 'text-saffron hover:text-ember' : ''
                }`}
              >
                {c.label}
                {i === primaryCats.length - 1 && (
                  <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-saffron rounded-full" />
                )}
              </Link>
            ))}
            <span className="mx-2 h-4 w-px bg-ink/15" />
            {accountLinks.slice(0, 5).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 text-[0.93rem] font-medium tracking-tight whitespace-nowrap transition ${
                  isActive(l.to) ? 'text-ink underline underline-offset-8 decoration-saffron decoration-2' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 z-40 md:hidden"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <aside
            className="fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-ivory z-50 md:hidden flex flex-col animate-fade-up border-r border-ink/10"
            role="dialog"
            aria-modal
          >
            <div className="flex items-center justify-between p-4 border-b border-ink/10">
              <div className="text-ink"><Logo className="h-8 w-auto" /></div>
              <button onClick={() => setDrawer(false)} className="p-2" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-ink/10">
              <div className="eyebrow mb-3">Shop by</div>
              <div className="grid grid-cols-2 gap-2">
                {primaryCats.map((c) => (
                  <Link
                    key={c.label}
                    to={`/shop?${c.q}`}
                    className="px-3 py-2 rounded-pebble border border-ink/15 bg-paper text-ink font-medium"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <nav className="px-2 py-3 flex-1 overflow-auto">
              <div className="eyebrow px-3 mb-2">Account</div>
              {accountLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-pebble transition ${
                    isActive(to) ? 'bg-ink text-ivory' : 'text-ink hover:bg-ink/5'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-ink/10">
              <button
                onClick={() => signOut({ redirectUrl: '/login' })}
                className="btn-secondary w-full"
              >
                Log out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
