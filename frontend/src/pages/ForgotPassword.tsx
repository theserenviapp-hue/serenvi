import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:3001/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          SERENVI
        </h1>
        <h2 className="text-slate-400 text-center mb-6">Forgot Password</h2>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <h3 className="text-xl font-bold text-slate-100">Check your email</h3>
            <p className="text-slate-400">
              If an account exists for <span className="text-cyan-400 font-semibold">{email}</span>,
              you'll receive a password reset link shortly.
            </p>
            <a
              href="/login"
              className="inline-block mt-4 px-6 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition"
            >
              ← Back to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-slate-400 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-slate-500 text-sm">
              Remember your password?{' '}
              <a href="/login" className="text-cyan-400 hover:underline">Log in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
