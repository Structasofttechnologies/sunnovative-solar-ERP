import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { leadsApi } from '../../../../../services/leads/leadsApi';

const PROJECTS = [
  { value: 'surya-ghar', label: 'Surya Ghar Yojana' },
  { value: 'group-solar', label: 'Group Solar' },
  { value: 'rwa-society', label: 'RWA Society Solar' },
  { value: 'commercial', label: 'Commercial SolarKits' },
  { value: 'village', label: 'Village Campaigns' },
  { value: 'msme', label: 'MSME Solar' },
  { value: 'general', label: 'General' },
];

export default function CreateLeadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    pincode: '',
    address: '',
    solarType: 'general',
    kw: '',
    billAmount: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.mobile.trim()) { setError('Mobile number is required'); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        whatsapp: form.mobile.trim(),
        email: form.email.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        address: form.address.trim() || undefined,
        solarType: form.solarType,
        kw: form.kw || '0',
        billAmount: form.billAmount ? Number(form.billAmount) : 0,
        notes: form.notes.trim() || undefined,
      };
      await leadsApi.createLead(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Add New Lead</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *" value={form.name} onChange={(v) => set('name', v)} />
          <Field label="Mobile *" value={form.mobile} onChange={(v) => set('mobile', v)} type="tel" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Field label="Pincode" value={form.pincode} onChange={(v) => set('pincode', v)} />
          <Field label="System Capacity (kW)" value={form.kw} onChange={(v) => set('kw', v)} type="number" />
          <Field label="Electricity Bill (₹)" value={form.billAmount} onChange={(v) => set('billAmount', v)} type="number" />

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Project / Solar Type</label>
            <select
              value={form.solarType}
              onChange={(e) => set('solarType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {PROJECTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}