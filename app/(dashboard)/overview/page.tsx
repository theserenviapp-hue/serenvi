'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';

export default function OverviewPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/members/me')
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userData?.name}!</h1>
          <p className="text-gray-600 mt-2">Member ID: {userData?.memberId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="E-Wallet Balance"
            value={`₹${userData?.wallet?.eWallet?.toFixed(2) || '0'}`}
            color="blue"
          />
          <StatCard
            label="Total Earnings"
            value={`₹${userData?.wallet?.totalEarning?.toFixed(2) || '0'}`}
            color="green"
          />
          <StatCard label="Direct Referrals" value={userData?.directReferrals || '0'} color="purple" />
          <StatCard label="Current Rank" value={userData?.rank || 'NOT_ACHIEVED'} color="orange" />
        </div>

        <Card title="Account Status" className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-green-600">{userData?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{userData?.email}</p>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/shop" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition">
              <div className="font-semibold text-blue-900">Shop Products</div>
              <p className="text-sm text-blue-700 mt-1">Purchase available products</p>
            </a>
            <a href="/wallet" className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition">
              <div className="font-semibold text-green-900">Manage Wallet</div>
              <p className="text-sm text-green-700 mt-1">Withdraw or top up funds</p>
            </a>
            <a href="/team" className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition">
              <div className="font-semibold text-purple-900">View Team</div>
              <p className="text-sm text-purple-700 mt-1">See your downline structure</p>
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}
