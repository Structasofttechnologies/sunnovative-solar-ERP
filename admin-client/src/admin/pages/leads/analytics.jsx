import { useEffect, useState } from 'react';
import { Users, UserCheck, TrendingUp, Target } from 'lucide-react';
import LeadChart from './components/charts/LeadChart.jsx';
import ProjectChart from './components/charts/ProjectChart.jsx';
import { leadsApi } from '../../../services/leads/leadsApi.js';

export default function AnalyticsPage() {
  const [totals, setTotals] = useState({ total: 0, assigned: 0, converted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi
      .getAnalytics()
      .then((res) => setTotals(res.analytics?.totals || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const conversionRate = totals.total
    ? ((totals.converted / totals.total) * 100).toFixed(1)
    : 0;

  const stats = [
    { label: 'Total Leads', value: totals.total, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Assigned', value: totals.assigned, icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Converted', value: totals.converted, icon: Target, color: 'bg-purple-50 text-purple-600' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
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
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '—' : s.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

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