import { useEffect, useState } from 'react';
import { Users, UserCheck, TrendingUp, Target } from 'lucide-react';
import LeadChart from './components/charts/LeadChart.jsx';
import ProjectChart from './components/charts/ProjectChart.jsx';
import { leadsApi } from '../../../services/leads/leadsApi.js';

export default function AnalyticsPage() {
  const [data, setData] = useState({ total: 0, statusStats: [], projectStats: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.getAnalytics()
      .then((res) => setData(res.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Status stats se converted aur assigned count nikalo
  const converted = data.statusStats?.find(s => s._id === 'Converted')?.count || 0;
  const assigned = data.statusStats?.find(s => s._id !== null)?.count || 0;
  const conversionRate = data.total ? ((converted / data.total) * 100).toFixed(1) : 0;

  const stats = [
    { label: 'Total Leads',      value: data.total || 0,  icon: Users,      color: 'bg-blue-50 text-blue-600' },
    { label: 'Converted',        value: converted,         icon: Target,     color: 'bg-purple-50 text-purple-600' },
    { label: 'Conversion Rate',  value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
    { label: 'Project Types',    value: data.projectStats?.length || 0, icon: UserCheck, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lead Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{loading ? '—' : s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      {!loading && data.statusStats?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Status Breakdown</h2>
          <div className="flex flex-wrap gap-2">
            {data.statusStats.map((s) => (
              <div key={s._id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium text-gray-700">{s._id || 'Unknown'}</span>
                <span className="ml-2 text-blue-600 font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <LeadChart />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <ProjectChart />
        </div>
      </div>
    </div>
  );
}