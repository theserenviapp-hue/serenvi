'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { BonusTable } from '@/components/dashboard/BonusTable';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';

export default function FastTrackPage() {
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    fetch(`/api/bonuses?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.data.summary);
          setBonuses(data.data.bonuses.filter((b: any) => b.type === 'FAST_TRACK'));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bonuses</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Fast Track"
            value={`₹${summary?.fastTrack?.toFixed(2) || '0'}`}
            color="green"
          />
          <StatCard
            label="Step Up"
            value={`₹${summary?.stepUp?.toFixed(2) || '0'}`}
            color="blue"
          />
          <StatCard
            label="Talent Dividend"
            value={`₹${summary?.talentDividend?.toFixed(2) || '0'}`}
            color="purple"
          />
          <StatCard
            label="Total Bonuses"
            value={`₹${summary?.total?.toFixed(2) || '0'}`}
            color="orange"
          />
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-12">Loading bonuses...</div>
          </Card>
        ) : (
          <Card title="Fast Track Bonuses">
            <BonusTable bonuses={bonuses} />
          </Card>
        )}
      </div>
    </>
  );
}
