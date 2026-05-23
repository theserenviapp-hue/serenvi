'use client';

import { DashboardNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';

export default function TeamPage() {
  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Team</h1>

        <Card title="Downline Structure">
          <div className="text-center py-12 text-gray-500">
            <p>Team structure visualization coming soon</p>
            <p className="text-sm mt-2">View your direct referrals and downline here</p>
          </div>
        </Card>
      </div>
    </>
  );
}
