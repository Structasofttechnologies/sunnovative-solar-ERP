import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const statusColors = {
  New:       'bg-blue-50 text-blue-600 border-blue-200',
  Ongoing:   'bg-yellow-50 text-yellow-600 border-yellow-200',
  Overdue:   'bg-red-50 text-red-600 border-red-200',
  Completed: 'bg-green-50 text-green-600 border-green-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const stageSteps = ['Order Created', 'Installation Pending', 'Net Metering', 'PCR Reports', 'Completed'];

const EpcOrders = () => {
  const [searchParams] = useSearchParams();
  const defaultStatus = searchParams.get('status') || '';

  const [orders, setOrders]       = useState([]);
  const [summary, setSummary]     = useState({});
  const [filter, setFilter]       = useState(defaultStatus);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]             = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const [ordRes, sumRes] = await Promise.all([
        epcApi.get(`/api/epc/orders${params}`),
        epcApi.get('/api/epc/orders/summary'),
      ]);
      setOrders(ordRes.data.orders || ordRes.data);
      setSummary(sumRes.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const advanceStage = async (orderId, currentStage) => {
    const idx = stageSteps.indexOf(currentStage);
    if (idx >= stageSteps.length - 1) return;
    const nextStage = stageSteps[idx + 1];
    if (!window.confirm(`Move order to "${nextStage}"?`)) return;
    setStageLoading(true);
    try {
      const { data } = await epcApi.put(`/api/epc/orders/${orderId}/stage`, { stage: nextStage });
      setMsg(`Stage updated to: ${nextStage}`);
      setSelected(data.order);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setStageLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const tabs = [
    { key: '', label: 'All', count: orders.length },
    { key: 'New',       label: 'New',       count: summary.new || 0 },
    { key: 'Ongoing',   label: 'Ongoing',   count: summary.ongoing || 0 },
    { key: 'Overdue',   label: 'Overdue',   count: summary.overdue || 0 },
    { key: 'Completed', label: 'Completed', count: summary.completed || 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">All project orders — track payments and stages</p>
        </div>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">{msg}</div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              filter === t.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {order.projectType}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{order.orderNumber}</span>
                    </div>
                    <h3 className="text-gray-800 font-semibold">{order.customerName}</h3>
                    <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs flex-wrap">
                      <span>📱 {order.customerMobile}</span>
                      <span>📍 {order.district}</span>
                      {order.systemCapacityKw && <span>⚡ {order.systemCapacityKw} kW</span>}
                      {order.totalProjectValue > 0 && (
                        <span className="text-green-600 font-medium">₹{order.totalProjectValue?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(selected?._id === order._id ? null : order)}
                    className="flex-shrink-0 text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <svg className={`w-4 h-4 transition-transform ${selected?._id === order._id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Stage progress */}
                <div className="mt-4">
                  <div className="flex items-center gap-1">
                    {stageSteps.map((stage, i) => {
                      const currentIdx = stageSteps.indexOf(order.stage);
                      const done   = i < currentIdx;
                      const active = i === currentIdx;
                      return (
                        <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`h-1.5 w-full rounded-full ${done ? 'bg-blue-500' : active ? 'bg-blue-400' : 'bg-gray-200'}`} />
                          <span className={`text-xs text-center leading-tight hidden sm:block ${
                            active ? 'text-blue-600 font-medium' : done ? 'text-gray-400' : 'text-gray-300'
                          }`}>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {selected?._id === order._id && (
                <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">90% Payment</p>
                      <p className="text-gray-800 text-sm font-semibold">
                        ₹{order.payment90?.amount?.toLocaleString('en-IN') || 0}
                      </p>
                      <span className={`text-xs font-medium ${order.payment90?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.payment90?.status || 'Pending'}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">10% Payment (Escrow)</p>
                      <p className="text-gray-800 text-sm font-semibold">
                        ₹{order.payment10?.amount?.toLocaleString('en-IN') || 0}
                      </p>
                      <span className={`text-xs font-medium ${order.payment10?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.payment10?.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {order.scheduledInstallDate && (
                    <p className="text-gray-600 text-xs">📅 Scheduled: {new Date(order.scheduledInstallDate).toLocaleDateString('en-IN')}</p>
                  )}
                  {order.dueDateForCompletion && (
                    <p className="text-gray-600 text-xs">⏰ Due: {new Date(order.dueDateForCompletion).toLocaleDateString('en-IN')}</p>
                  )}

                  {order.stage !== 'Completed' && (
                    <button onClick={() => advanceStage(order._id, order.stage)} disabled={stageLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium py-2.5 rounded-lg transition-colors">
                      {stageLoading ? 'Updating...' : `→ Move to: ${stageSteps[stageSteps.indexOf(order.stage) + 1]}`}
                    </button>
                  )}

                  {order.customerRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Customer Rating:</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3.5 h-3.5 ${s <= order.customerRating ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EpcOrders;