import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  recentOrders: any[];
}

interface User {
  userId: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  rank: string;
  referralCode: string;
  totalSales: number;
  level1Sales: number;
  monthlySales: number;
  walletBalance: number;
  totalEarnings: number;
  status: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  buyer: { id: string; name: string; email: string; phone: string };
  product: { id: string; name: string; price: number; type: string; category: string };
  quantity: number;
  saleAmount: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
}

type Tab = 'overview' | 'users' | 'orders' | 'products' | 'deposits';

interface AdminDeposit {
  id: string;
  distributorId: string;
  distributor?: { id: string; name: string; email: string; phone: string; referralCode: string };
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: string;
  createdAt: string;
}

const Admin: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [depositFilter, setDepositFilter] = useState<'PENDING' | 'COMPLETED' | 'REJECTED' | ''>('PENDING');
  const [processingDeposit, setProcessingDeposit] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', type: 'PHYSICAL', imageUrl: '', stockQuantity: '', gender: '', sizes: '',
  });
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'overview') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (tab === 'orders') {
        const url = orderFilter ? `/admin/orders?status=${orderFilter}` : '/admin/orders';
        const res = await api.get(url);
        setOrders(res.data);
      } else if (tab === 'products') {
        const res = await api.get('/products/all');
        setAdminProducts(res.data.products || []);
      } else if (tab === 'deposits') {
        const url = depositFilter ? `/admin/deposits?status=${depositFilter}` : '/admin/deposits';
        const res = await api.get(url);
        setDeposits(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const approveDeposit = async (id: string) => {
    if (!window.confirm('Approve this deposit and credit the wallet?')) return;
    setProcessingDeposit(id);
    try {
      await api.post(`/admin/deposits/${id}/approve`);
      setDeposits(deposits.filter((d) => d.id !== id));
      alert('✅ Deposit approved — wallet credited');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approve failed');
    } finally {
      setProcessingDeposit(null);
    }
  };

  const rejectDeposit = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):') || undefined;
    if (reason === null) return; // user cancelled prompt
    setProcessingDeposit(id);
    try {
      await api.post(`/admin/deposits/${id}/reject`, { reason });
      setDeposits(deposits.filter((d) => d.id !== id));
      alert('Deposit rejected');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Reject failed');
    } finally {
      setProcessingDeposit(null);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const openProductForm = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        category: product.category,
        type: product.type,
        imageUrl: product.imageUrl || '',
        stockQuantity: String(product.stockQuantity || ''),
        gender: product.gender || '',
        sizes: product.sizes || '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: '', type: 'PHYSICAL', imageUrl: '', stockQuantity: '', gender: '', sizes: '' });
    }
    setShowProductForm(true);
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      alert('Name, price, and category are required');
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description || undefined,
        price: parseFloat(productForm.price),
        category: productForm.category,
        type: productForm.type,
        imageUrl: productForm.imageUrl || undefined,
        stockQuantity: productForm.stockQuantity ? parseInt(productForm.stockQuantity) : undefined,
        gender: productForm.gender || undefined,
        sizes: productForm.sizes || undefined,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductForm(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Deactivate this product? It will be hidden from the shop.')) return;
    try {
      await api.delete(`/products/${productId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate product');
    }
  };

  const loadUserDetails = async (distributorId: string) => {
    try {
      const res = await api.get(`/admin/users/${distributorId}`);
      setSelectedUser(res.data);
    } catch (err: any) {
      alert('Failed to load user details');
    }
  };

  const formatCurrency = (val: any) => {
    const num = typeof val === 'object' ? parseFloat(val.toString()) : Number(val);
    return `₹${(num || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const statusColors: Record<string, string> = {
    COMPLETED: 'text-emerald-400 bg-emerald-500/20',
    PENDING: 'text-yellow-400 bg-yellow-500/20',
    SHIPPED: 'text-blue-400 bg-blue-500/20',
    DELIVERED: 'text-green-400 bg-green-500/20',
    CANCELLED: 'text-red-400 bg-red-500/20',
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <p className="text-red-400 text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          ⚙️ Admin Panel
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage users, orders, and platform data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'users', 'orders', 'deposits', 'products'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg font-semibold capitalize transition ${
              tab === t
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {t === 'overview' && '📊 '}
            {t === 'users' && '👥 '}
            {t === 'orders' && '📦 '}
            {t === 'products' && '🏷️ '}
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="👥" label="Total Users" value={stats.totalUsers} />
                <StatCard icon="💰" label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
                <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} />
                <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="yellow" />
              </div>

              {/* Recent Orders */}
              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-3 px-2">Buyer</th>
                        <th className="text-left py-3 px-2">Product</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((o, i) => (
                        <tr key={i} className="border-b border-slate-800 text-slate-300">
                          <td className="py-3 px-2">{o.buyer}</td>
                          <td className="py-3 px-2">{o.product}</td>
                          <td className="py-3 px-2 font-semibold">{formatCurrency(o.amount)}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[o.status] || 'text-slate-400'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-500">{formatDate(o.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="space-y-4">
              {selectedUser ? (
                <UserDetailView user={selectedUser} onBack={() => setSelectedUser(null)} formatCurrency={formatCurrency} formatDate={formatDate} />
              ) : (
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
                  <h2 className="text-xl font-bold text-slate-100 mb-4">All Users ({users.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-700">
                          <th className="text-left py-3 px-2">Name</th>
                          <th className="text-left py-3 px-2">Email</th>
                          <th className="text-left py-3 px-2">Phone</th>
                          <th className="text-left py-3 px-2">Rank</th>
                          <th className="text-left py-3 px-2">Wallet</th>
                          <th className="text-left py-3 px-2">Total Sales</th>
                          <th className="text-left py-3 px-2">Status</th>
                          <th className="text-left py-3 px-2">Joined</th>
                          <th className="text-left py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.userId} className="border-b border-slate-800 text-slate-300 hover:bg-slate-800/50">
                            <td className="py-3 px-2 font-semibold">
                              {u.name}
                              {u.isAdmin && <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">ADMIN</span>}
                            </td>
                            <td className="py-3 px-2">{u.email}</td>
                            <td className="py-3 px-2">{u.phone || '-'}</td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">{u.rank}</span>
                            </td>
                            <td className="py-3 px-2 font-semibold">{formatCurrency(u.walletBalance)}</td>
                            <td className="py-3 px-2">{formatCurrency(u.totalSales)}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-slate-500">{u.createdAt ? formatDate(u.createdAt) : '-'}</td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => loadUserDetails(u.id)}
                                className="text-cyan-400 hover:text-cyan-300 text-xs underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {['', 'PENDING', 'COMPLETED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setOrderFilter(f); setTimeout(loadData, 0); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      orderFilter === f
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f || 'All'}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Orders ({orders.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-3 px-2">Order ID</th>
                        <th className="text-left py-3 px-2">Buyer</th>
                        <th className="text-left py-3 px-2">Product</th>
                        <th className="text-left py-3 px-2">Qty</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">Payment</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-800 text-slate-300 hover:bg-slate-800/50">
                          <td className="py-3 px-2 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}...</td>
                          <td className="py-3 px-2">
                            <div>{o.buyer.name}</div>
                            <div className="text-xs text-slate-500">{o.buyer.email}</div>
                          </td>
                          <td className="py-3 px-2">{o.product.name}</td>
                          <td className="py-3 px-2">{o.quantity}</td>
                          <td className="py-3 px-2 font-semibold">{formatCurrency(o.saleAmount)}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-1 bg-slate-700 rounded text-xs">{o.paymentMethod}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[o.orderStatus] || ''}`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-500 text-xs">{formatDate(o.createdAt)}</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1.5 flex-wrap">
                              {o.orderStatus !== 'SHIPPED' && o.orderStatus !== 'DELIVERED' && (
                                <button
                                  onClick={() => updateOrderStatus(o.id, 'SHIPPED')}
                                  disabled={updatingOrder === o.id}
                                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition disabled:opacity-50"
                                >
                                  📦 Mark Dispatched
                                </button>
                              )}
                              {o.orderStatus !== 'DELIVERED' && (
                                <button
                                  onClick={() => updateOrderStatus(o.id, 'DELIVERED')}
                                  disabled={updatingOrder === o.id}
                                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition disabled:opacity-50"
                                >
                                  ✅ Mark Delivered
                                </button>
                              )}
                              {o.orderStatus === 'DELIVERED' && (
                                <span className="px-3 py-1.5 text-emerald-400 text-xs font-semibold">✅ Completed</span>
                              )}
                              {o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED' && (
                                <button
                                  onClick={() => { if (window.confirm('Cancel this order?')) updateOrderStatus(o.id, 'CANCELLED'); }}
                                  disabled={updatingOrder === o.id}
                                  className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition disabled:opacity-50"
                                >
                                  ✕ Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-500">No orders found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100">Products ({adminProducts.length})</h2>
                <button
                  onClick={() => openProductForm()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition"
                >
                  + Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        placeholder="e.g. Serenvi Face Cream"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        placeholder="e.g. 999"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Category *</label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        placeholder="e.g. Skincare, Haircare, Wellness"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Type *</label>
                      <select
                        value={productForm.type}
                        onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="PHYSICAL">Physical</option>
                        <option value="DIGITAL">Digital</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Image URL(s) <span className="text-slate-600">(comma-separated for multiple)</span></label>
                      <textarea
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none h-20 resize-none"
                        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Gender <span className="text-slate-600">(e.g. Male, Female, Kids)</span></label>
                      <input
                        type="text"
                        value={productForm.gender}
                        onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        placeholder="e.g. Female, Male, Kids"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Available Sizes <span className="text-slate-600">(select multiple)</span></label>
                      <select
                        multiple
                        value={(productForm.sizes || '').split(',').map(s => s.trim()).filter(s => s)}
                        onChange={(e) => {
                          const selectedSizes = Array.from(e.target.selectedOptions, (option: any) => option.value);
                          setProductForm({ ...productForm, sizes: selectedSizes.join(', ') });
                        }}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none min-h-[120px]"
                      >
                        <option value="S">S (Small)</option>
                        <option value="M">M (Medium)</option>
                        <option value="L">L (Large)</option>
                        <option value="XL">XL (Extra Large)</option>
                        <option value="XXL">XXL (2XL)</option>
                      </select>
                      {productForm.sizes && (
                        <p className="text-xs text-slate-400 mt-2">✓ Selected: {productForm.sizes}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple sizes</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-400 text-sm mb-1">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none h-24 resize-none"
                        placeholder="Product description..."
                      />
                    </div>
                  </div>
                  {productForm.imageUrl && (
                    <div className="mt-4">
                      <p className="text-slate-400 text-sm mb-1">Image Preview:</p>
                      <div className="flex gap-2 flex-wrap">
                        {productForm.imageUrl.split(',').map((url: string, idx: number) => url.trim() && (
                          <img key={idx} src={url.trim()} alt={`Preview ${idx + 1}`} className="w-32 h-32 object-cover rounded-lg border border-slate-600" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveProduct}
                      disabled={savingProduct}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="px-6 py-2.5 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-3 px-2">Image</th>
                        <th className="text-left py-3 px-2">Name</th>
                        <th className="text-left py-3 px-2">Category</th>
                        <th className="text-left py-3 px-2">Type</th>
                        <th className="text-left py-3 px-2">Price</th>
                        <th className="text-left py-3 px-2">Stock</th>
                        <th className="text-left py-3 px-2">Gender</th>
                        <th className="text-left py-3 px-2">Sizes</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.map((p) => (
                        <tr key={p.id} className="border-b border-slate-800 text-slate-300 hover:bg-slate-800/50">
                          <td className="py-3 px-2">
                            {p.imageUrl ? (
                              <img src={p.imageUrl.split(',')[0].trim()} alt={p.name} className="w-12 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-xl">📦</div>
                            )}
                          </td>
                          <td className="py-3 px-2 font-semibold">
                            {p.name}
                            {p.description && <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{p.description}</div>}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">{p.category}</span>
                          </td>
                          <td className="py-3 px-2 text-xs">{p.type}</td>
                          <td className="py-3 px-2 font-semibold">{formatCurrency(p.price)}</td>
                          <td className="py-3 px-2">{p.stockQuantity ?? '∞'}</td>
                          <td className="py-3 px-2 text-xs">{p.gender ? <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">{p.gender}</span> : <span className="text-slate-500">-</span>}</td>
                          <td className="py-3 px-2 text-xs">{p.sizes ? <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{p.sizes}</span> : <span className="text-slate-500">-</span>}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openProductForm(p)}
                                className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition"
                              >
                                ✏️ Edit
                              </button>
                              {p.isActive && (
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition"
                                >
                                  🗑️ Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {adminProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            <p className="text-4xl mb-2">📦</p>
                            <p>No products yet. Click "+ Add Product" to create your first product.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Deposits Tab */}
          {tab === 'deposits' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['PENDING', 'COMPLETED', 'REJECTED', ''] as const).map((s) => (
                  <button
                    key={s || 'all'}
                    onClick={() => {
                      setDepositFilter(s);
                      setTimeout(loadData, 0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      depositFilter === s
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400 text-sm">
                      <th className="p-4">User</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">UTR</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No deposits
                        </td>
                      </tr>
                    )}
                    {deposits.map((d) => (
                      <tr key={d.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="p-4">
                          <div className="text-slate-200 font-semibold">{d.distributor?.name || '—'}</div>
                          <div className="text-slate-500 text-xs">{d.distributor?.email}</div>
                          <div className="text-slate-500 text-xs">{d.distributor?.phone}</div>
                        </td>
                        <td className="p-4 text-cyan-400 font-bold">₹{d.amount.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-slate-300 text-sm">{d.paymentMethod}</td>
                        <td className="p-4 font-mono text-xs text-slate-300 select-all">{d.transactionId || '—'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              d.status === 'PENDING'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : d.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{formatDate(d.createdAt)}</td>
                        <td className="p-4">
                          {d.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveDeposit(d.id)}
                                disabled={processingDeposit === d.id}
                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition disabled:opacity-50"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => rejectDeposit(d.id)}
                                disabled={processingDeposit === d.id}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition disabled:opacity-50"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* Stat Card */
const StatCard: React.FC<{ icon: string; label: string; value: any; color?: string }> = ({ icon, label, value, color }) => (
  <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5">
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className={`text-2xl font-bold ${color === 'yellow' ? 'text-yellow-400' : 'text-slate-100'}`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

/* User Detail View */
const UserDetailView: React.FC<{ user: any; onBack: () => void; formatCurrency: (v: any) => string; formatDate: (d: string) => string }> = ({
  user, onBack, formatCurrency, formatDate,
}) => (
  <div className="space-y-6">
    <button onClick={onBack} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-sm">
      ← Back to Users
    </button>

    <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">{user.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><span className="text-slate-400">Email:</span> <span className="text-slate-200">{user.email}</span></div>
        <div><span className="text-slate-400">Phone:</span> <span className="text-slate-200">{user.phone || '-'}</span></div>
        <div><span className="text-slate-400">Rank:</span> <span className="text-cyan-400 font-semibold">{user.rank}</span></div>
        <div><span className="text-slate-400">Status:</span> <span className="text-emerald-400">{user.status}</span></div>
        <div><span className="text-slate-400">Referral Code:</span> <span className="text-slate-200 font-mono">{user.referralCode}</span></div>
        <div><span className="text-slate-400">Wallet:</span> <span className="text-slate-200 font-semibold">{formatCurrency(user.walletBalance)}</span></div>
        <div><span className="text-slate-400">Total Sales:</span> <span className="text-slate-200">{formatCurrency(user.totalSales)}</span></div>
        <div><span className="text-slate-400">Monthly Sales:</span> <span className="text-slate-200">{formatCurrency(user.monthlySales)}</span></div>
        <div><span className="text-slate-400">Personal Sales (L1):</span> <span className="text-slate-200">{formatCurrency(user.level1Sales)}</span></div>
        <div><span className="text-slate-400">Total Earnings:</span> <span className="text-slate-200">{formatCurrency(user.totalEarnings)}</span></div>
        <div><span className="text-slate-400">Joined:</span> <span className="text-slate-200">{formatDate(user.createdAt)}</span></div>
      </div>
    </div>

    {/* Recent Sales */}
    {user.sales?.length > 0 && (
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-3">Recent Purchases ({user.sales.length})</h3>
        <div className="space-y-2">
          {user.sales.map((s: any) => (
            <div key={s.id} className="flex justify-between text-sm bg-slate-800/50 rounded-lg px-4 py-2">
              <span className="text-slate-300">{s.product?.name || 'Unknown'} × {s.quantity}</span>
              <span className="text-slate-300 font-semibold">{formatCurrency(s.saleAmount)}</span>
              <span className="text-slate-500">{formatDate(s.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Achievements */}
    {user.achievements?.length > 0 && (
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-3">Achievements ({user.achievements.length})</h3>
        <div className="flex flex-wrap gap-2">
          {user.achievements.map((a: any) => (
            <span key={a.id} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-semibold">
              {a.rankName} — {formatCurrency(a.rewardAmount)} {a.claimedAt ? '✓' : '⏳'}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Recent Transactions */}
    {user.walletTransactions?.length > 0 && (
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-3">Wallet Transactions ({user.walletTransactions.length})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {user.walletTransactions.map((t: any) => (
            <div key={t.id} className="flex justify-between text-sm bg-slate-800/50 rounded-lg px-4 py-2">
              <span className="text-slate-400">{t.type}</span>
              <span className="text-slate-300">{t.description}</span>
              <span className={`font-semibold ${parseFloat(t.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(t.amount)}
              </span>
              <span className="text-slate-500 text-xs">{formatDate(t.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default Admin;
