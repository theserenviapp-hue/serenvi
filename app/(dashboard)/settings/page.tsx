'use client';

import { DashboardNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <Card title="Account Settings">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Settings management and profile updates coming soon
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
