'use client';

import { AdminNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';

export default function AdminMembersPage() {
  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Members</h1>

        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>Members management coming soon</p>
            <p className="text-sm mt-2">View and manage all members here</p>
          </div>
        </Card>
      </div>
    </>
  );
}
