import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../services/api';

const Onboarding: React.FC = () => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [skipReferral, setSkipReferral] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const first = user?.firstName || '';
    const last = user?.lastName || '';
    if (first || last) setName([first, last].filter(Boolean).join(' '));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/me/onboarding', {
        name: name.trim() || undefined,
        phone: phone.trim(),
        referralCode: skipReferral ? undefined : referralCode.trim() || undefined,
      });
      if (res.data?.distributorId) {
        localStorage.setItem('distributorId', res.data.distributorId);
      }
      // Hard reload so useMe refetches and `onboarded=true` is seen
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Welcome to SERENVI
        </h1>
        <p className="text-slate-400 mb-6">Complete your profile to continue</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300">Referral Code (optional)</label>
              <button
                type="button"
                onClick={() => {
                  setSkipReferral(!skipReferral);
                  if (!skipReferral) setReferralCode('');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                {skipReferral ? 'I have a code' : 'Skip'}
              </button>
            </div>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              disabled={skipReferral}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
              placeholder="Enter referral code from sponsor"
            />
            <p className="text-xs text-slate-500 mt-1">
              One-time only. Cannot be changed after signup.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
