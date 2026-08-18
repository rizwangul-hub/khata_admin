import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, User, Mail, Globe, Server } from 'lucide-react';

export default function Settings() {
  const { admin } = useAdminAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin System Settings</h1>
        <p className="text-sm text-slate-500">Super admin profile and platform configuration parameters</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{admin?.name || 'Super Admin'}</h2>
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{admin?.role}</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <span className="font-semibold text-slate-700">Admin Email</span>
            </div>
            <span className="font-bold text-slate-900">{admin?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Server size={18} className="text-slate-400" />
              <span className="font-semibold text-slate-700">Backend API URL</span>
            </div>
            <span className="font-mono text-xs text-slate-600 font-bold">http://localhost:5000/api</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <span className="font-semibold text-slate-700">Platform Name</span>
            </div>
            <span className="font-bold text-slate-900">Universal Shop Khata SaaS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
