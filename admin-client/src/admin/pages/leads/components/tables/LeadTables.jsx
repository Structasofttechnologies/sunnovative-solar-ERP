import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, UserCheck } from 'lucide-react';
import { leadsApi } from '../../../../../services/leads/leadsApi.js';
import AssignedLeadModal from '../modals/AssignedLeadModal.jsx';

const STATUS_OPTIONS = ['New', 'Called', 'Interested', 'Not Interested', 'Follow Up', 'Converted', 'Junk'];

const STATUS_COLORS = {
  'New':            'bg-blue-100 text-blue-700',
  'Called':         'bg-yellow-100 text-yellow-700',
  'Interested':     'bg-green-100 text-green-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'Follow Up':      'bg-purple-100 text-purple-700',
  'Converted':      'bg-emerald-100 text-emerald-700',
  'Junk':           'bg-gray-100 text-gray-500',
};

const PROJECT_LABELS = {
  'surya-ghar':  'Surya Ghar',
  'group-solar': 'Group Solar',
  'rwa-society': 'RWA Society',
  'commercial':  'Commercial',
  'village':     'Village',
  'msme':        'MSME',
  'general':     'General',
};

export default function LeadTables({ leads = [], onRefresh }) {
  const navigate = useNavigate();
  const [assignModal, setAssignModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await leadsApi.updateLead(id, { status: newStatus });
      onRefresh?.();
    } catch {
      alert('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ko delete karna chahte ho?`)) return;
    setDeletingId(id);
    try {
      await leadsApi.deleteLead(id);
      onRefresh?.();
    } catch {
      alert('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No leads found</p>
        <p className="text-sm mt-1">Add a lead from the add lead button</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Capacity (kW)</th>
              <th className="px-4 py-3">Bill Amt</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {leads.map((lead, i) => (
              <tr key={lead._id} className="hover:bg-gray-50 transition">

                <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>

                {/* Name — click pe detail */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate(`/admin/leads/${lead._id}`)}
                    className="font-medium text-blue-600 hover:underline text-left"
                  >
                    {lead.name || '—'}
                  </button>
                </td>

                {/* Mobile — backend field name hai 'mobile' */}
                <td className="px-4 py-3 text-gray-700">{lead.mobile || lead.phone || '—'}</td>

                {/* Project — backend field name hai 'solarType' */}
                <td className="px-4 py-3">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                    {PROJECT_LABELS[lead.solarType] || lead.solarType || '—'}
                  </span>
                </td>

                {/* City — city object ya string */}
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {lead.city?.name || lead.city || '—'}
                </td>

                {/* kW — backend field name hai 'kw' */}
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {lead.kw ? `${lead.kw} kW` : '—'}
                </td>

                {/* Bill Amount */}
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {lead.billAmount ? `₹${lead.billAmount}` : '—'}
                </td>

                {/* Assigned To */}
                <td className="px-4 py-3 text-xs">
                  {lead.assignedTo?.name
                    ? <span className="text-green-600 font-medium">{lead.assignedTo.name}</span>
                    : <span className="text-gray-400">Unassigned</span>
                  }
                </td>

                {/* Status — inline dropdown */}
                <td className="px-4 py-3">
                  <select
                    value={lead.status || 'New'}
                    disabled={updatingId === lead._id}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : '—'}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {/* View */}
                    <button
                      onClick={() => navigate(`/admin/leads/${lead._id}`)}
                      title="Details dekho"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye size={14} />
                    </button>
                    {/* Assign */}
                    <button
                      onClick={() => setAssignModal(lead)}
                      title="Assign karo"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <UserCheck size={14} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(lead._id, lead.name)}
                      disabled={deletingId === lead._id}
                      title="Delete karo"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModal && (
        <AssignedLeadModal
          lead={assignModal}
          onClose={() => setAssignModal(null)}
          onSuccess={() => { setAssignModal(null); onRefresh?.(); }}
        />
      )}
    </>
  );
}