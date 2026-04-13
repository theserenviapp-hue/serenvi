import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import Layout from '../components/Common/Layout';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        if (!id) {
          setError('Member ID not found');
          return;
        }

        // Try to fetch by ID first, then by referral code
        try {
          const response = await apiClient.get(`/distributors/${id}`);
          setMember(response.data);
          setError(null);
        } catch (err: any) {
          // If not found by ID, try by referral code
          if (err.response?.status === 404) {
            try {
              const response = await apiClient.get(`/distributors/profile/referral/${id}`);
              setMember(response.data);
              setError(null);
            } catch (refErr: any) {
              throw refErr;
            }
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load member profile');
        console.error('Error fetching member profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberProfile();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin"></div>
            </div>
            <p className="text-slate-400 mt-4">Loading member profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !member) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">❌</div>
            <p className="text-red-400 text-lg mb-4">{error || 'Member not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const joinDate = member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A';
  const rank = member.rank || 'Influencer';
  const totalSales = member.totalSales?.toLocaleString() || '0';
  const walletBalance = member.walletBalance?.toLocaleString() || '0';
  const carryForwardSales = member.carryForwardSales?.toLocaleString() || '0';

  return (
    <Layout>
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition"
        >
          ← Back
        </button>

        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">{member.name}</h1>
                <p className="text-emerald-400 font-mono text-sm mt-1">ID: {member.referralCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-sm font-medium">Rank</p>
                <p className="text-2xl font-bold text-emerald-400 mt-2">{rank}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-sm font-medium">Join Date</p>
                <p className="text-lg font-bold text-cyan-300 mt-2">{joinDate}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-sm font-medium">Referral Code</p>
                <p className="text-lg font-bold text-blue-300 font-mono mt-2">{member.referralCode}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Total Sales */}
            <div className="bg-slate-800 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Total Sales</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-4xl font-bold text-emerald-400">₹{totalSales}</p>
              <p className="text-slate-400 text-sm mt-2">Lifetime sales generated</p>
            </div>

            {/* Wallet Balance */}
            <div className="bg-slate-800 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Wallet Balance</h3>
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-4xl font-bold text-cyan-400">₹{walletBalance}</p>
              <p className="text-slate-400 text-sm mt-2">Available balance</p>
            </div>

            {/* Carry Forward Sales */}
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Carry Forward Sales</h3>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-4xl font-bold text-purple-400">₹{carryForwardSales}</p>
              <p className="text-slate-400 text-sm mt-2">Pending achievement sales</p>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-800 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Contact Information</h3>
                <span className="text-2xl">📞</span>
              </div>
              <p className="text-lg font-mono text-blue-300">{member.phone || 'N/A'}</p>
              <p className="text-slate-400 text-sm mt-1">{member.email || 'N/A'}</p>
            </div>
          </div>

          {/* Additional Info */}
          {member.bankAccount && (
            <div className="bg-slate-800 border border-slate-600/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Banking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Holder:</span>
                  <span className="text-white font-semibold">{member.bankAccountHolder || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="text-white font-semibold font-mono">{member.bankAccount?.slice(-4).padStart(member.bankAccount.length, '*') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="text-white font-semibold font-mono">{member.bankIFSC || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-6">
            <p className="text-blue-300 text-sm">
              For more details or to modify information, please visit your dashboard or contact support.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
