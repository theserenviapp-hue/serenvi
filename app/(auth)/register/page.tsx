'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    referralCode: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    memberId: '', // Generate or use a unique ID
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          memberId: formData.memberId || `USR${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white tracking-wider">
            <span className="text-red-500">=</span>
            <span className="text-blue-400">LOXA</span>
            <span className="text-cyan-400">✕</span>
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Referral ID */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">👤</span>
            <input
              type="text"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              placeholder="Referral ID*"
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Full Name */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">👤</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter Full Name*"
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">✉️</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter Your Email*"
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Mobile */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">📱</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="Enter Mobile*"
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">🔒</span>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter Password*"
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">🔒</span>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Enter Confirm Password*"
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account Now'}
          </button>
        </form>

        {/* Sign In Link */}
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 mt-4 bg-purple-700/40 hover:bg-purple-700/60 text-white font-bold rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-400/30"
        >
          Already have Account? Sign In
        </button>
      </div>
    </div>
  );
}
