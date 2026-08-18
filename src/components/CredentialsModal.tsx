import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, X } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    shopName: string;
    licenseId: string;
    shopCode: string;
    password?: string;
    planType?: string;
    expiryDate?: string;
  } | null;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !credentials) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedCopyAllText = `🌟 Universal Shop Khata Credentials

🏪 Shop: ${credentials.shopName}
🔑 License ID: ${credentials.licenseId}
🆔 Shop Code: ${credentials.shopCode}
${credentials.password ? `🔐 Password: ${credentials.password}\n` : ''}📅 Plan: ${credentials.planType || 'Monthly'}
⏳ Expiry Date: ${credentials.expiryDate || 'N/A'}

App Download & Support: Contact Administrator`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Shop Credentials Generated</h3>
              <p className="text-xs text-blue-100">Copy and send credentials to the shopkeeper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Shop Name</span>
            <p className="font-bold text-slate-900 text-lg">{credentials.shopName}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* License ID */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">License ID</span>
                <p className="font-mono font-bold text-slate-800">{credentials.licenseId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(credentials.licenseId, 'licenseId')}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                title="Copy License ID"
              >
                {copiedField === 'licenseId' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>

            {/* Shop Code */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Shop Code</span>
                <p className="font-mono font-bold text-slate-800">{credentials.shopCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(credentials.shopCode, 'shopCode')}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                title="Copy Shop Code"
              >
                {copiedField === 'shopCode' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Password (If Available) */}
          {credentials.password && (
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase">Generated Password</span>
                <p className="font-mono font-bold text-amber-900 text-lg">{credentials.password}</p>
              </div>
              <button
                onClick={() => copyToClipboard(credentials.password!, 'password')}
                className="p-2 text-amber-700 hover:text-amber-900 hover:bg-white rounded-lg transition-colors"
                title="Copy Password"
              >
                {copiedField === 'password' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => copyToClipboard(formattedCopyAllText, 'all')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {copiedField === 'all' ? (
                <>
                  <Check size={18} />
                  <span>Copied All Text!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy All Credentials</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
