'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('demo-user');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });

  useEffect(() => {
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    setUserId(storedUserId || 'demo-user');
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [userId]);

  const fetchWallet = async () => {
    try {
      const response = await fetch(`/api/wallet?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setWallet(data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolder) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(withdrawAmount),
          bankDetails,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        setBankDetails({ accountNumber: '', ifscCode: '', accountHolder: '' });
        fetchWallet();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="E-Wallet"
            value={`₹${wallet?.eWallet?.toFixed(2) || '0'}`}
            color="blue"
          />
          <StatCard
            label="Topup Wallet"
            value={`₹${wallet?.topupWallet?.toFixed(2) || '0'}`}
            color="green"
          />
          <StatCard
            label="Shopping Fund"
            value={`₹${wallet?.shoppingFund?.toFixed(2) || '0'}`}
            color="purple"
          />
          <StatCard
            label="Total Earnings"
            value={`₹${wallet?.totalEarning?.toFixed(2) || '0'}`}
            color="orange"
          />
        </div>

        <Card title="Withdraw Funds" className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">*5% processing charge will be deducted</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
              <input
                type="text"
                value={bankDetails.accountHolder}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <Button onClick={handleWithdraw} className="w-full">
              Request Withdrawal
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
