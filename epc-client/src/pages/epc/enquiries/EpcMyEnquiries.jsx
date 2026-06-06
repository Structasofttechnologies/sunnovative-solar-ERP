import { useEffect, useState } from 'react';
import epcApi from '../../../api/epcApi';

const statusColors = {
  New:             'bg-blue-50 text-blue-600 border-blue-200',
  Accepted:        'bg-yellow-50 text-yellow-600 border-yellow-200',
  CustomerPending: 'bg-orange-50 text-orange-600 border-orange-200',
  Converted:       'bg-green-50 text-green-600 border-green-200',
  Expired:         'bg-gray-100 text-gray-500 border-gray-200',
};

const EpcMyEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [filter, setFilter]       = useState('');
  const [msg, setMsg]             = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await epcApi.get('/api/epc/enquiries');
      setEnquiries(data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  const filtered = filter ? enquiries.filter(e => e.status === filter) : enquiries;
  const tabs = ['', 'New', 'Accepted', 'CustomerPending', 'Converted'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">My Enquiries</h2>
          <p className="text-gray-500 text-sm mt-0.5">Project-wise leads in your active districts</p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
          {msg}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              filter === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {t || 'All'} ({t === '' ? enquiries.length : enquiries.filter(e => e.status === t).length})
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading enquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-400">No enquiries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enq) => (
            <div key={enq._id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[enq.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {enq.status}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                      {enq.projectType}
                    </span>
                    {enq.orderNumber && (
                      <span className="text-xs text-gray-400 font-mono">#{enq.orderNumber}</span>
                    )}
                  </div>
                  <h3 className="text-gray-800 font-semibold">{enq.customerName}</h3>
                  <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs flex-wrap">
                    <span>📱 {enq.customerMobile}</span>
                    <span>📍 {enq.district}{enq.city ? `, ${enq.city}` : ''}</span>
                    {enq.systemCapacityKw && <span>⚡ {enq.systemCapacityKw} kW</span>}
                    <span>🕒 {new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {enq.customerSelectionDeadline && enq.status === 'Accepted' && (
                    <p className="text-orange-600 text-xs mt-2 bg-orange-50 px-2 py-1 rounded">
                      ⏳ Customer must confirm by: {new Date(enq.customerSelectionDeadline).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                {enq.status === 'New' && (
                  <button onClick={() => handleAccept(enq._id)} disabled={accepting === enq._id}
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                    {accepting === enq._id ? 'Accepting...' : 'Accept Order'}
                  </button>
                )}
                {enq.status === 'Converted' && (
                  <span className="flex-shrink-0 text-xs text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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