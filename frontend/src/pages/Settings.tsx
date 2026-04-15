import React, { useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
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
    name: '',
    email: '',
    phone: '',
    bankAccount: '',
    bankIFSC: '',
    bankAccountHolder: '',
    referralCode: '',
    rank: '',
  });
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [bankLocked, setBankLocked] = useState(false);
  // OTP flow state
  const [showBankChange, setShowBankChange] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newBank, setNewBank] = useState({ bankAccount: '', bankIFSC: '', bankAccountHolder: '' });
  const [bankUpdating, setBankUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const distributorId = localStorage.getItem('distributorId') || '';
        const response = await api.get(`/distributors/${distributorId}`);
        const d = response.data;
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
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      await api.updateProfile(distributorId, {
        ...(bankLocked ? {} : {
          bankAccount: profile.bankAccount,
          bankIFSC: profile.bankIFSC,
          bankAccountHolder: profile.bankAccountHolder,
        }),
      });
      // Lock bank fields after first successful save with bank details
      if (profile.bankAccount && profile.bankIFSC) {
        setBankLocked(true);
      }
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBankOtp = async () => {
    setOtpSending(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      await api.post(`/distributors/${distributorId}/bank/send-otp`);
      setOtpSent(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleBankUpdate = async () => {
    setBankUpdating(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      const response = await api.post(`/distributors/${distributorId}/bank/update`, {
        otp,
        bankAccount: newBank.bankAccount,
        bankIFSC: newBank.bankIFSC,
        bankAccountHolder: newBank.bankAccountHolder,
      });
      setProfile({
        ...profile,
        bankAccount: response.data.bankAccount,
        bankIFSC: response.data.bankIFSC,
        bankAccountHolder: response.data.bankAccountHolder,
      });
      setShowBankChange(false);
      setOtpSent(false);
      setOtp('');
      setNewBank({ bankAccount: '', bankIFSC: '', bankAccountHolder: '' });
      alert('✅ Bank details updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update bank details');
    } finally {
      setBankUpdating(false);
    }
  };

  const copyReferralCode = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      alert('Referral code copied to clipboard!');
    } catch (error) {
      alert('Failed to copy referral code');
    } finally {
      setCopying(false);
    }
  };

  const regenerateReferralCode = async () => {
    if (!window.confirm('Are you sure you want to regenerate your referral code? Your old code will no longer work.')) {
      return;
    }
    
    setRegenerating(true);
    try {
      const distributorId = localStorage.getItem('distributorId') || '';
      const response = await api.post(`/distributors/${distributorId}/regenerate-referral-code`);
      setProfile({
        ...profile,
        referralCode: response.data.referralCode,
      });
      alert('✅ Referral code regenerated successfully!');
    } catch (error: any) {
      console.error('Regenerate error:', error);
      alert(error.response?.data?.message || 'Failed to regenerate referral code');
    } finally {
      setRegenerating(false);
    }
  };

  const { signOut } = useClerk();
  const handleLogout = () => {
    localStorage.removeItem('distributorId');
    signOut({ redirectUrl: '/login' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">Settings</h1>
        <p className="text-slate-400">Manage your profile and referral network</p>
      </div>

      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-10 -z-10 animate-pulse"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">🎯 Your Unique Referral Code</h2>
          <p className="text-slate-300 mb-4 leading-relaxed">This is your exclusive 6-character referral code. Share it with others to build your network and earn commissions. Each code is completely unique to your account.</p>
          
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/80 p-6 rounded-lg border border-cyan-500/50 backdrop-blur-sm hover:border-cyan-400/80 transition-all duration-300 group">
            <code className="text-5xl md:text-6xl font-bold tracking-widest text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text font-mono">{profile.referralCode || '------'}</code>
            <div className="flex flex-col sm:flex-row gap-2 ml-auto">
              <button
                onClick={copyReferralCode}
                disabled={copying}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 whitespace-nowrap disabled:opacity-50"
              >
                {copying ? '✓ Copied' : '📋 Copy'}
              </button>
              <button
                onClick={regenerateReferralCode}
                disabled={regenerating}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition font-semibold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 whitespace-nowrap disabled:opacity-50"
              >
                {regenerating ? '⏳ Regenerating...' : '🔄 Regenerate'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-4 rounded-lg">
            <p className="text-sm text-slate-300"><strong>💡 HOW TO SHARE:</strong> Give your 6-character referral code to your friends. They can use it when registering in the "Sponsor's Phone or Referral Code" field.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-100">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Current Rank</label>
            <input
              type="text"
              disabled
              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed focus:outline-none"
              value={profile.rank}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">Email</label>
            <input
              type="email"
              disabled
              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed focus:outline-none"
              value={profile.email}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">Full Name</label>
            <input
              type="text"
              disabled
              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed focus:outline-none"
              value={profile.name}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">Phone</label>
            <input
              type="tel"
              disabled
              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed focus:outline-none"
              value={profile.phone}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">Bank Account Holder</label>
            <input
              type="text"
              name="bankAccountHolder"
              className={`w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500 ${bankLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              value={profile.bankAccountHolder}
              onChange={handleChange}
              disabled={bankLocked}
              placeholder="Account holder name"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">Bank Account</label>
            <input
              type="text"
              name="bankAccount"
              className={`w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500 ${bankLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              value={profile.bankAccount}
              onChange={handleChange}
              disabled={bankLocked}
              placeholder="Account number"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">Bank IFSC</label>
            <input
              type="text"
              name="bankIFSC"
              className={`w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500 ${bankLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              value={profile.bankIFSC}
              onChange={handleChange}
              disabled={bankLocked}
              placeholder="e.g. HDFC0001234"
            />
          </div>

          {bankLocked && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <p className="text-yellow-400 text-sm">🔒 Bank details are locked. To change them, click the button below — an OTP will be sent to your registered email.</p>
              <button
                type="button"
                onClick={() => setShowBankChange(true)}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-700 transition text-sm"
              >
                🔄 Change Bank Details
              </button>
            </div>
          )}

          <button onClick={handleSave} className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? '⏳ Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </div>

      {/* Bank Change OTP Modal */}
      {showBankChange && (
        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-xl font-bold mb-4 text-slate-100">🔐 Change Bank Details</h2>
          <p className="text-slate-400 text-sm mb-4">An OTP will be sent to your registered email. Enter the OTP along with your new bank details below.</p>

          {!otpSent ? (
            <button
              onClick={handleSendBankOtp}
              disabled={otpSending}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg disabled:opacity-50"
            >
              {otpSending ? '⏳ Sending OTP...' : '📧 Send OTP to Email'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                <p className="text-green-400 text-sm">✅ OTP sent to your registered email. Valid for 10 minutes.</p>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">OTP</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500 tracking-widest text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">New Account Holder Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500"
                  value={newBank.bankAccountHolder}
                  onChange={(e) => setNewBank({ ...newBank, bankAccountHolder: e.target.value })}
                  placeholder="Account holder name"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">New Bank Account Number</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500"
                  value={newBank.bankAccount}
                  onChange={(e) => setNewBank({ ...newBank, bankAccount: e.target.value })}
                  placeholder="Account number"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">New IFSC Code</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500"
                  value={newBank.bankIFSC}
                  onChange={(e) => setNewBank({ ...newBank, bankIFSC: e.target.value })}
                  placeholder="e.g. HDFC0001234"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBankUpdate}
                  disabled={bankUpdating || otp.length !== 6 || !newBank.bankAccount || !newBank.bankIFSC || !newBank.bankAccountHolder}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg disabled:opacity-50"
                >
                  {bankUpdating ? '⏳ Updating...' : '✓ Update Bank Details'}
                </button>
                <button
                  onClick={() => { setShowBankChange(false); setOtpSent(false); setOtp(''); }}
                  className="px-4 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/50 to-slate-900/50 backdrop-blur-sm p-8">
        <h2 className="text-xl font-bold mb-4 text-red-400">🚨 Danger Zone</h2>
        <button onClick={handleLogout} className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-lg shadow-red-500/20">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
