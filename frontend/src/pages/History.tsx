import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface HistoryItem {
  type: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  qty?: number;
  otherParty?: string;
}

interface HistoryData {
  history: HistoryItem[];
  deposits: number;
  transfers: number;
  withdrawals: number;
  purchases: number;
}

const History: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'transfers' | 'withdrawals' | 'purchases'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-high' | 'amount-low'>('date-desc');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/wallet/history');
        setHistoryData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'APPROVED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '💳';
      case 'TRANSFER_OUT':
        return '📤';
      case 'TRANSFER_IN':
        return '📥';
      case 'WITHDRAWAL':
        return '🏦';
      case 'PURCHASE':
      case 'PRODUCT_PURCHASE':
        return '🛍️';
      case 'MLM_COMMISSION':
        return '💰';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
        return 'text-emerald-400';
      case 'TRANSFER_OUT':
      case 'WITHDRAWAL':
      case 'PURCHASE':
      case 'PRODUCT_PURCHASE':
        return 'text-red-400';
      case 'MLM_COMMISSION':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  const filterHistoryByTab = (items: HistoryItem[]) => {
    let filtered = items;

    if (activeTab === 'deposits') {
      filtered = filtered.filter(item => item.type === 'DEPOSIT');
    } else if (activeTab === 'transfers') {
      filtered = filtered.filter(item => item.type === 'TRANSFER_OUT' || item.type === 'TRANSFER_IN');
    } else if (activeTab === 'withdrawals') {
      filtered = filtered.filter(item => item.type === 'WITHDRAWAL');
    } else if (activeTab === 'purchases') {
      filtered = filtered.filter(item => item.type === 'PURCHASE' || item.type === 'PRODUCT_PURCHASE');
    }

    return filtered;
  };

  const filterBySearch = (items: HistoryItem[]) => {
    if (!searchQuery) return items;
    return items.filter(
      item =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.otherParty && item.otherParty.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const sortHistory = (items: HistoryItem[]) => {
    const sorted = [...items];
    switch (sortBy) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'amount-high':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'amount-low':
        return sorted.sort((a, b) => a.amount - b.amount);
      default:
        return sorted;
    }
  };

  const getFilteredAndSortedHistory = () => {
    if (!historyData?.history) return [];
    let items = filterHistoryByTab(historyData.history);
    items = filterBySearch(items);
    items = sortHistory(items);
    return items;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="mt-4 text-slate-300">Loading history...</p>
        </div>
      </div>
    );
  }

  const filteredHistory = getFilteredAndSortedHistory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          📜 Transaction History
        </h1>
        <p className="text-slate-400">View all your transactions, purchases, and wallet activities</p>
      </div>

      {/* Stats Cards */}
      {historyData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
            <p className="text-slate-400 text-sm">💳 Deposits</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{historyData.deposits}</p>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
            <p className="text-slate-400 text-sm">🔄 Transfers</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{historyData.transfers}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
            <p className="text-slate-400 text-sm">🏦 Withdrawals</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{historyData.withdrawals}</p>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
            <p className="text-slate-400 text-sm">🛍️ Purchases</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">{historyData.purchases}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Box */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium text-sm">🔍 Search</label>
            <input
              type="text"
              placeholder="Search by description, type, or party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium text-sm">📊 Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all' as const, label: '📝 All Transactions', icon: '📝' },
          { id: 'deposits' as const, label: '💳 Deposits', icon: '💳' },
          { id: 'transfers' as const, label: '🔄 Transfers', icon: '🔄' },
          { id: 'withdrawals' as const, label: '🏦 Withdrawals', icon: '🏦' },
          { id: 'purchases' as const, label: '🛍️ Purchases', icon: '🛍️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/50 text-slate-300 hover:text-cyan-400 border border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
        {filteredHistory.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-cyan-500/50 transition group hover:bg-slate-900/70"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-2xl">{getTypeIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{item.description}</p>
                    <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                      <span>⏰ {new Date(item.date).toLocaleTimeString()}</span>
                      {item.qty && <span>📦 Qty: {item.qty}</span>}
                      {item.otherParty && <span>↔️ {item.otherParty}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4 flex-shrink-0">
                  <p className={`font-bold text-lg ${getTypeColor(item.type)}`}>
                    {['TRANSFER_OUT', 'WITHDRAWAL', 'PURCHASE', 'PRODUCT_PURCHASE'].includes(item.type) ? '−' : '+'}
                    ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded border inline-block mt-2 ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-400 text-lg">No transactions found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchQuery ? 'Try adjusting your search filters' : 'Your transaction history will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredHistory.length > 0 && (() => {
        // Calculate credits and debits
        const creditTypes = ['DEPOSIT', 'TRANSFER_IN', 'MLM_COMMISSION'];
        const debitTypes = ['TRANSFER_OUT', 'WITHDRAWAL', 'PURCHASE', 'PRODUCT_PURCHASE'];
        
        const totalCredits = filteredHistory
          .filter(item => creditTypes.includes(item.type))
          .reduce((sum, item) => sum + item.amount, 0);
          
        const totalDebits = filteredHistory
          .filter(item => debitTypes.includes(item.type))
          .reduce((sum, item) => sum + item.amount, 0);
          
        const netBalance = totalCredits - totalDebits;
        
        return (
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{filteredHistory.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Credits (In)</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  +₹{totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Debits (Out)</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  −₹{totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Net Balance Change</p>
                <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        );
      })()}


      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-red-400">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default History;
