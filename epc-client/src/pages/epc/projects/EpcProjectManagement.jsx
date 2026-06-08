import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const stageSteps = ['Order Created', 'Installation Pending', 'Net Metering', 'PCR Reports', 'Completed'];

const stageColors = {
  'Order Created':       'bg-blue-50 text-blue-600 border-blue-200',
  'Installation Pending':'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Net Metering':        'bg-orange-50 text-orange-600 border-orange-200',
  'PCR Reports':         'bg-purple-50 text-purple-600 border-purple-200',
  'Completed':           'bg-green-50 text-green-600 border-green-200',
};

const projectTypeColors = {
  'Surya Ghar Yojana':       'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Group Solar':              'bg-blue-50 text-blue-700 border-blue-200',
  'Village Solar Campaign':   'bg-green-50 text-green-700 border-green-200',
  'Commercial Solar':         'bg-purple-50 text-purple-700 border-purple-200',
  'Residential Solar':        'bg-orange-50 text-orange-700 border-orange-200',
};

const EpcProjectManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [search, setSearch]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await epcApi.get('/api/epc/orders');
      setOrders(data.orders || data);
    } catch (error) {
      console.error('Project management fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchStage  = stageFilter ? o.stage === stageFilter : true;
    const matchType   = typeFilter  ? o.projectType === typeFilter : true;
    const matchSearch = search
      ? o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.district?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchStage && matchType && matchSearch;
  });

  // Stage wise counts
  const stageCounts = stageSteps.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.stage === s).length;
    return acc;
  }, {});

  const PROJECT_TYPES = [
    'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
    'Commercial Solar', 'Residential Solar',
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">Project Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Track all installations — as set by Sunnovative admin
          </p>
        </div>
        <button onClick={load}
          className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stage overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stageSteps.map((stage, i) => (
          <button key={stage}
            onClick={() => setStageFilter(stageFilter === stage ? '' : stage)}
            className={`bg-white border rounded-xl p-3 text-left transition-all hover:shadow-sm ${
              stageFilter === stage ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">{i + 1}</span>
              <span className="text-lg font-bold text-gray-800">{stageCounts[stage] || 0}</span>
            </div>
            <p className="text-gray-600 text-xs font-medium leading-tight">{stage}</p>
            <div className={`mt-2 h-1 rounded-full ${
              stageFilter === stage ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customer, order no, district..."
          className="bg-white border border-gray-300 text-gray-800 placeholder-gray-400 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 w-64"
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
          <option value="">All Project Types</option>
          {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(stageFilter || typeFilter || search) && (
          <button
            onClick={() => { setStageFilter(''); setTypeFilter(''); setSearch(''); }}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 px-3 py-2 rounded-lg transition-colors">
            Clear Filters
          </button>
        )}
        <span className="text-gray-400 text-xs ml-auto">{filtered.length} projects</span>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-400">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const currentStageIdx = stageSteps.indexOf(order.stage);
            const progress = Math.round(((currentStageIdx) / (stageSteps.length - 1)) * 100);

            return (
              <div key={order._id}
                onClick={() => navigate(`/epc/projects/${order._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${stageColors[order.stage] || ''}`}>
                        {order.stage}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${projectTypeColors[order.projectType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.projectType}
                      </span>
                      {order.isOverdue && (
                        <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-medium">
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-800 font-semibold">{order.customerName}</h3>
                      <span className="text-gray-400 text-xs font-mono">#{order.orderNumber}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs flex-wrap">
                      <span>📍 {order.district}{order.city ? `, ${order.city}` : ''}</span>
                      {order.systemCapacityKw && <span>⚡ {order.systemCapacityKw} kW</span>}
                      {order.scheduledInstallDate && (
                        <span>📅 {new Date(order.scheduledInstallDate).toLocaleDateString('en-IN')}</span>
                      )}
                      {order.dueDateForCompletion && (
                        <span className={order.isOverdue ? 'text-red-500' : ''}>
                          ⏰ Due: {new Date(order.dueDateForCompletion).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">Progress</span>
                        <span className="text-blue-600 text-xs font-medium">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {/* Stage dots */}
                      <div className="flex justify-between mt-1">
                        {stageSteps.map((s, i) => (
                          <div key={s} className={`w-1.5 h-1.5 rounded-full ${
                            i <= currentStageIdx ? 'bg-blue-500' : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side - payment info */}
                  <div className="flex-shrink-0 text-right">
                    {order.totalProjectValue > 0 && (
                      <p className="text-gray-800 text-sm font-bold">
                        ₹{order.totalProjectValue?.toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className={`text-xs mt-0.5 font-medium ${
                      order.payment10?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.payment10?.status === 'Released' ? 'Fully Paid' : '10% Pending'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 justify-end text-blue-500">
                      <span className="text-xs">View</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EpcProjectManagement;