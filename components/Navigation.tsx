'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, SignInButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

export function DashboardNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const links = [
    { href: '/overview', label: 'Overview' },
    { href: '/shop', label: 'Shop' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/team', label: 'Team' },
    { href: '/bonuses/fast-track', label: 'Bonuses' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 flex items-center justify-between">
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
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const links = [
    { href: '/admin/members', label: 'Members' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/bonuses', label: 'Bonuses' },
    { href: '/admin/withdrawals', label: 'Withdrawals' },
    { href: '/admin/financials', label: 'Financials' },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex gap-6">
          <Link href="/overview" className="py-4 px-2 text-gray-400 hover:text-gray-600 text-sm">
            Back to Dashboard
          </Link>
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
        <div className="flex items-center gap-4">
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
        </div>
      </div>
    </nav>
  );
}
