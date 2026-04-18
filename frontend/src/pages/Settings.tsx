import React, { useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { Copy, RefreshCw, Check, KeyRound, LogOut, ShieldAlert, Lock, Mail } from 'lucide-react';
import api from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bankAccount: string;
  bankIFSC: string;
  bankAccountHolder: string;
  referralCode: string;
  rank: string;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '', email: '', phone: '',
    bankAccount: '', bankIFSC: '', bankAccountHolder: '',
    referralCode: '', rank: '',
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [bankLocked, setBankLocked] = useState(false);

  const [showBankChange, setShowBankChange] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newBank, setNewBank] = useState({ bankAccount: '', bankIFSC: '', bankAccountHolder: '' });
  const [bankUpdating, setBankUpdating] = useState(false);

  useEffect(() => {
    const distributorId = localStorage.getItem('distributorId') || '';
    api
      .get(`/distributors/${distributorId}`)
      .then((res) => {
        const d = res.data;
        setProfile({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          bankAccount: d.bankAccount || '',
          bankIFSC: d.bankIFSC || '',
          bankAccountHolder: d.bankAccountHolder || '',
          referralCode: d.referralCode || '',
          rank: d.rank || '',
        });
        setBankLocked(!!(d.bankAccount && d.bankIFSC));
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      await api.updateProfile(distributorId, bankLocked ? {} : {
        bankAccount: profile.bankAccount,
        bankIFSC: profile.bankIFSC,
        bankAccountHolder: profile.bankAccountHolder,
      });
      if (profile.bankAccount && profile.bankIFSC) setBankLocked(true);
      alert('Profile updated.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handleSendBankOtp = async () => {
    setOtpSending(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      await api.post(`/distributors/${distributorId}/bank/send-otp`);
      setOtpSent(true);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to send OTP');
    } finally { setOtpSending(false); }
  };

  const handleBankUpdate = async () => {
    setBankUpdating(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      const res = await api.post(`/distributors/${distributorId}/bank/update`, {
        otp, ...newBank,
      });
      setProfile({
        ...profile,
        bankAccount: res.data.bankAccount,
        bankIFSC: res.data.bankIFSC,
        bankAccountHolder: res.data.bankAccountHolder,
      });
      setShowBankChange(false);
      setOtpSent(false);
      setOtp('');
      setNewBank({ bankAccount: '', bankIFSC: '', bankAccountHolder: '' });
      alert('Bank details updated.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update bank details');
    } finally { setBankUpdating(false); }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { alert('Copy failed'); }
  };

  const regenerateReferralCode = async () => {
    if (!window.confirm('Regenerate your referral code? The old one will stop working.')) return;
    setRegenerating(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      const res = await api.post(`/distributors/${distributorId}/regenerate-referral-code`);
      setProfile({ ...profile, referralCode: res.data.referralCode });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Regenerate failed');
    } finally { setRegenerating(false); }
  };

  const { signOut } = useClerk();
  const handleLogout = () => {
    localStorage.removeItem('distributorId');
    signOut({ redirectUrl: '/login' });
  };

  // Display code: if the row still has a legacy cuid, truncate visually but
  // allow the user to see the full value by regenerating.
  const isLegacyLong = profile.referralCode && profile.referralCode.length > 8;

  return (
    <div className="animate-fade-up max-w-3xl">
      <header className="mb-10">
        <div className="eyebrow">Account</div>
        <h1 className="mt-2 font-display text-display-sm md:text-display text-ink">
          Settings<span className="text-saffron">.</span>
        </h1>
        <p className="mt-2 text-ash text-pretty">Profile, referrals and banking — all in one place.</p>
      </header>

      {/* Referral */}
      <section className="card mb-8">
        <div className="eyebrow mb-2">Your referral code</div>
        <h2 className="font-display text-2xl text-ink">Share this. Earn on every sale.</h2>
        <p className="mt-2 text-ash text-sm max-w-prose">
          Give this code to anyone signing up for Serenvi. Their purchases credit your network for 15 levels deep.
        </p>

        <div className="mt-5 p-5 bg-sand border border-ink/10 rounded-pebble">
          {isLegacyLong && (
            <div className="mb-3 text-xs text-ember bg-saffron/10 border border-saffron/30 rounded-md px-3 py-2">
              This code is still a legacy long ID. Click <strong>Regenerate</strong> for a clean 6-character code.
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <code
              className={`flex-1 min-w-0 font-mono font-semibold text-ink tracking-widest select-all break-all ${
                isLegacyLong ? 'text-base md:text-lg' : 'text-3xl md:text-4xl'
              }`}
            >
              {profile.referralCode || '------'}
            </code>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={copyReferralCode}
                className="btn-secondary btn-sm"
                aria-label="Copy"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={regenerateReferralCode}
                disabled={regenerating}
                className="btn-saffron btn-sm"
                aria-label="Regenerate"
              >
                <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Working…' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="card mb-8">
        <div className="eyebrow mb-2">Profile</div>
        <h2 className="font-display text-2xl text-ink mb-6">Who you are on Serenvi.</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Rank"  value={profile.rank}  disabled />
          <Field label="Email" value={profile.email} disabled />
          <Field label="Full name" value={profile.name} disabled />
          <Field label="Phone" value={profile.phone} disabled />
        </div>

        <div className="mt-8 rule pt-6">
          <div className="eyebrow mb-2">Banking</div>
          <h3 className="font-display text-xl text-ink mb-1">Where we pay you.</h3>
          <p className="text-sm text-ash mb-5">
            Added once, locked for your security. Use the OTP flow to change.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Account holder name"
              name="bankAccountHolder"
              value={profile.bankAccountHolder}
              onChange={handleChange}
              disabled={bankLocked}
              placeholder="Full name as on bank"
            />
            <Field
              label="Account number"
              name="bankAccount"
              value={profile.bankAccount}
              onChange={handleChange}
              disabled={bankLocked}
              placeholder="XXXXXXXXXXXX"
            />
            <Field
              label="IFSC"
              name="bankIFSC"
              value={profile.bankIFSC}
              onChange={handleChange}
              disabled={bankLocked}
              placeholder="HDFC0001234"
            />
          </div>

          {bankLocked ? (
            <div className="mt-5 flex items-center justify-between p-4 bg-sand border border-ink/10 rounded-pebble">
              <div className="flex items-center gap-2 text-sm text-ink">
                <Lock size={16} className="text-ash" />
                Bank details are locked. Email OTP required to change.
              </div>
              <button onClick={() => setShowBankChange(true)} className="btn-secondary btn-sm">
                <KeyRound size={14} /> Change
              </button>
            </div>
          ) : (
            <button onClick={handleSave} disabled={loading} className="btn-primary mt-6">
              {loading ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </section>

      {/* Bank change (OTP) */}
      {showBankChange && (
        <section className="card mb-8 border-saffron/30">
          <div className="eyebrow mb-2">Secure change</div>
          <h2 className="font-display text-2xl text-ink mb-2">Update bank details</h2>
          <p className="text-sm text-ash mb-5">We email a 6-digit code to confirm it's really you.</p>

          {!otpSent ? (
            <button onClick={handleSendBankOtp} disabled={otpSending} className="btn-primary">
              <Mail size={16} /> {otpSending ? 'Sending…' : 'Send OTP to email'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-moss/10 border border-moss/30 rounded-pebble text-moss text-sm">
                <Check size={14} className="inline mr-1" /> OTP sent — valid for 10 minutes.
              </div>

              <Field
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                maxLength={6}
                className="tracking-[0.4em] text-center font-mono text-lg"
              />
              <Field label="Account holder name"
                     value={newBank.bankAccountHolder}
                     onChange={(e) => setNewBank({ ...newBank, bankAccountHolder: e.target.value })}
                     placeholder="Full name as on bank" />
              <Field label="Account number"
                     value={newBank.bankAccount}
                     onChange={(e) => setNewBank({ ...newBank, bankAccount: e.target.value })}
                     placeholder="XXXXXXXXXXXX" />
              <Field label="IFSC"
                     value={newBank.bankIFSC}
                     onChange={(e) => setNewBank({ ...newBank, bankIFSC: e.target.value })}
                     placeholder="HDFC0001234" />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBankUpdate}
                  disabled={bankUpdating || otp.length !== 6 || !newBank.bankAccount || !newBank.bankIFSC || !newBank.bankAccountHolder}
                  className="btn-primary flex-1"
                >
                  {bankUpdating ? 'Updating…' : 'Update bank details'}
                </button>
                <button
                  onClick={() => { setShowBankChange(false); setOtpSent(false); setOtp(''); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Danger zone */}
      <section className="card border-rose/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="text-rose shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <div className="eyebrow mb-1">Session</div>
            <h2 className="font-display text-xl text-ink">Log out of this device.</h2>
            <p className="text-sm text-ash mt-1">You can sign back in anytime with Clerk.</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </section>
    </div>
  );
};

/* ---------- Field primitive ---------- */
const Field: React.FC<{
  label: string;
  value: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, className = '', ...rest }) => (
  <label className="block">
    <span className="eyebrow block mb-2">{label}</span>
    <input
      {...rest}
      type="text"
      className={`input-field ${rest.disabled ? 'opacity-60 cursor-not-allowed bg-sand' : ''} ${className}`}
    />
  </label>
);

export default Settings;
