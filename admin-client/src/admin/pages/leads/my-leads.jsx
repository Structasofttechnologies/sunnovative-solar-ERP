import { useEffect, useState } from 'react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import LeadTables from './components/tables/LeadTables.jsx';
import authStore from '../../../store/authStore';

export default function MyLeads() {
  const { user } = authStore();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyLeads = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await leadsApi.getAllLeads({ assignedTo: user._id, limit: 100 });
      setLeads(data.data || []);   // ✅ data.data
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyLeads(); }, [user?._id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">My Leads</h1>
      <p className="text-sm text-gray-500 mb-5">Leads assigned to you — {leads.length} total</p>
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading your leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Koi lead assign nahi hui abhi</p>
          <p className="text-sm mt-1">Admin se kisi lead ko assign karwao</p>
        </div>
      ) : (
        <LeadTables leads={leads} onRefresh={fetchMyLeads} />
      )}
    </div>
  );
}