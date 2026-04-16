import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import Layout from './components/Common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Wallet from './pages/Wallet';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Team from './pages/Team';
import History from './pages/History';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import { setTokenGetter } from './services/api';
import { useMe } from './hooks/useMe';

const TokenSync: React.FC = () => {
  const { getToken } = useAuth();
  React.useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
  return null;
};

/** Inner routes — sees Clerk context + /me result, gates onboarding. */
const SignedInApp: React.FC = () => {
  const { me, loading } = useMe();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  // If profile incomplete (no phone) -> force /onboarding
  const needsOnboarding = me && !me.onboarded;
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  if (!needsOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname === '/onboarding') {
    return <Onboarding />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/team" element={<Team />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <TokenSync />
      <SignedIn>
        <SignedInApp />
      </SignedIn>
      <SignedOut>
        <Routes>
          <Route path="/login/*" element={<Login />} />
          <Route path="/register/*" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SignedOut>
    </Router>
  );
};

export default App;
