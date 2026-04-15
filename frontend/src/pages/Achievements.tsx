import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Achievement {
  rank: string;
  salesTarget: number;
  rewardAmount: number;
  personalSalesMade: number;
  claimed: boolean;
  progressPercent: number;
}

interface ProgressData {
  currentRank: string;
  personalSales: number;
  achievements: any[];
  progress: Achievement[];
}

const Achievements: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  const icons: Record<string, string> = {
    'Influencer': '🌟',
    'Master': '⭐',
    'Legend': '💎',
    'Icon': '👑',
    'Titan': '🏆',
    'Global Leader': '🌍',
    'World Leader': '🚀',
    'Empire Leader': '💫',
    'Global Icon': '👨‍🚀',
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/achievements/progress');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (rankName: string) => {
    try {
      setClaiming(rankName);
      const response = await api.post(`/achievements/claim/${rankName}`);
      
      // Refresh achievements
      await fetchAchievements();
      alert(response.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to claim achievement');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <div className="text-center py-12">Loading achievements...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!data) return <div className="text-center py-12">No data available</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Achievements & Rewards</h1>
        <p className="text-gray-600 mt-1">Your current rank: <span className="font-bold text-blue-600">{data.currentRank}</span></p>
        <p className="text-gray-600">Personal Sales: ₹{(data.personalSales || 0).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.progress.map((achievement, idx) => {
          const isUnlocked = achievement.personalSalesMade >= achievement.salesTarget;
          const isClaimed = achievement.claimed;
          const icon = icons[achievement.rank] || '🎯';

          return (
            <div
              key={idx}
              className={`card transition border-2 ${
                isClaimed
                  ? 'border-green-500 bg-green-50'
                  : isUnlocked
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-5xl">{icon}</div>
                {isClaimed && <span className="text-green-600 font-bold text-sm">✓ CLAIMED</span>}
                {isUnlocked && !isClaimed && (
                  <span className="text-yellow-600 font-bold text-sm">🔓 UNLOCKED</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800">{achievement.rank}</h3>
              
              <div className="mt-3 space-y-2">
                <p className="text-gray-600 text-sm">
                  Target: ₹{achievement.salesTarget.toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm font-semibold">
                  Reward: ₹{achievement.rewardAmount.toLocaleString()}
                </p>

                <div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isClaimed ? 'bg-green-600' : isUnlocked ? 'bg-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(achievement.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {achievement.progressPercent}% (₹{achievement.personalSalesMade.toLocaleString()})
                  </p>
                </div>
              </div>

              {isUnlocked && !isClaimed && (
                <button
                  onClick={() => claimAchievement(achievement.rank)}
                  disabled={claiming === achievement.rank}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                >
                  {claiming === achievement.rank ? 'Claiming...' : 'Claim Reward'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
