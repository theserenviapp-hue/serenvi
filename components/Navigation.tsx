'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardNav() {
  const pathname = usePathname();

  const links = [
    { href: '/overview', label: 'Overview' },
    { href: '/shop', label: 'Shop' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/team', label: 'Team' },
    { href: '/bonuses/fast-track', label: 'Bonuses' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-4 px-2 border-b-2 ${
                pathname === link.href
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin/members', label: 'Members' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/bonuses', label: 'Bonuses' },
    { href: '/admin/withdrawals', label: 'Withdrawals' },
    { href: '/admin/financials', label: 'Financials' },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-4 px-2 border-b-2 ${
                pathname === link.href
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
