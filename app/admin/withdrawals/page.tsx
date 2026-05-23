'use client';

import { useState, useEffect } from 'react';
import { AdminNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all withdrawals (admin endpoint)
    setLoading(false);
  }, []);

  const handleApprove = (withdrawalId: string) => {
    alert(`Withdrawal ${withdrawalId} approved!`);
    // Call API to approve
  };

  const handleReject = (withdrawalId: string) => {
    alert(`Withdrawal ${withdrawalId} rejected!`);
    // Call API to reject
  };

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Withdrawal Requests</h1>

        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>No pending withdrawals</p>
            <p className="text-sm mt-2">Withdrawal requests will appear here</p>
          </div>
        </Card>
      </div>
    </>
  );
}
