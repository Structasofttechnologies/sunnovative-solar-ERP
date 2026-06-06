import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const EpcAdminSettings = () => {
  const { epc } = useEpcAuth();
  const [slots, setSlots]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState({ text: '', type: '' });
  const [filterPT, setFilterPT]     = useState('');
  const [filterDist, setFilterDist] = useState('');
  const [form, setForm] = useState({
    projectType: PROJECT_TYPES[0],
    district:    '',
    date:        '',
    maxBookings: 1,
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPT)   params.set('projectType', filterPT);
      if (filterDist) params.set('district', filterDist);
      const { data } = await epcApi.get(`/api/epc/calendar?${params}`);
      setSlots(data);
    } catch (error) {
      console.error('Calendar fetch error:', error);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterPT, filterDist]);

  useEffect(() => {
    if (epc?.activeDistricts?.length) {
      setForm(f => ({ ...f, district: epc.activeDistricts[0] }));
    }
  }, [epc]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.date) { setMsg({ text: 'Select a date', type: 'error' }); return; }
    setSaving(true);
    try {
      await epcApi.post('/api/epc/calendar', form);
      setMsg({ text: 'Slot added!', type: 'success' });
      setForm(f => ({ ...f, date: '' }));
      load();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Failed', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const toggleBlock = async (slot) => {
    try {
      await epcApi.put(`/api/epc/calendar/${slot._id}`, { isBlocked: !slot.isBlocked });
      load();
    } catch (error) { console.error(error); }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await epcApi.delete(`/api/epc/calendar/${id}`);
      load();
    } catch (error) { console.error(error); }
  };

  const inputCls = 'bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 text-xl font-bold">Admin Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage installation calendar — only booked slots show to customers</p>
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* Add slot form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-gray-700 text-sm font-semibold mb-4">Add Available Date Slot</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Project Type</label>
            <select value={form.projectType} onChange={e => setForm({...form, projectType: e.target.value})}
              className={`${inputCls} w-full`}>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">District</label>
            <select value={form.district} onChange={e => setForm({...form, district: e.target.value})}
              className={`${inputCls} w-full`}>
              {(epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Date *</label>
            <input type="date" value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({...form, date: e.target.value})}
              className={`${inputCls} w-full`} required />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Max Bookings</label>
            <div className="flex gap-2">
              <input type="number" min="1" max="20" value={form.maxBookings}
                onChange={e => setForm({...form, maxBookings: Number(e.target.value)})}
                className={`${inputCls} w-20`} />
              <button type="submit" disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? '...' : '+ Add'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterPT} onChange={e => setFilterPT(e.target.value)} className={`${inputCls} text-xs`}>
          <option value="">All Project Types</option>
          {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className={`${inputCls} text-xs`}>
          <option value="">All Districts</option>
          {(epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : slots.length === 0 ? (
        <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-sm">No slots added yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Date</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Project Type</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">District</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Bookings</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slots.map(slot => (
                <tr key={slot._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 text-xs font-medium">
                    {new Date(slot.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{slot.projectType}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{slot.district}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{slot.currentBookings}/{slot.maxBookings}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                      slot.isBlocked
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}>
                      {slot.isBlocked ? 'Blocked' : 'Available'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => toggleBlock(slot)}
                        className="text-xs text-gray-400 hover:text-yellow-600 transition-colors font-medium">
                        {slot.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button onClick={() => deleteSlot(slot._id)}
                        className="text-xs text-gray-400 hover:text-red-600 transition-colors font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EpcAdminSettings;