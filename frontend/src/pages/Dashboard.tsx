import React, { useState } from 'react';
import { useDashboard, useTeamSalesByLevel } from '../hooks/useData';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className={`relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group`}>
    {/* Gradient Background */}
    <div className={`absolute inset-0 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
    
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-500"></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-slate-200 text-sm font-medium mb-2 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12">{icon}</div>
    </div>
    
    {/* Border Glow */}
    <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors"></div>
  </div>
);

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboard();
  const { teamSales, loading: teamSalesLoading } = useTeamSalesByLevel();
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  console.log('Dashboard render - loading:', loading, 'error:', error, 'data:', data);
  console.log('Team sales:', teamSales);
  console.log('localStorage distributorId:', localStorage.getItem('distributorId'));
  console.log('localStorage access_token:', localStorage.getItem('access_token') ? 'exists' : 'missing');

  if (loading) return <div className="text-center py-12 text-cyan-400">⚡ Loading dashboard...</div>;
  if (error) return (
    <div className="text-center py-12 text-slate-300">
      <div className="text-red-400 mb-4 text-lg font-semibold">❌ {error}</div>
      <div className="text-slate-400 text-sm">
        <p>Distributor ID: {localStorage.getItem('distributorId')}</p>
        <p>Token exists: {localStorage.getItem('access_token') ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
  if (!data) return (
    <div className="text-center py-12 text-slate-300">
      <div className="text-slate-400">No data available</div>
      <div className="text-slate-400 text-sm mt-2">
        <p>Distributor ID: {localStorage.getItem('distributorId')}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {data?.name || 'Distributor'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Personal Sales"
          value={`₹${data?.personalSales || 0}`}
          icon="🎯"
          color="bg-gradient-to-br from-orange-600 to-red-500"
        />
        <StatCard
          title="Total Sales"
          value={`₹${data?.totalSales || 0}`}
          icon="📊"
          color="bg-gradient-to-br from-blue-600 to-cyan-500"
        />
        <StatCard
          title="Monthly Sales"
          value={`₹${data?.monthlySales || 0}`}
          icon="📈"
          color="bg-gradient-to-br from-green-600 to-emerald-500"
        />
        <StatCard
          title="Total Commission Earned"
          value={`₹${data?.totalCommissionEarned || 0}`}
          icon="🎁"
          color="bg-gradient-to-br from-emerald-600 to-teal-500"
        />
        <StatCard
          title="Current Rank"
          value={data?.rank || 'Distributor'}
          icon="🏆"
          color="bg-gradient-to-br from-amber-600 to-yellow-500"
        />
        <StatCard
          title="Downline Members"
          value={data?.downlineCount || 0}
          icon="👥"
          color="bg-gradient-to-br from-purple-600 to-pink-500"
        />
        <StatCard
          title="Achievements"
          value={data?.achievementsUnlocked || 0}
          icon="⭐"
          color="bg-gradient-to-br from-pink-600 to-rose-500"
        />
        <StatCard
          title="Wallet Balance"
          value={`₹${data?.walletBalance || 0}`}
          icon="💵"
          color="bg-gradient-to-br from-indigo-600 to-blue-500"
        />
        <div className={`relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group bg-gradient-to-br from-yellow-600 to-orange-500 opacity-80`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-500"></div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-200 text-sm font-medium mb-2 uppercase tracking-wide">Leadership Salary</p>
            <p className="text-3xl font-bold mb-1">₹{data?.currentLeadershipSalary || 0}</p>
            <p className="text-xs text-slate-300">⏳ Pending - Credited 23:59 on last day of month</p>
          </div>
          <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors"></div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-4">🏆 Achievements Unlocked ({data?.achievementsUnlocked || 0})</h2>
        {data?.unlockedRanks && data.unlockedRanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.unlockedRanks.map((achievement, idx) => (
              <div key={idx} className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-300 font-bold text-lg">{achievement.rank}</p>
                    <p className="text-emerald-400 text-sm mt-1">Reward: ₹{achievement.reward.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 mb-6">No achievements unlocked yet. Keep growing your sales!</p>
        )}

        {/* Next Rank Progress */}
        {data?.nextRank ? (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex justify-between items-center mb-3">
              <p className="text-cyan-300 font-semibold">{data.nextRank.rank} Rank</p>
              <p className="text-yellow-400 text-sm font-bold">{data.nextRank.progress}%</p>
            </div>
            <div className="w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${data.nextRank.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>Current: ₹{data.totalSales.toLocaleString()}</span>
              <span>Target: ₹{data.nextRank.target.toLocaleString()}</span>
            </div>
            <p className="text-cyan-300 text-sm mt-3 font-semibold">
              💰 Reward on unlock: ₹{data.nextRank.reward.toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-lg p-4">
            <p className="text-emerald-300 font-semibold">✅ All ranks unlocked!</p>
          </div>
        )}
      </div>

      {/* Team Sales by Level */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-4">👥 Team Sales by Level</h2>
        {teamSalesLoading ? (
          <p className="text-slate-400">Loading team data...</p>
        ) : teamSales && teamSales.length > 0 ? (
          <div className="space-y-3">
            {teamSales.map((level, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedLevel(level);
                  setShowModal(true);
                }}
                className="cursor-pointer group bg-slate-700/50 hover:bg-slate-700/80 rounded-lg p-4 border border-cyan-500/20 hover:border-cyan-500/50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-cyan-300 font-bold text-lg">Level {level.level}</p>
                    <p className="text-slate-400 text-sm">{level.memberCount} member{level.memberCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-xl">₹{level.totalSales.toLocaleString()}</p>
                    <p className="text-slate-500 text-sm group-hover:text-slate-300 transition">Click to view →</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No downline members yet</p>
        )}
      </div>

      {/* Member Details Modal */}
      {showModal && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-cyan-500/50 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-cyan-300">Level {selectedLevel.level} Members</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedLevel(null);
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedLevel.members.map((member: any, idx: number) => (
                <div
                  key={idx}
                  className="block bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-emerald-300 text-lg">{member.name}</p>
                      <p className="text-slate-400 text-sm">ID: <span className="text-cyan-300 font-mono font-bold">{member.referralCode}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-xl">₹{member.sales.toLocaleString()}</p>
                      <p className="text-slate-500 text-sm">Total Sales</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 font-semibold">👥 Total Members: {selectedLevel.memberCount}</p>
              <p className="text-emerald-300 font-semibold mt-1">💰 Level Total: ₹{selectedLevel.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-4">📊 Recent Activity</h2>
        <p className="text-slate-400">No recent activity yet. Start building your network!</p>
      </div>
    </div>
  );
};

export default Dashboard;
