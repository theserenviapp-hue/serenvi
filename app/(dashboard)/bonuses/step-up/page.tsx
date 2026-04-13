'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { BonusTable } from '@/components/dashboard/BonusTable';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';

export default function StepUpPage() {
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bonuses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.data.summary);
          setBonuses(data.data.bonuses.filter((b: any) => b.type === 'STEP_UP'));
        }
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Step Up Bonus</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard label="Total Step Up Earned" value={`₹${summary?.stepUp?.toFixed(2) || '0'}`} color="blue" />
          <StatCard label="Last 30 Days" value="₹0" color="green" />
        </div>
        <Card title="Step Up Bonus" className="mb-8">
          <p className="text-gray-600 mb-4">
            You earn a portion of every purchase made by your entire downline through 25 levels.
          </p>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li>Level 1: 25% of product price</li>
            <li>Level 2-10: 5% each</li>
            <li>Level 11-20: 2.5% each</li>
            <li>Level 21-25: 1% each</li>
          </ul>
        </Card>
        {loading ? (
          <Card><div className="text-center py-12">Loading bonuses...</div></Card>
        ) : (
          <Card title="Recent Step Up Bonuses"><BonusTable bonuses={bonuses} /></Card>
        )}
      </div>
    </>
  );
}
