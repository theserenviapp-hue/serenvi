import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../services/api';
import Logo from '../components/Common/Logo';

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
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial bg-grain flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-ink mb-6 flex justify-center">
          <Logo className="h-12 w-auto" />
        </div>

        <div className="card">
          <div className="eyebrow mb-2">One last step</div>
          <h1 className="font-display text-3xl text-ink mb-2 text-balance">
            Let&apos;s set your ledger.
          </h1>
          <p className="text-ash mb-6 text-sm">
            A name, a number, an optional code — and you&apos;re in.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose/10 border border-rose/30 text-rose text-sm rounded-pebble">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="eyebrow">Referral Code <span className="lowercase font-sans text-ash normal-case">(optional)</span></label>
                <button
                  type="button"
                  onClick={() => {
                    setSkipReferral(!skipReferral);
                    if (!skipReferral) setReferralCode('');
                  }}
                  className="text-xs text-ink underline underline-offset-4 decoration-saffron"
                >
                  {skipReferral ? 'I have a code' : 'Skip'}
                </button>
              </div>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={skipReferral}
                className="input-field disabled:opacity-40 disabled:cursor-not-allowed"
                placeholder="Enter code from your sponsor"
              />
              <p className="text-xs text-ash mt-1">One-time only — cannot be changed later.</p>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full h-12">
              {submitting ? 'Saving…' : 'Enter the bazaar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
