import React, { useEffect, useState } from 'react';
import { adminClient } from '../api/adminClient';
import { Layers, Plus, Edit2, CheckCircle2, XCircle, Store, Clock } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationValue: 1,
    durationUnit: 'month',
    price: 1500,
    currency: 'PKR',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await adminClient.get('/plans');
      if (res.data?.success) {
        setPlans(res.data.plans);
      }
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      durationValue: 1,
      durationUnit: 'month',
      price: 1500,
      currency: 'PKR',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      durationValue: plan.durationValue,
      durationUnit: plan.durationUnit,
      price: plan.price,
      currency: plan.currency || 'PKR',
      description: plan.description || '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      const res = await adminClient.patch(`/plans/${planId}/status`);
      if (res.data?.success) {
        loadPlans();
      }
    } catch (e) {
      alert('Failed to toggle plan status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPlan) {
        const res = await adminClient.put(`/plans/${editingPlan._id}`, formData);
        if (res.data?.success) {
          setShowModal(false);
          loadPlans();
        }
      } else {
        const res = await adminClient.post('/plans', formData);
        if (res.data?.success) {
          setShowModal(false);
          loadPlans();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-sm text-slate-500">Configure pricing, duration, and SaaS subscription tier features</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus size={20} />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <p className="col-span-full p-8 text-center text-slate-400 font-medium">Loading subscription plans...</p>
        ) : plans.length === 0 ? (
          <p className="col-span-full p-8 text-center text-slate-400 font-medium">No plans configured yet.</p>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                plan.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      plan.isActive
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {plan.isActive ? '● Active' : '○ Inactive'}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium min-h-[36px]">
                  {plan.description || `${plan.durationValue} ${plan.durationUnit} subscription tier`}
                </p>

                <div className="my-6">
                  <span className="text-3xl font-black text-slate-900">
                    PKR {plan.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-bold ml-1">
                    / {plan.durationValue} {plan.durationUnit}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 mb-4">
                  <Store size={16} className="text-blue-600" />
                  <span>{plan.shopCount || 0} Shops Currently Subscribed</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleToggleStatus(plan._id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    plan.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Plan Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Quarterly Deluxe"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Duration Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationValue}
                    onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Duration Unit *
                  </label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm"
                  >
                    <option value="day">Day(s)</option>
                    <option value="week">Week(s)</option>
                    <option value="month">Month(s)</option>
                    <option value="year">Year(s)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.currency}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this plan tier..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
