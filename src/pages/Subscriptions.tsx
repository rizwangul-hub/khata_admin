import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminClient } from '../api/adminClient';
import { Search, Filter, RefreshCw, Clock, ChevronLeft, ChevronRight, Store, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState<'all' | 'expiring_soon' | 'expired' | 'renewals'>('all');
  const [shops, setShops] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiry');
  const [loading, setLoading] = useState(true);

  // Action Modals State
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [modalType, setModalType] = useState<'renew' | 'extend' | 'assign' | null>(null);
  const [extendDays, setExtendDays] = useState('30');
  const [assignPlanSlug, setAssignPlanSlug] = useState('monthly');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'renewals') {
        const res = await adminClient.get(`/subscriptions/renewals?page=${page}&limit=10`);
        if (res.data?.success) {
          setRenewals(res.data.data);
          setTotalPages(res.data.pagination.pages || 1);
        }
      } else {
        const statusParam = activeTab === 'all' ? 'all' : activeTab;
        const res = await adminClient.get(
          `/subscriptions?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${statusParam}&plan=${planFilter}&sortBy=${sortBy}`
        );
        if (res.data?.success) {
          setShops(res.data.data);
          setTotalPages(res.data.pagination.pages || 1);
        }
      }
    } catch (e) {
      console.error('Failed to load subscriptions data', e);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await adminClient.get('/plans');
      if (res.data?.success) setPlans(res.data.plans);
    } catch (e) {
      console.error('Failed to load plans', e);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, page, search, planFilter, sortBy]);

  const handleRenew = async () => {
    if (!selectedShop) return;
    setActionLoading(true);
    try {
      const res = await adminClient.post(`/shops/${selectedShop.id}/subscription/renew`, {
        planSlug: assignPlanSlug,
      });
      if (res.data?.success) {
        alert('Subscription renewed successfully!');
        setModalType(null);
        loadData();
      }
    } catch (e) {
      alert('Failed to renew subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!selectedShop) return;
    const days = parseInt(extendDays);
    if (isNaN(days) || days <= 0) return;
    setActionLoading(true);
    try {
      const res = await adminClient.post(`/shops/${selectedShop.id}/subscription/extend`, { days });
      if (res.data?.success) {
        alert(`Subscription extended by ${days} days!`);
        setModalType(null);
        loadData();
      }
    } catch (e) {
      alert('Failed to extend subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription & Renewal Management</h1>
        <p className="text-sm text-slate-500">Monitor active licenses, expiring accounts, custom extensions, and renewal audit logs</p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Shops
        </button>
        <button
          onClick={() => { setActiveTab('expiring_soon'); setPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'expiring_soon' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle size={16} />
          <span>Expiring Soon (≤ 7 Days)</span>
        </button>
        <button
          onClick={() => { setActiveTab('expired'); setPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'expired' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Expired Shops
        </button>
        <button
          onClick={() => { setActiveTab('renewals'); setPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'renewals' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RefreshCw size={16} />
          <span>Renewal History</span>
        </button>
      </div>

      {/* Search & Filters */}
      {activeTab !== 'renewals' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by shop, owner, phone, or license ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
            >
              <option value="all">All Plans</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
            >
              <option value="expiry">Sort by Expiry Date</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Shop Name A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'renewals' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Shop</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Plan / Expiry</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading renewal history...</td></tr>
                ) : renewals.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">No renewal records found.</td></tr>
                ) : (
                  renewals.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{r.shopId?.shopName || 'Shop'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded-full border border-indigo-200">
                          {r.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {r.newPlan} (Exp: {formatDate(r.newExpiry)})
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">PKR {r.amount || 0}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{r.adminEmail || 'Admin'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Shop</th>
                  <th className="px-6 py-4">License ID</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Days Left</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading subscriptions...</td></tr>
                ) : shops.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No subscriptions matching criteria.</td></tr>
                ) : (
                  shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{shop.shopName}</p>
                        <p className="text-xs text-slate-500">{shop.ownerName || 'N/A'} • {shop.phone}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{shop.licenseId}</td>
                      <td className="px-6 py-4 font-semibold capitalize">{shop.planType}</td>
                      <td className="px-6 py-4">
                        {shop.calculatedStatus === 'suspended' ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">Suspended</span>
                        ) : shop.calculatedStatus === 'expired' ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">Expired</span>
                        ) : shop.calculatedStatus === 'expiring_soon' ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Expiring Soon</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{formatDate(shop.planExpiryDate)}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {shop.daysRemaining > 0 ? `${shop.daysRemaining} days` : 'Expired'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedShop(shop); setAssignPlanSlug(shop.planType); setModalType('renew'); }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors inline-block"
                        >
                          Renew
                        </button>
                        <button
                          onClick={() => { setSelectedShop(shop); setModalType('extend'); }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors inline-block"
                        >
                          Extend
                        </button>
                        <Link
                          to={`/shops/${shop.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors inline-block"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Renew Modal */}
      {modalType === 'renew' && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Renew Subscription</h3>
            <p className="text-xs text-slate-500">Renew license for <span className="font-bold text-slate-800">{selectedShop.shopName}</span></p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Select Plan</label>
              <select
                value={assignPlanSlug}
                onChange={(e) => setAssignPlanSlug(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                {plans.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} (PKR {p.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRenew}
                disabled={actionLoading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm"
              >
                {actionLoading ? 'Renewing...' : 'Confirm Renewal'}
              </button>
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Custom Days Modal */}
      {modalType === 'extend' && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Extend Subscription Days</h3>
            <p className="text-xs text-slate-500">Extend subscription expiry for <span className="font-bold text-slate-800">{selectedShop.shopName}</span></p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Number of Days to Extend</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                placeholder="e.g. 30"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExtend}
                disabled={actionLoading}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm"
              >
                {actionLoading ? 'Extending...' : 'Confirm Extension'}
              </button>
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
