import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useData';
import api from '../services/api';

interface WalletData {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTransferred: number;
  referralCode: string;
}

const Wallet: React.FC = () => {
  const { wallet, loading } = useWallet();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'transfer' | 'withdraw'>('overview');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<'UPI_QR' | 'BANK_TRANSFER'>('UPI_QR');
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [depositUTR, setDepositUTR] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Transfer state
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTPIN, setTransferTPIN] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [tpinSending, setTpinSending] = useState(false);
  const [tpinSent, setTpinSent] = useState(false);

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

  const goToPaymentStep = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt < 100) {
      alert('Minimum deposit is ₹100');
      return;
    }
    setDepositStep(2);
  };

  const submitDepositUTR = async () => {
    if (!depositUTR.trim() || depositUTR.trim().length < 6) {
      alert('Please enter a valid UTR / transaction reference');
      return;
    }
    setDepositLoading(true);
    try {
      await api.post('/wallet/deposit', {
        amount: parseFloat(depositAmount),
        paymentMethod: depositMethod,
        transactionId: depositUTR.trim(),
      });
      alert('✅ Submitted. Your amount will be credited in 1–2 hours after verification.');
      setDepositAmount('');
      setDepositUTR('');
      setDepositStep(1);
      setActiveTab('overview');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deposit submission failed');
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

  if (loading) return <div className="text-center py-12 text-slate-300">Loading wallet...</div>;

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
              <p className="text-xl font-bold text-purple-400 font-mono">{walletData?.referralCode || '------'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
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

      {/* Deposit Panel */}
      {activeTab === 'deposit' && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">💳 Add Funds to Wallet</h2>

          {depositStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('UPI_QR')}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      depositMethod === 'UPI_QR'
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">📱</div>
                    <div className="font-semibold text-slate-100">UPI QR</div>
                    <div className="text-xs text-slate-400">Scan & pay via any UPI app</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositMethod('BANK_TRANSFER')}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      depositMethod === 'BANK_TRANSFER'
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">🏦</div>
                    <div className="font-semibold text-slate-100">Bank Transfer</div>
                    <div className="text-xs text-slate-400">NEFT / IMPS to bank account</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount (min ₹100)"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="100"
                />
              </div>

              <button
                onClick={goToPaymentStep}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                disabled={!depositAmount}
              >
                Continue →
              </button>
            </div>
          )}

          {depositStep === 2 && depositMethod === 'UPI_QR' && (
            <div className="space-y-5">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-6 text-center">
                <p className="text-slate-400 text-sm mb-3">Pay ₹{depositAmount} using any UPI app</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
                    `upi://pay?pa=8116969019@ibl&pn=ARYAMAN%20MANDAL&cu=INR&am=${depositAmount}`
                  )}`}
                  alt="UPI QR"
                  className="mx-auto rounded-lg bg-white p-3"
                />
                <p className="text-slate-300 mt-4 text-sm">UPI ID</p>
                <p className="text-cyan-400 font-mono text-lg font-bold select-all">8116969019@ibl</p>
                <p className="text-slate-400 text-xs mt-1">Payee: ARYAMAN MANDAL</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200 text-sm">
                After paying, enter the UTR / Transaction Reference number you received
                from your UPI app below, then click Submit. Your wallet will be credited
                within <strong>1–2 hours</strong> after verification.
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">UTR / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. 425812345678"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500 font-mono"
                  value={depositUTR}
                  onChange={(e) => setDepositUTR(e.target.value.trim())}
                  maxLength={40}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDepositStep(1)}
                  className="px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={submitDepositUTR}
                  disabled={depositLoading || !depositUTR.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {depositLoading ? '⏳ Submitting...' : 'Submit UTR'}
                </button>
              </div>
            </div>
          )}

          {depositStep === 2 && depositMethod === 'BANK_TRANSFER' && (
            <div className="space-y-5">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-4">
                  Transfer ₹{depositAmount} to the following bank account via NEFT / IMPS / RTGS:
                </p>
                <div className="space-y-3 text-slate-200 text-sm">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Account Holder</span>
                    <span className="font-semibold">ARYAMAN MANDAL</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Account Number</span>
                    <span className="font-mono font-semibold select-all">20512612107</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Bank</span>
                    <span className="font-semibold">State Bank of India (SBI)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC Code</span>
                    <span className="font-mono font-semibold select-all">SBIN0001055</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200 text-sm">
                After transferring, enter the UTR / Transaction Reference number from your
                bank below, then click Submit. Your wallet will be credited within
                <strong> 1–2 hours</strong> after verification.
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">UTR / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN125134567890"
                  className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none transition placeholder-slate-500 font-mono"
                  value={depositUTR}
                  onChange={(e) => setDepositUTR(e.target.value.trim())}
                  maxLength={40}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDepositStep(1)}
                  className="px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={submitDepositUTR}
                  disabled={depositLoading || !depositUTR.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {depositLoading ? '⏳ Submitting...' : 'Submit UTR'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Panel */}
      {activeTab === 'transfer' && (
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">🔄 Transfer Wallet Balance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Transfer To (Referral Code)</label>
              <input
                type="text"
                placeholder="Enter 6-character referral code"
                className="w-full bg-slate-900/50 border border-blue-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-blue-400 focus:outline-none transition placeholder-slate-500"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <p className="text-xs text-slate-400 mt-1">💡 Referral codes are 6 characters (e.g., 1PG9PQ) - find them on member profiles</p>
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
              <label className="block text-slate-300 mb-2 font-medium">T-PIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit T-PIN from email"
                  className="flex-1 bg-slate-900/50 border border-blue-500/30 rounded-lg px-4 py-2 text-slate-200 focus:border-blue-400 focus:outline-none transition placeholder-slate-500"
                  value={transferTPIN}
                  onChange={(e) => setTransferTPIN(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <button
                  onClick={async () => {
                    setTpinSending(true);
                    try {
                      await api.post('/wallet/send-tpin', {});
                      setTpinSent(true);
                      alert('✅ T-PIN sent to your registered email!');
                    } catch (err: any) {
                      alert(err.response?.data?.message || 'Failed to send T-PIN');
                    } finally {
                      setTpinSending(false);
                    }
                  }}
                  disabled={tpinSending}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition whitespace-nowrap disabled:opacity-50"
                >
                  {tpinSending ? '⏳ Sending...' : tpinSent ? '📧 Resend T-PIN' : '📧 Send T-PIN'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">💡 A unique 6-digit T-PIN will be sent to your registered email. Valid for one transfer only.</p>
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
            <p className="text-slate-300 text-sm"><strong>Info:</strong> Minimum withdrawal ₹500 | Service charge 5% | Processing: 24 hours</p>
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

      {/* Recent Transactions */}
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
