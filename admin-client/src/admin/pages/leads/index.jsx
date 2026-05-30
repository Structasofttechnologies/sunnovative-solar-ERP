import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import LeadTables from './components/tables/LeadTables.jsx';
import CreateLeadModal from './components/modals/CreateLeadModal.jsx';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const fetchLeads = async (p = 1) => {
    setLoading(true);
    try {
      const data = await leadsApi.getAllLeads({ page: p, limit: 20 });
      setLeads(data.leads || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} leads</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLeads(page)}
            className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading leads...</div>
      ) : (
        <LeadTables leads={leads} onRefresh={() => fetchLeads(page)} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateLeadModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchLeads(page); }}
        />
      )}
    </div>
  );
}