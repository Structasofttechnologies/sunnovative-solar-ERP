import { useState } from 'react';
import { leadsApi } from '../../../../../services/leads/leadsApi';
import { X, UserCheck } from 'lucide-react';

export default function AssignedLeadModal({ lead, onClose, onSuccess }) {
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!assignedTo.trim()) {
      setError('Please enter a User ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await leadsApi.assignLead(lead._id, assignedTo.trim());
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Assign Lead</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Lead Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Name:</span> {lead.name}</p>
          <p><span className="font-medium text-gray-700">Phone:</span> {lead.phone}</p>
          <p><span className="font-medium text-gray-700">Project:</span> {lead.project}</p>
          {lead.assignedTo && (
            <p className="text-yellow-600 mt-1">
              ⚠️ Already assigned to {lead.assignedTo.name || lead.assignedTo}
            </p>
          )}
        </div>

        {/* Input */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User ID to Assign
        </label>
        <input
          type="text"
          placeholder="Paste User ID here..."
          value={assignedTo}
          onChange={(e) => { setAssignedTo(e.target.value); setError(''); }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-1"
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Assigning...' : 'Assign Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}