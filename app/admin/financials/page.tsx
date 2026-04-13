'use client';

import { AdminNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';

export default function AdminFinancialsPage() {
  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Revenue">
            <p className="text-3xl font-bold text-green-600">₹0</p>
          </Card>
          <Card title="Total Bonuses Paid">
            <p className="text-3xl font-bold text-blue-600">₹0</p>
          </Card>
          <Card title="Pending Withdrawals">
            <p className="text-3xl font-bold text-orange-600">₹0</p>
          </Card>
        </div>

        <Card title="Recent Transactions" className="mt-8">
          <div className="text-center py-12 text-gray-500">
            <p>Transactions will be displayed here</p>
          </div>
        </Card>
      </div>
    </>
  );
}
