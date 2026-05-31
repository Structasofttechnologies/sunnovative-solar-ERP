import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { leadsApi } from '../../../../../services/leads/leadsApi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

const PROJECT_LABELS = {
  'surya-ghar': 'Surya Ghar', 'group-solar': 'Group Solar',
  'rwa-society': 'RWA Society', commercial: 'Commercial',
  village: 'Village', msme: 'MSME', general: 'General',
};

export default function ProjectChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.getAnalytics()
      .then((res) => {
        // Backend: res.data.projectStats
        const byProject = res.data?.projectStats || [];
        setData(byProject.map((d) => ({
          name: PROJECT_LABELS[d._id] || d._id || 'Unknown',
          value: d.count,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>;
  if (!data.length) return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No project data available</div>;

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-700 mb-3">Leads by Project</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => [v, 'Leads']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}