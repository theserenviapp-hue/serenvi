import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = () => {
    signOut({ redirectUrl: '/login' });
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const isAdmin = (user?.publicMetadata as any)?.role === 'admin';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shop', label: 'Shop', icon: '🛍️' },
    { path: '/cart', label: 'Cart', icon: '🛒' },
    { path: '/achievements', label: 'Achievements', icon: '🏆' },
    { path: '/team', label: 'My Team', icon: '👥' },
    { path: '/wallet', label: 'Wallet', icon: '💰' },
    { path: '/history', label: 'History', icon: '📜' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: '🛡️' }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 fixed h-full z-40 md:static md:translate-x-0 flex flex-col border-r border-cyan-500/20`}
      >
        <div className="p-6 flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">S</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">SERENVI</h1>
          </div>
          <button
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="mt-8 space-y-1 px-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-lg transition duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 hover:border-l-2 hover:border-cyan-400'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="inline-block mr-3">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-cyan-500/20">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition font-semibold text-white shadow-lg hover:shadow-red-500/30"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 shadow-xl p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition p-2 hover:bg-slate-800 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded"></div>
            <h2 className="text-xl font-bold text-slate-100">SERENVI MLM Platform</h2>
          </div>
          <UserButton afterSignOutUrl="/login" />
        </div>

        {/* Content */}
        <div className="p-6 min-h-[calc(100vh-80px)]">{children}</div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
