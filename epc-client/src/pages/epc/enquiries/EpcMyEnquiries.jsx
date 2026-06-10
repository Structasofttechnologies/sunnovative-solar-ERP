import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const PROJECT_TYPES = [
  'Surya Ghar Yojana',
  'Group Solar',
  'Village Solar Campaign',
  'Commercial Solar',
  'Residential Solar',
];

const statusColors = {
  New:             'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800',
  Accepted:        'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800',
  CustomerPending: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800',
  Converted:       'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800',
  Expired:         'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600',
};

const EpcMyEnquiries = () => {
  const { epc } = useEpcAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [msg, setMsg]             = useState('');

  // Filters — boss ne kaha: Project types and district
  const [filterType, setFilterType]   = useState('');
  const [filterDist, setFilterDist]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType)   params.set('projectType', filterType);
      if (filterDist)   params.set('district', filterDist);
      if (filterStatus) params.set('status', filterStatus);

      const { data } = await epcApi.get(`/api/epc/enquiries?${params}`);
      setEnquiries(data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType, filterDist, filterStatus]);

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this enquiry? You will be charged the acceptance fee.')) return;
    setAccepting(id);
    try {
      await epcApi.put(`/api/epc/enquiries/${id}/accept`);
      setMsg('Enquiry accepted! Customer has 24 hours to confirm.');
      load();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Failed to accept');
    } finally {
      setAccepting(null);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterDist('');
    setFilterStatus('');
  };

  const inputCls = 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white text-xl font-bold">My Enquiries</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            Project-wise leads in your active districts
          </p>
        </div>
        <button onClick={load}
          className="text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {msg && (
        <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm rounded-lg px-4 py-3">
          {msg}
        </div>
      )}

      {/* ── Filters — boss ne kaha Project types + district ── */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Type filter */}
          <div>
            <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* District filter — from EPC's active districts */}
          <div>
            <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">District</label>
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)}
              className={inputCls}>
              <option value="">All Districts</option>
              {(epc?.activeDistricts || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className={inputCls}>
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Accepted">Accepted</option>
              <option value="CustomerPending">Customer Pending</option>
              <option value="Converted">Converted</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Clear filters */}
          {(filterType || filterDist || filterStatus) && (
            <div className="mt-4">
              <button onClick={clearFilters}
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 px-3 py-2 rounded-lg transition-colors">
                Clear Filters
              </button>
            </div>
          )}

          <div className="ml-auto mt-4">
            <span className="text-gray-400 dark:text-slate-500 text-xs">{enquiries.length} enquiries</span>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 dark:text-slate-500">Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
          <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-400 dark:text-slate-500">No enquiries found</p>
          {(filterType || filterDist || filterStatus) && (
            <button onClick={clearFilters}
              className="mt-2 text-blue-500 dark:text-blue-400 text-sm hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq) => (
            <div key={enq._id}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[enq.status] || 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'}`}>
                      {enq.status}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600">
                      {enq.projectType}
                    </span>
                    {enq.orderNumber && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">#{enq.orderNumber}</span>
                    )}
                  </div>

                  <h3 className="text-gray-800 dark:text-white font-semibold">{enq.customerName}</h3>

                  <div className="flex items-center gap-4 mt-1 text-gray-500 dark:text-slate-400 text-xs flex-wrap">
                    <span>📱 {enq.customerMobile}</span>
                    <span>📍 {enq.district}{enq.city ? `, ${enq.city}` : ''}</span>
                    {enq.systemCapacityKw && <span>⚡ {enq.systemCapacityKw} kW</span>}
                    <span>🕒 {new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>

                  {enq.customerSelectionDeadline && enq.status === 'Accepted' && (
                    <p className="text-orange-600 dark:text-orange-400 text-xs mt-2 bg-orange-50 dark:bg-orange-900/40 px-2 py-1 rounded">
                      ⏳ Customer must confirm by:{' '}
                      {new Date(enq.customerSelectionDeadline).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                {enq.status === 'New' && (
                  <button onClick={() => handleAccept(enq._id)}
                    disabled={accepting === enq._id}
                    className="flex-shrink-0 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                    {accepting === enq._id ? 'Accepting...' : 'Accept Order'}
                  </button>
                )}

                {enq.status === 'Converted' && (
                  <span className="flex-shrink-0 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/40 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Order Created
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EpcMyEnquiries;