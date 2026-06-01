import { useEffect, useState } from 'react';
import { RefreshCw, UserCheck } from 'lucide-react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import LeadTables from './components/tables/LeadTables.jsx';
import api from '../../../api/axios.js';

export default function AssignedLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [stats, setStats] = useState([]);

  // Sab leads fetch karo
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (selectedEmployee) params.assignedTo = selectedEmployee;
      const data = await leadsApi.getAllLeads(params);
      const allLeads = data.data || [];
      setLeads(allLeads);
      buildStats(allLeads, employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Employees fetch karo
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      const list = res.data?.data || res.data?.employees || res.data || [];
      setEmployees(Array.isArray(list) ? list : []);
    } catch {
      try {
        const res2 = await api.get('/users');
        const list = res2.data?.data || res2.data?.users || res2.data || [];
        setEmployees(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Har employee ke liye assigned leads count banao
  const buildStats = (allLeads, empList) => {
    const map = {};
    allLeads.forEach((lead) => {
      if (lead.assignedTo) {
        const id = lead.assignedTo._id || lead.assignedTo;
        const name = lead.assignedTo?.name || 'Unknown';
        if (!map[id]) map[id] = { id, name, count: 0, converted: 0 };
        map[id].count++;
        if (lead.status === 'Converted') map[id].converted++;
      }
    });
    setStats(Object.values(map));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [selectedEmployee]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assigned Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here you can see all assigned leads to each employee</p>
        </div>
        <button onClick={fetchLeads}
          className="flex items-center gap-1 text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Employee wise stats cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedEmployee(selectedEmployee === s.id ? '' : s.id)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                selectedEmployee === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {s.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-gray-700 truncate">{s.name}</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.count}</p>
              <p className="text-xs text-gray-400">leads assigned</p>
              {s.converted > 0 && (
                <p className="text-xs text-green-600 mt-1">{s.converted} converted</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All employees' leads</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>{e.name} ({e.phone || e.email})</option>
          ))}
        </select>
        {selectedEmployee && (
          <button onClick={() => setSelectedEmployee('')}
            className="text-xs text-red-500 hover:underline">
            Filter hatao
          </button>
        )}
        <span className="text-sm text-gray-400">{leads.length} leads</span>
      </div>

      {/* Leads table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading assigned leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No assigned leads found</p>
          <p className="text-sm mt-1">assign from the leads page</p>
        </div>
      ) : (
        <LeadTables leads={leads} onRefresh={fetchLeads} />
      )}
    </div>
  );
}