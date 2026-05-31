import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import LeadTables from './components/tables/LeadTables.jsx';

const PROJECT_META = {
  'surya-ghar':  { label: 'Surya Ghar Yojana',   description: 'PM Surya Ghar Muft Bijli Yojana — Residential rooftop solar leads', color: 'bg-orange-50 border-orange-200 text-orange-700', emoji: '☀️' },
  'group-solar': { label: 'Group Solar',           description: 'Bulk solar installations for groups and communities',                color: 'bg-blue-50 border-blue-200 text-blue-700',   emoji: '👥' },
  'rwa-society': { label: 'RWA Society Solar',     description: 'Solar for Resident Welfare Associations and housing societies',     color: 'bg-green-50 border-green-200 text-green-700', emoji: '🏢' },
  commercial:    { label: 'Commercial SolarKits',  description: 'Commercial and industrial solar kit installations',                  color: 'bg-purple-50 border-purple-200 text-purple-700', emoji: '🏭' },
  village:       { label: 'Village Campaigns',     description: 'Solar awareness and installation drives in villages',               color: 'bg-yellow-50 border-yellow-200 text-yellow-700', emoji: '🌾' },
  msme:          { label: 'MSME Solar',            description: 'Solar solutions for Micro, Small & Medium Enterprises',             color: 'bg-indigo-50 border-indigo-200 text-indigo-700', emoji: '🏪' },
};

export default function ProjectWise() {
  // ✅ FIX: App.jsx mein :type hai isliye type le rahe hain, slug nahi
  const { type: slug } = useParams();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const meta = PROJECT_META[slug] || {
    label: slug, description: 'Project leads',
    color: 'bg-gray-50 border-gray-200 text-gray-700', emoji: '📋',
  };

  const fetchLeads = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await leadsApi.getLeadsByProject(slug, { limit: 200 });
      const allLeads = res.data || [];
      // Frontend pe bhi filter — sirf is slug ke leads
      const filtered = allLeads.filter(l => l.solarType === slug);
      setLeads(filtered);
      setTotal(filtered.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [slug]);

  return (
    <div className="p-6">
      <div className={`rounded-2xl border p-5 mb-6 ${meta.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <h1 className="text-xl font-bold">{meta.label}</h1>
              <p className="text-sm opacity-80 mt-0.5">{meta.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-xs opacity-70">Total Leads</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={fetchLeads}
          className="flex items-center gap-1 text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl">{meta.emoji}</span>
          <p className="text-lg font-medium mt-3">{meta.label} ke liye koi lead nahi mili</p>
          <p className="text-sm mt-1">Add Lead mein <strong>"{meta.label}"</strong> select karke lead add karo</p>
        </div>
      ) : (
        <LeadTables leads={leads} onRefresh={fetchLeads} />
      )}
    </div>
  );
}