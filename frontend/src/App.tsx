import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Common/Layout';
import PrivateRoute from './components/Common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token'),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('access_token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isAuthenticated) {
    return (
      <Router>
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
            <Route path="/achievements" element={<PrivateRoute component={Achievements} />} />
            <Route path="/wallet" element={<PrivateRoute component={Wallet} />} />
            <Route path="/shop" element={<PrivateRoute component={Shop} />} />
            <Route path="/product/:id" element={<PrivateRoute component={ProductDetail} />} />
            <Route path="/cart" element={<PrivateRoute component={Cart} />} />
            <Route path="/checkout" element={<PrivateRoute component={Checkout} />} />
            <Route path="/team" element={<PrivateRoute component={Team} />} />
            <Route path="/history" element={<PrivateRoute component={History} />} />
            <Route path="/settings" element={<PrivateRoute component={Settings} />} />
            <Route path="/profile/:id" element={<PrivateRoute component={UserProfile} />} />
            <Route path="/admin" element={<PrivateRoute component={Admin} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
