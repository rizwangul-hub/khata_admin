import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminClient } from '../api/adminClient';
import { Store, CheckCircle, Clock, AlertTriangle, Plus, ChevronRight, Sparkles, DollarSign, Layers } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    expiredShops: 0,
    suspendedShops: 0,
    todayNewShops: 0,
  });
  const [revenue, setRevenue] = useState<any>({ thisMonth: 0, thisYear: 0, totalAllTime: 0 });
  const [recentShops, setRecentShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminClient.get('/dashboard/stats');
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }

      const revRes = await adminClient.get('/subscriptions/revenue');
      if (revRes.data?.success) {
        setRevenue(revRes.data.revenue);
      }

      const shopsRes = await adminClient.get('/shops?limit=5');
      if (shopsRes.data?.success) {
        setRecentShops(shopsRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = [
    { title: 'Total Shops', value: stats.totalShops, icon: Store, color: 'bg-blue-500', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { title: 'Active Shops', value: stats.activeShops, icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-600', borderColor: 'border-green-200' },
    { title: 'Expired Shops', value: stats.expiredShops, icon: Clock, color: 'bg-amber-500', textColor: 'text-amber-600', borderColor: 'border-amber-200' },
    { title: 'Suspended Shops', value: stats.suspendedShops, icon: AlertTriangle, color: 'bg-red-500', textColor: 'text-red-600', borderColor: 'border-red-200' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Universal Shop Khata SaaS Platform Management</p>
        </div>
        <button
          onClick={() => navigate('/shops/new')}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus size={20} />
          <span>Add New Shop</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`bg-white p-6 rounded-2xl border ${card.borderColor} shadow-sm hover:shadow-md transition-all flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className={`text-3xl font-extrabold mt-1 ${card.textColor}`}>
                {loading ? '...' : card.value}
              </h3>
            </div>
            <div className={`w-12 h-12 ${card.color} text-white rounded-2xl flex items-center justify-center shadow-md`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recorded Subscription Value</h3>
            <p className="text-xs text-slate-500">Subscription revenue metrics (Pre-payment gateway integration)</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
            PKR Currency
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">This Month</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">PKR {revenue.thisMonth.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">This Year</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">PKR {revenue.thisYear.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">All-Time Recorded Value</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">PKR {revenue.totalAllTime.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Today's New Shops Highlight */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/30 border border-blue-400/30 rounded-xl flex items-center justify-center text-blue-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-bold text-lg text-white">Today's New Onboarded Shops</h4>
            <p className="text-xs text-slate-300">Newly created shop accounts today</p>
          </div>
        </div>
        <div className="text-3xl font-black text-blue-400">
          {stats.todayNewShops}
        </div>
      </div>

      {/* Recent Shops Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recently Created Shops</h3>
            <p className="text-xs text-slate-500">Latest shops added to the SaaS platform</p>
          </div>
          <Link
            to="/shops"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Shops</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Shop Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">License ID</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                    Loading recent shops...
                  </td>
                </tr>
              ) : recentShops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                    No shops found yet. Click "Add New Shop" to create one.
                  </td>
                </tr>
              ) : (
                recentShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{shop.shopName}</td>
                    <td className="px-6 py-4">{shop.ownerName || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">{shop.licenseId}</td>
                    <td className="px-6 py-4 capitalize font-semibold">{shop.planType}</td>
                    <td className="px-6 py-4">
                      {shop.accountStatus === 'suspended' ? (
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
                          Suspended
                        </span>
                      ) : shop.calculatedStatus === 'expired' ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/shops/${shop.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
