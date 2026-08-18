import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminClient } from '../api/adminClient';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Store } from 'lucide-react';

export default function Shops() {
  const navigate = useNavigate();

  const [shops, setShops] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const loadShops = async () => {
    setLoading(true);
    try {
      const res = await adminClient.get(
        `/shops?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${statusFilter}&plan=${planFilter}&sortBy=${sortBy}`
      );
      if (res.data?.success) {
        setShops(res.data.data);
        setTotalPages(res.data.pagination.pages || 1);
      }
    } catch (e) {
      console.error('Failed to load shops', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, [page, search, statusFilter, planFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shop Management</h1>
          <p className="text-sm text-slate-500">View, search, filter and manage shopkeeper accounts</p>
        </div>
        <button
          onClick={() => navigate('/shops/new')}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus size={20} />
          <span>Add New Shop</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by shop name, owner, phone, license ID or shop code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 hidden sm:inline" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Plans</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="expiry">Expiry Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shops Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">Owner & Phone</th>
                <th className="px-6 py-4">License ID</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Days Left</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">
                    Loading shops...
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">
                    No shops matching the search or filter criteria.
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{shop.shopName}</p>
                          <p className="text-xs text-slate-400 font-mono">{shop.shopCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{shop.ownerName || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{shop.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{shop.licenseId}</td>
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
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {shop.daysRemaining > 0 ? `${shop.daysRemaining} days` : 'Expired'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/shops/${shop.id}`}
                        className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors inline-block"
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

        {/* Mobile Responsive Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <p className="p-6 text-center text-slate-400">Loading shops...</p>
          ) : shops.length === 0 ? (
            <p className="p-6 text-center text-slate-400">No shops found.</p>
          ) : (
            shops.map((shop) => (
              <div key={shop.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{shop.shopName}</h3>
                    <p className="text-xs text-slate-500">{shop.ownerName} • {shop.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg">
                    {shop.licenseId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold capitalize text-slate-600">{shop.planType} Plan</span>
                  <Link
                    to={`/shops/${shop.id}`}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            Page {page} of {totalPages}
          </p>
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
    </div>
  );
}
