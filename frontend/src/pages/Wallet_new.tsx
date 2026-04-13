import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useData';
import api from '../services/api';

interface WalletData {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTransferred: number;
  referralCode: string;
  tPin: string;
}

interface HistoryItem {
  type: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  qty?: number;
  otherParty?: string;
}

interface WalletHistory {
  history: HistoryItem[];
  total: number;
  deposits: number;
  transfers: number;
  withdrawals: number;
  purchases: number;
}

interface WalletHistoryData {
  deposits: HistoryItem[];
  transfers: HistoryItem[];
  withdrawals: HistoryItem[];
  productPurchases: HistoryItem[];
}

const Wallet: React.FC = () => {
  const { wallet, loading, error } = useWallet();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletHistory, setWalletHistory] = useState<WalletHistory | null>(null);
  const [walletHistoryData, setWalletHistoryData] = useState<WalletHistoryData>({
    deposits: [],
    transfers: [],
    withdrawals: [],
    productPurchases: [],
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'transfer' | 'withdraw' | 'history' | 'purchases'>('overview');
  const [historySubTab, setHistorySubTab] = useState<'all' | 'deposits' | 'transfers' | 'withdrawals'>('all');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('UPI');
  const [depositLoading, setDepositLoading] = useState(false);

  // Transfer state
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTPIN, setTransferTPIN] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    const fetchWalletDetails = async () => {
      try {
        const response = await api.get('/wallet/details');
        setWalletData(response.data);
      } catch (err) {
        console.error('Failed to fetch wallet details', err);
      }
    };
    fetchWalletDetails();
  }, []);

  useEffect(() => {
    const fetchWalletHistory = async () => {
      try {
        const response = await api.get('/wallet/history');
        setWalletHistory(response.data);
        
        // Organize history by type
        const organized: WalletHistoryData = {
          deposits: [],
          transfers: [],
          withdrawals: [],
          productPurchases: [],
        };
        
        if (response.data.history && Array.isArray(response.data.history)) {
          response.data.history.forEach((item: HistoryItem) => {
            if (item.type === 'DEPOSIT') {
              organized.deposits.push(item);
            } else if (item.type === 'TRANSFER_OUT' || item.type === 'TRANSFER_IN') {
              organized.transfers.push(item);
            } else if (item.type === 'WITHDRAWAL') {
              organized.withdrawals.push(item);
            } else if (item.type === 'PURCHASE' || item.type === 'PRODUCT_PURCHASE') {
              organized.productPurchases.push(item);
            }
          });
        }
        
        setWalletHistoryData(organized);
      } catch (err) {
        console.error('Failed to fetch wallet history', err);
      }
    };
    
    if (activeTab === 'history' || activeTab === 'purchases') {
      fetchWalletHistory();
    }
  }, [activeTab]);

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setDepositLoading(true);
    try {
      await api.post('/wallet/deposit', {
        amount: parseFloat(depositAmount),
        paymentMethod: depositMethod,
      });
      alert('✅ Deposit successful!');
      setDepositAmount('');
      setActiveTab('overview');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount || !transferTPIN) return;
    setTransferLoading(true);
    try {
      await api.post('/wallet/transfer', {
        toReferralCode: transferTo,
        amount: parseFloat(transferAmount),
        tPin: transferTPIN,
      });
      alert('✅ Transfer successful!');
      setTransferTo('');
      setTransferAmount('');
      setTransferTPIN('');
      setActiveTab('overview');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    setWithdrawLoading(true);
    try {
      await api.post('/wallet/withdraw', {
        amount: parseFloat(withdrawAmount),
        bankAccount: '1234567890',
        bankIFSC: 'SBIN0001234',
        accountHolder: 'Account Holder Name',
      });
      alert('✅ Withdrawal request submitted!');
      setWithdrawAmount('');
      setActiveTab('overview');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

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
        return '🛍️';
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

  if (loading) {
    return <div className="text-center py-12 text-slate-300">Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          💰 Wallet
        </h1>
        <p className="text-slate-400">Manage your funds and transactions</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-10 -z-10 animate-pulse"></div>
        
        <div className="relative z-10 text-center">
          <p className="text-slate-400 mb-2">Total Balance</p>
          <p className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6">
            ₹{(walletData?.balance || wallet?.balance || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900/50 border border-cyan-500/20 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Deposited</p>
              <p className="text-xl font-bold text-cyan-400">₹{(walletData?.totalDeposited || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            </div>
            <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Withdrawn</p>
              <p className="text-xl font-bold text-emerald-400">₹{(walletData?.totalWithdrawn || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            </div>
            <div className="bg-slate-900/50 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Transferred</p>
              <p className="text-xl font-bold text-blue-400">₹{(walletData?.totalTransferred || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            </div>
            <div className="bg-slate-900/50 border border-purple-500/20 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Referral Code</p>
              <p className="text-xl font-bold text-purple-400">{walletData?.referralCode || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview' as const, label: '📊 Overview', icon: '📊' },
          { id: 'deposit' as const, label: '💳 Deposit', icon: '💳' },
          { id: 'transfer' as const, label: '🔄 Transfer', icon: '🔄' },
          { id: 'withdraw' as const, label: '🏦 Withdraw', icon: '🏦' },
          { id: 'history' as const, label: '📜 Wallet History', icon: '📜' },
          { id: 'purchases' as const, label: '🛍️ Purchase History', icon: '🛍️' },
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

      {/* Action Cards Grid - Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 p-6 transition-all duration-300 hover:scale-105 group"
          >
            <div className="text-4xl mb-3">💳</div>
            <p className="font-semibold text-slate-200 group-hover:text-cyan-400 transition">Deposit Now</p>
            <p className="text-xs text-slate-400 mt-1">Add funds</p>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 p-6 transition-all duration-300 hover:scale-105 group"
          >
            <div className="text-4xl mb-3">🔄</div>
            <p className="font-semibold text-slate-200 group-hover:text-blue-400 transition">Wallet Transfer</p>
            <p className="text-xs text-slate-400 mt-1">To another user</p>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 p-6 transition-all duration-300 hover:scale-105 group"
          >
            <div className="text-4xl mb-3">🏦</div>
            <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition">Withdraw Now</p>
            <p className="text-xs text-slate-400 mt-1">To bank</p>
          </button>
        </div>
      )}

      {/* Deposit Panel */}
      {activeTab === 'deposit' && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">💳 Add Funds to Wallet</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Payment Method</label>
              <select
                className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition"
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
              >
                <option>UPI</option>
                <option>CARD</option>
                <option>BANK_TRANSFER</option>
                <option>WALLET</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="100"
              />
            </div>

            <button
              onClick={handleDeposit}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              disabled={depositLoading || !depositAmount}
            >
              {depositLoading ? '⏳ Processing...' : '✓ Deposit Now'}
            </button>
          </div>
        </div>
      )}

      {/* Transfer Panel */}
      {activeTab === 'transfer' && (
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">🔄 Transfer Wallet Balance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Transfer To (6-Character Referral Code)</label>
              <input
                type="text"
                placeholder="Enter 6-character code (e.g., ABC123)"
                className="w-full bg-slate-900/50 border border-blue-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-blue-400 focus:outline-none transition placeholder-slate-500 uppercase"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full bg-slate-900/50 border border-blue-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-blue-400 focus:outline-none transition placeholder-slate-500"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">T-PIN (from your email)</label>
              <input
                type="password"
                placeholder="Enter your 4-digit T-PIN"
                className="w-full bg-slate-900/50 border border-blue-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-blue-400 focus:outline-none transition placeholder-slate-500"
                value={transferTPIN}
                onChange={(e) => setTransferTPIN(e.target.value)}
                maxLength={4}
              />
              <p className="text-xs text-slate-400 mt-1">💡 Your T-PIN: {walletData?.tPin || '****'}</p>
            </div>

            <button
              onClick={handleTransfer}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              disabled={transferLoading || !transferTo || !transferAmount || !transferTPIN}
            >
              {transferLoading ? '⏳ Processing...' : '✓ Transfer Now'}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Panel */}
      {activeTab === 'withdraw' && (
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">🏦 Withdraw to Bank</h2>
          
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 p-4 rounded-lg mb-6">
            <p className="text-slate-300 text-sm"><strong>Info:</strong> Minimum ₹500 | Service charge 5% | Processing: 24 hours</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Amount (₹)</label>
              <input
                type="number"
                placeholder="Amount (minimum ₹500)"
                className="w-full bg-slate-900/50 border border-emerald-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-400 focus:outline-none transition placeholder-slate-500"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="500"
              />
            </div>

            <button
              onClick={handleWithdraw}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              disabled={withdrawLoading || !withdrawAmount}
            >
              {withdrawLoading ? '⏳ Processing...' : '✓ Request Withdrawal'}
            </button>
          </div>
        </div>
      )}

      {/* Wallet History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">📜 Wallet History & Transactions</h2>
          
          {/* Summary Stats */}
          {walletHistory && (
            <div className="mb-6 grid grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-cyan-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">💳 Deposits</p>
                <p className="text-2xl font-bold text-cyan-400">{walletHistory.deposits}</p>
              </div>
              <div className="bg-slate-900/50 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">🔄 Transfers</p>
                <p className="text-2xl font-bold text-blue-400">{walletHistory.transfers}</p>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">🏦 Withdrawals</p>
                <p className="text-2xl font-bold text-emerald-400">{walletHistory.withdrawals}</p>
              </div>
              <div className="bg-slate-900/50 border border-purple-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">🛍️ Purchases</p>
                <p className="text-2xl font-bold text-purple-400">{walletHistory.purchases}</p>
              </div>
            </div>
          )}

          {/* History Sub-Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-700/50">
            {[
              { id: 'all' as const, label: 'All Transactions', icon: '📝' },
              { id: 'deposits' as const, label: 'Deposits', icon: '💳', count: walletHistoryData.deposits.length },
              { id: 'transfers' as const, label: 'Transfers', icon: '🔄', count: walletHistoryData.transfers.length },
              { id: 'withdrawals' as const, label: 'Withdrawals', icon: '🏦', count: walletHistoryData.withdrawals.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setHistorySubTab(tab.id)}
                className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition text-sm ${
                  historySubTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.icon} {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </div>

          {/* All Transactions View */}
          {historySubTab === 'all' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {walletHistory?.history && walletHistory.history.length > 0 ? (
                walletHistory.history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-cyan-500/50 transition">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">{item.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                        </p>
                        {item.otherParty && <p className="text-xs text-slate-400">↔️ With: {item.otherParty}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getTypeColor(item.type)}`}>
                        {['TRANSFER_OUT', 'WITHDRAWAL', 'PURCHASE', 'PRODUCT_PURCHASE'].includes(item.type) ? '−' : '+'}
                        ₹{item.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No transaction history</p>
              )}
            </div>
          )}

          {/* Deposits Section */}
          {historySubTab === 'deposits' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {walletHistoryData.deposits.length > 0 ? (
                walletHistoryData.deposits.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">💳</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">{item.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-emerald-400">
                        +₹{item.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No deposits yet</p>
                  <p className="text-slate-500 text-sm">Add funds to your wallet to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* Transfers Section */}
          {historySubTab === 'transfers' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {walletHistoryData.transfers.length > 0 ? (
                walletHistoryData.transfers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">{item.type === 'TRANSFER_IN' ? '📥' : '📤'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">{item.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                        </p>
                        {item.otherParty && <p className="text-xs text-slate-400">With: {item.otherParty}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${item.type === 'TRANSFER_IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.type === 'TRANSFER_IN' ? '+' : '−'}₹{item.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No transfers yet</p>
                  <p className="text-slate-500 text-sm">Transfer your wallet balance to other users!</p>
                </div>
              )}
            </div>
          )}

          {/* Withdrawals Section */}
          {historySubTab === 'withdrawals' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {walletHistoryData.withdrawals.length > 0 ? (
                walletHistoryData.withdrawals.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 border border-emerald-500/20 rounded-lg hover:border-emerald-500/50 transition">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">🏦</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">{item.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-400">
                        −₹{item.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No withdrawals yet</p>
                  <p className="text-slate-500 text-sm">Request a withdrawal to transfer funds to your bank!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Purchase History Tab */}
      {activeTab === 'purchases' && (
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">🛍️ Product Purchase History</h2>
          
          {/* Purchase Summary */}
          {walletHistoryData.productPurchases.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="bg-slate-900/50 border border-purple-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Total Purchases</p>
                <p className="text-2xl font-bold text-purple-400">{walletHistoryData.productPurchases.length}</p>
              </div>
              <div className="bg-slate-900/50 border border-yellow-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Total Amount Spent</p>
                <p className="text-2xl font-bold text-yellow-400">
                  ₹{walletHistoryData.productPurchases.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </p>
              </div>
              <div className="bg-slate-900/50 border border-pink-500/20 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Average Purchase</p>
                <p className="text-2xl font-bold text-pink-400">
                  ₹{walletHistoryData.productPurchases.length > 0 
                    ? (walletHistoryData.productPurchases.reduce((sum, item) => sum + item.amount, 0) / walletHistoryData.productPurchases.length).toLocaleString('en-IN', {maximumFractionDigits: 0})
                    : 0}
                </p>
              </div>
            </div>
          )}

          {/* Purchase List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {walletHistoryData.productPurchases.length > 0 ? (
              walletHistoryData.productPurchases.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-3xl">🛍️</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-200">{item.description}</p>
                      <div className="flex gap-4 text-xs text-slate-400 mt-1">
                        <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                        {item.qty && <span>📦 Qty: {item.qty}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-red-400">
                      −₹{item.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">🛍️ No purchases yet</p>
                <p className="text-slate-500 text-sm">Start shopping to build your purchase history!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Transactions (Overview only) */}
      {activeTab === 'overview' && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-xl font-bold text-slate-100 mb-4">📝 Recent Transactions</h2>
          <div className="space-y-3">
            {wallet?.transactions?.length ? (
              wallet.transactions.slice(0, 5).map((tx: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                  <div>
                    <p className="font-semibold text-slate-200">{tx.type}</p>
                    <p className="text-slate-400 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No transactions yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
