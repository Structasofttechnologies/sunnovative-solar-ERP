import { useState, useEffect } from 'react';
import { leadsApi } from '../../../../../services/leads/leadsApi';
import { X, UserCheck, Search } from 'lucide-react';
import api from '../../../../../api/axios.js';

const PROJECT_LABELS = {
  'surya-ghar': 'Surya Ghar', 'group-solar': 'Group Solar',
  'rwa-society': 'RWA Society', 'commercial': 'Commercial',
  'village': 'Village', 'msme': 'MSME Solar', 'general': 'General',
};

export default function AssignedLeadModal({ lead, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Team members fetch karo
  useEffect(() => {
    const fetchUsers = async () => {
      setFetching(true);
      try {
        const res = await api.get('/hr/employees');
        const list = res.data?.data || res.data?.employees || res.data || [];
        setUsers(Array.isArray(list) ? list : []);
      } catch {
        // fallback — users endpoint try karo
        try {
          const res2 = await api.get('/users');
          const list = res2.data?.data || res2.data?.users || res2.data || [];
          setUsers(Array.isArray(list) ? list : []);
        } catch {
          setError('Team members load nahi ho sake');
        }
      } finally {
        setFetching(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  const handleAssign = async () => {
    if (!selected) { setError('Pehle koi team member select karo'); return; }
    setLoading(true);
    setError('');
    try {
      await leadsApi.assignLead(lead._id, selected._id);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Assign Lead</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Lead Info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Name:</span> {lead.name}</p>
          <p><span className="font-medium text-gray-700">Mobile:</span> {lead.mobile}</p>
          <p><span className="font-medium text-gray-700">Project:</span> {PROJECT_LABELS[lead.solarType] || lead.solarType}</p>
          {lead.assignedTo && (
            <p className="text-yellow-600 mt-1">⚠️ Already assigned to: {lead.assignedTo?.name || 'someone'}</p>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Name ya phone se search karo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Users List */}
        <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-xl mb-4">
          {fetching ? (
            <div className="py-6 text-center text-sm text-gray-400">Loading team members...</div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">Koi member nahi mila</div>
          ) : (
            filtered.map((u) => (
              <div
                key={u._id}
                onClick={() => { setSelected(u); setError(''); }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition border-b border-gray-100 last:border-0 ${
                  selected?._id === u._id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.phone || u.email}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{u.role}</span>
                {selected?._id === u._id && (
                  <span className="text-blue-600 text-xs font-medium">✓</span>
                )}
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-3 text-sm text-blue-700">
            Selected: <span className="font-semibold">{selected.name}</span>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={loading || !selected}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
            {loading ? 'Assigning...' : `Assign to ${selected?.name || '...'}`}
          </button>
        </div>
      </div>
    </div>
  );
}