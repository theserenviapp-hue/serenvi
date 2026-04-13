'use client';

import { AdminNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function AdminBonusesPage() {
  const [loading, setLoading] = useState(false);

  const handleDistribute = async (bonusType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/bonuses/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
        body: JSON.stringify({ bonusType }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`${bonusType} bonus distribution completed!`);
      } else {
        alert(data.error || 'Distribution failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bonus Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Fast Track Bonus">
            <p className="text-gray-600 mb-4">
              Distribute 40% of daily sales to eligible members based on multiplier system
            </p>
            <Button
              onClick={() => handleDistribute('FAST_TRACK')}
              disabled={loading}
              className="w-full"
            >
              Distribute Now
            </Button>
          </Card>

          <Card title="Talent Dividend">
            <p className="text-gray-600 mb-4">
              Distribute 30% of team sales proportionally to all members
            </p>
            <Button
              onClick={() => handleDistribute('TALENT_DIVIDEND')}
              disabled={loading}
              className="w-full"
            >
              Distribute Now
            </Button>
          </Card>
        </div>

        <Card title="Recent Distributions" className="mt-8">
          <div className="text-center py-12 text-gray-500">
            <p>No distributions yet</p>
            <p className="text-sm mt-2">Bonus distributions will be logged here</p>
          </div>
        </Card>
      </div>
    </>
  );
}
