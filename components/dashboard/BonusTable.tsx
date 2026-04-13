'use client';

interface BonusTableProps {
  bonuses: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
  }>;
}

export function BonusTable({ bonuses }: BonusTableProps) {
  const typeColors = {
    FAST_TRACK: 'bg-green-100 text-green-800',
    STEP_UP: 'bg-blue-100 text-blue-800',
    TALENT_DIVIDEND: 'bg-purple-100 text-purple-800',
    LEADERSHIP: 'bg-orange-100 text-orange-800',
    RANK: 'bg-red-100 text-red-800',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Type</th>
            <th className="text-right py-3 px-4">Amount</th>
            <th className="text-left py-3 px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {bonuses.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-500">
                No bonuses yet
              </td>
            </tr>
          ) : (
            bonuses.map((bonus) => (
              <tr key={bonus.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      typeColors[bonus.type as keyof typeof typeColors] || 'bg-gray-100'
                    }`}
                  >
                    {bonus.type}
                  </span>
                </td>
                <td className="text-right py-3 px-4 font-semibold">₹{bonus.amount.toFixed(2)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(bonus.date).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
