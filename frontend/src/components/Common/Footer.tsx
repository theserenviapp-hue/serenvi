import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import Logo from './Logo';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/shop' },
      { label: 'Women', to: '/shop?g=Women' },
      { label: 'Men', to: '/shop?g=Men' },
      { label: 'New arrivals', to: '/shop?sort=new' },
      { label: 'Under ₹1,499', to: '/shop?max=1499' },
    ],
  },
  {
    title: 'Network',
    links: [
      { label: 'My dashboard', to: '/dashboard' },
      { label: 'My team', to: '/team' },
      { label: 'Achievements', to: '/achievements' },
      { label: 'Wallet', to: '/wallet' },
      { label: 'History', to: '/history' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Orders & shipping', to: '/history' },
      { label: 'Returns', to: '/history' },
      { label: 'Settings', to: '/settings' },
      { label: 'Contact support', to: 'mailto:support@serenvi.app' },
    ],
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-24 border-t border-ink/10 bg-ivory">
      {/* Ticker */}
      <div className="border-y border-ink/10 bg-paper/60 overflow-hidden">
        <div className="marquee-track flex gap-10 py-3 text-ash font-display italic text-sm md:text-base whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, copy) =>
            [
              'Hand-picked from ateliers across India',
              '·',
              'Free shipping on orders over ₹1,999',
              '·',
              'Earn with every share',
              '·',
              '15 levels of network rewards',
              '·',
              'Crafted for the modern bazaar',
              '·',
            ].map((t, i) => (
              <span key={`${copy}-${i}`} className="tracking-wide">
                {t}
              </span>
            )),
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-5">
            <div className="text-ink">
              <Logo className="h-14 w-auto" />
            </div>
            <p className="mt-5 max-w-sm text-ash text-pretty leading-relaxed">
              Serenvi is a modern Indian bazaar — a curated catalogue of fashion, lifestyle and home
              objects that grows through its network. Every sale supports 15 levels of makers,
              sellers and storytellers.
            </p>

            {/* Newsletter */}
            <form
              className="mt-6 flex items-center gap-2 max-w-sm"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-paper border border-ink/15 rounded-pebble focus-within:border-ink">
                <Mail size={16} className="text-ash" />
                <input
                  type="email"
                  placeholder="your@email"
                  aria-label="Email"
                  className="flex-1 bg-transparent outline-none text-ink placeholder:text-ash"
                />
              </div>
              <button type="submit" className="btn-primary btn-sm">
                Subscribe
              </button>
            </form>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-ink/15 flex items-center justify-center text-ink/70 hover:text-ink hover:border-ink transition"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="eyebrow mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.to.startsWith('mailto:') || l.to.startsWith('http') ? (
                        <a href={l.to} className="text-ink/80 hover:text-ink hover:underline underline-offset-4 decoration-saffron transition">
                          {l.label}
                        </a>
                      ) : (
                        <Link to={l.to} className="text-ink/80 hover:text-ink hover:underline underline-offset-4 decoration-saffron transition">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-12 pt-6 border-t border-ink/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ash">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Serenvi Trading Co.</span>
            <span className="hidden md:inline">·</span>
            <Link to="/settings" className="hover:text-ink">Privacy</Link>
            <span className="hidden md:inline">·</span>
            <Link to="/settings" className="hover:text-ink">Terms</Link>
            <span className="hidden md:inline">·</span>
            <span>GST 29AAAAA0000A1Z5</span>
          </div>
          <div className="font-mono tracking-wide">Made in India · Shipped worldwide</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
