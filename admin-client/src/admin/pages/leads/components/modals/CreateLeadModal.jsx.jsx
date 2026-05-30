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
    name: '', phone: '', email: '', city: '', state: '',
    pincode: '', address: '', project: 'general', systemCapacity: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and Phone are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await leadsApi.createLead(form);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create lead');
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
          <Field label="Phone *" value={form.phone} onChange={(v) => set('phone', v)} type="tel" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
          <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
          <Field label="Pincode" value={form.pincode} onChange={(v) => set('pincode', v)} />
          <Field label="System Capacity (kW)" value={form.systemCapacity} onChange={(v) => set('systemCapacity', v)} type="number" />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
            <select
              value={form.project}
              onChange={(e) => set('project', e.target.value)}
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
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60"
          >
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