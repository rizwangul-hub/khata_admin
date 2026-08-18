import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminClient } from '../api/adminClient';
import { CredentialsModal } from '../components/CredentialsModal';
import {
  Store,
  Phone,
  Calendar,
  Key,
  RefreshCw,
  Clock,
  Lock,
  Unlock,
  MessageSquare,
  ArrowLeft,
  Users,
  ShieldCheck,
  CheckCircle,
  History,
  FileCheck,
} from 'lucide-react';

export default function ShopDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Extend Modal State
  const [extendDays, setExtendDays] = useState('30');
  const [showExtendModal, setShowExtendModal] = useState(false);

  // Reset Password Credentials Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<any>(null);

  const loadShopDetails = async () => {
    setLoading(true);
    try {
      const res = await adminClient.get(`/shops/${id}`);
      if (res.data?.success) {
        setData(res.data);
      }

      const histRes = await adminClient.get(`/shops/${id}/subscription-history`);
      if (histRes.data?.success) {
        setHistory(histRes.data.history);
      }
    } catch (e) {
      console.error('Failed to load shop details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadShopDetails();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading shop details...
      </div>
    );
  }

  const { shop, stats } = data;

  const handleRenew = async (planType: string) => {
    if (!window.confirm(`Renew subscription for ${shop.shopName} on ${planType} plan?`)) return;
    setActionLoading(true);
    try {
      const res = await adminClient.post(`/shops/${id}/subscription/renew`, { planSlug: planType });
      if (res.data?.success) {
        alert('Subscription renewed successfully!');
        loadShopDetails();
      }
    } catch (e) {
      alert('Failed to renew subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    const days = parseInt(extendDays);
    if (isNaN(days) || days <= 0) return;
    setActionLoading(true);
    try {
      const res = await adminClient.post(`/shops/${id}/subscription/extend`, { days });
      if (res.data?.success) {
        alert(`Subscription extended by ${days} days!`);
        setShowExtendModal(false);
        loadShopDetails();
      }
    } catch (e) {
      alert('Failed to extend subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const action = shop.accountStatus === 'suspended' ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this shop account?`)) return;
    setActionLoading(true);
    try {
      const res = await adminClient.post(`/shops/${id}/status`, { action });
      if (res.data?.success) {
        alert(`Shop account ${action}d!`);
        loadShopDetails();
      }
    } catch (e) {
      alert(`Failed to ${action} shop`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Reset password for ${shop.shopName}? Old password will be invalidated immediately.`)) return;
    setActionLoading(true);
    try {
      const res = await adminClient.post(`/shops/${id}/reset-password`);
      if (res.data?.success) {
        setResetCredentials({
          shopName: shop.shopName,
          licenseId: shop.licenseId,
          shopCode: shop.shopCode,
          password: res.data.newPassword,
          planType: shop.planType,
          expiryDate: new Date(shop.planExpiryDate).toISOString().split('T')[0],
        });
        setResetModalOpen(true);
      }
    } catch (e) {
      alert('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (!shop.phone) return alert('No phone number registered for this shop.');
    const formattedPhone = shop.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${shop.ownerName || shop.shopName}, this is Universal Shop Khata Support regarding your shop account (License ID: ${shop.licenseId}).`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shops')}
            className="p-2 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{shop.shopName}</h1>
            <p className="text-sm text-slate-500">Shop ID: {shop.id}</p>
          </div>
        </div>

        <button
          onClick={openWhatsApp}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
        >
          <MessageSquare size={18} />
          <span>Contact WhatsApp</span>
        </button>
      </div>

      {/* Main Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop & Owner</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{shop.shopName}</h3>
            <p className="text-sm font-semibold text-slate-700">{shop.ownerName || 'Owner Name Unspecified'}</p>
          </div>

          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Phone size={16} className="text-slate-400" />
            <span className="font-semibold">{shop.phone || 'No phone number'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Calendar size={16} className="text-slate-400" />
            <span>Created on {formatDate(shop.createdAt)}</span>
          </div>
        </div>

        {/* Credentials Column */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shop Credentials</span>
          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">License ID</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{shop.licenseId}</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">Shop Code</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{shop.shopCode}</span>
          </div>
          <button
            onClick={handleResetPassword}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
          >
            <Key size={14} />
            <span>Reset Password</span>
          </button>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Subscription Plan</span>
            <h2 className="text-3xl font-extrabold capitalize text-white mt-1">{shop.planType} Plan</h2>
          </div>

          <div>
            {shop.accountStatus === 'suspended' ? (
              <span className="px-4 py-1.5 bg-red-500/30 border border-red-400 text-red-200 font-bold rounded-full text-sm">
                ● Suspended
              </span>
            ) : shop.calculatedStatus === 'expired' ? (
              <span className="px-4 py-1.5 bg-amber-500/30 border border-amber-400 text-amber-200 font-bold rounded-full text-sm">
                ● Subscription Expired
              </span>
            ) : (
              <span className="px-4 py-1.5 bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-bold rounded-full text-sm">
                ● Active ({shop.daysRemaining} days remaining)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-300 font-medium">Start Date</p>
            <p className="font-bold text-lg">{formatDate(shop.planStartDate)}</p>
          </div>
          <div>
            <p className="text-blue-300 font-medium">Expiry Date</p>
            <p className="font-bold text-lg text-amber-300">{formatDate(shop.planExpiryDate)}</p>
          </div>
        </div>

        {/* Subscription Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => handleRenew(shop.planType)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
          >
            <RefreshCw size={16} />
            <span>Renew Plan ({shop.planType})</span>
          </button>

          <button
            onClick={() => setShowExtendModal(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
          >
            <Clock size={16} />
            <span>Extend Custom Days</span>
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-md transition-colors text-sm ${
              shop.accountStatus === 'suspended'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {shop.accountStatus === 'suspended' ? <Unlock size={16} /> : <Lock size={16} />}
            <span>{shop.accountStatus === 'suspended' ? 'Activate Account' : 'Suspend Account'}</span>
          </button>
        </div>
      </div>

      {/* Subscription Audit History Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">Subscription Audit Timeline</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium p-4 text-center">No subscription events recorded yet.</p>
        ) : (
          <div className="space-y-4 pt-2">
            {history.map((h) => (
              <div key={h._id} className="flex gap-4 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">
                  <FileCheck size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {h.action}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{formatDate(h.createdAt)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {h.newPlan ? `Plan: ${h.newPlan.toUpperCase()}` : ''} {h.newExpiry ? `• Expiry: ${formatDate(h.newExpiry)}` : ''}
                  </p>
                  {h.amount ? <p className="text-xs font-bold text-slate-900 mt-0.5">Recorded Value: PKR {h.amount}</p> : null}
                  {h.adminEmail ? <p className="text-xs text-slate-400 mt-0.5">By: {h.adminEmail}</p> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real Shop Statistics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Shop Business Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Customers</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalCustomers}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-red-500 uppercase">Total Credit</span>
            <p className="text-2xl font-extrabold text-red-600 mt-1">Rs. {stats.totalCredit.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-green-600 uppercase">Total Received</span>
            <p className="text-2xl font-extrabold text-green-600 mt-1">Rs. {stats.totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-blue-600 uppercase">Total Debt</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">Rs. {stats.totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Custom Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Extend Subscription</h3>
            <p className="text-xs text-slate-500">Enter number of days to extend subscription</p>
            <input
              type="number"
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              placeholder="e.g. 30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleExtend}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Confirm Extension
              </button>
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      <CredentialsModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        credentials={resetCredentials}
      />
    </div>
  );
}
