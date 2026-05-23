'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Achievement Milestones - Fixed rewards based on sales targets
const ACHIEVEMENT_MILESTONES = [
  { rank: 'Influencer', salesTarget: 50000, reward: 5000 },
  { rank: 'Master', salesTarget: 100000, reward: 5000 },
  { rank: 'Legend', salesTarget: 250000, reward: 15000 },
  { rank: 'Icon', salesTarget: 500000, reward: 25000 },
  { rank: 'Titan', salesTarget: 1000000, reward: 50000 },
  { rank: 'Global Leader', salesTarget: 2500000, reward: 150000 },
  { rank: 'World Leader', salesTarget: 5000000, reward: 250000 },
  { rank: 'Empire Leader', salesTarget: 10000000, reward: 500000 },
  { rank: 'Global Icon', salesTarget: 50000000, reward: 6500000 },
];

interface AchievementData {
  rank: string;
  salesTarget: number;
  rewardAmount: number;
  personalSalesMade: number;
  claimed: boolean;
  progressPercent: number;
}

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [personalSales, setPersonalSales] = useState(0);
  const [currentRank, setCurrentRank] = useState('Rookie');
  const [claiming, setClaiming] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

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
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/achievements/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setPersonalSales(result.personalSales || 0);
        setCurrentRank(result.currentRank || 'Rookie');
        setAchievements(result.achievements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (rankName: string) => {
    try {
      setClaiming(rankName);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/achievements/claim/${rankName}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Achievement claimed successfully!');
        await fetchAchievements();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to claim achievement');
      }
    } catch (err) {
      alert('Error claiming achievement');
    } finally {
      setClaiming(null);
    }
  };

  // Generate achievement progress data
  const achievementProgress = ACHIEVEMENT_MILESTONES.map((milestone) => {
    const isUnlocked = personalSales >= milestone.salesTarget;
    const isClaimed = achievements.some((a: any) => a.rankName === milestone.rank && a.claimedAt);

    return {
      rank: milestone.rank,
      salesTarget: milestone.salesTarget,
      rewardAmount: milestone.reward,
      personalSalesMade: personalSales,
      claimed: isClaimed,
      progressPercent: Math.min(Math.round((personalSales / milestone.salesTarget) * 100), 100),
      isUnlocked,
    };
  });

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Achievements & Rewards</h1>
          <p className="text-gray-600 mt-2">
            Your current rank: <span className="font-bold text-blue-600">{currentRank}</span>
          </p>
          <p className="text-gray-600">
            Personal Sales: ₹{personalSales.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementProgress.map((achievement, idx) => {
            const icon = icons[achievement.rank] || '🎯';

            return (
              <Card
                key={idx}
                className={`transition border-2 flex flex-col h-full ${
                  achievement.claimed
                    ? 'border-green-500 bg-green-50'
                    : achievement.isUnlocked
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-300 opacity-75 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{icon}</div>
                  {achievement.claimed && (
                    <span className="text-green-600 font-bold text-xs bg-green-200 px-2 py-1 rounded">
                      ✓ CLAIMED
                    </span>
                  )}
                  {achievement.isUnlocked && !achievement.claimed && (
                    <span className="text-yellow-600 font-bold text-xs bg-yellow-200 px-2 py-1 rounded">
                      🔓 UNLOCKED
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{achievement.rank}</h3>

                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-sm text-gray-600">Target Sales</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ₹{achievement.salesTarget.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₹{achievement.rewardAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          achievement.claimed ? 'bg-green-600' : achievement.isUnlocked ? 'bg-yellow-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${achievement.progressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {achievement.progressPercent}% (₹{achievement.personalSalesMade.toLocaleString()})
                    </p>
                  </div>
                </div>

                {achievement.isUnlocked && !achievement.claimed && (
                  <Button
                    onClick={() => claimAchievement(achievement.rank)}
                    disabled={claiming === achievement.rank}
                    className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700"
                  >
                    {claiming === achievement.rank ? 'Claiming...' : 'Claim Reward'}
                  </Button>
                )}

                {achievement.claimed && (
                  <Button disabled className="w-full mt-4 bg-green-600">
                    ✓ Claimed
                  </Button>
                )}

                {!achievement.isUnlocked && (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Need ₹{(achievement.salesTarget - achievement.personalSalesMade).toLocaleString()} more sales
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
