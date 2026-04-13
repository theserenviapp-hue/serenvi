'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({ label, value, subtext, color = 'blue' }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  };

  const colorTextStyles = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorStyles[color]}`}>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorTextStyles[color]}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </div>
  );
}
