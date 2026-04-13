'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { BonusTable } from '@/components/dashboard/BonusTable';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';

export default function TalentDividendPage() {
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bonuses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.data.summary);
          setBonuses(data.data.bonuses.filter((b: any) => b.type === 'TALENT_DIVIDEND'));
        }
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Talent Dividend</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard label="Total Talent Dividend" value={`₹${summary?.talentDividend?.toFixed(2) || '0'}`} color="purple" />
          <StatCard label="This Month" value="₹0" color="green" />
        </div>
        <Card title="Talent Dividend Program" className="mb-8">
          <p className="text-gray-600 mb-4">
            Every month, 30% of your team's total sales is distributed among all active members based on their contribution.
          </p>
        </Card>
        {loading ? (
          <Card><div className="text-center py-12">Loading bonuses...</div></Card>
        ) : (
          <Card title="Talent Dividend History"><BonusTable bonuses={bonuses} /></Card>
        )}
      </div>
    </>
  );
}
