import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Zap, Calendar, User, UserCheck } from 'lucide-react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import AssignedLeadModal from './components/modals/AssignedLeadModal.jsx';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const PROJECT_LABELS = {
  'surya-ghar': 'Surya Ghar Yojana',
  'group-solar': 'Group Solar',
  'rwa-society': 'RWA Society Solar',
  commercial: 'Commercial SolarKits',
  village: 'Village Campaigns',
  msme: 'MSME Solar',
  general: 'General',
};

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [status, setStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const data = await leadsApi.getLeadById(id);
      setLead(data.lead);
      setStatus(data.lead.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleStatusSave = async () => {
    setSavingStatus(true);
    try {
      await leadsApi.updateLead(id, { status });
      fetchLead();
    } catch (err) {
      alert('Status update failed');
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading lead details...</div>;
  if (!lead) return <div className="p-6 text-red-500">Lead not found</div>;

  return (
    <div className="p-6 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">{lead.name}</h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[lead.status]}`}>
          {lead.status}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {PROJECT_LABELS[lead.project] || lead.project}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 capitalize">
          {lead.source?.replace('_', ' ')}
        </span>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-5 space-y-3 text-sm">
        <InfoRow icon={<Phone size={15} />} label="Phone" value={lead.phone} />
        {lead.email && <InfoRow icon={<Mail size={15} />} label="Email" value={lead.email} />}
        {(lead.city || lead.state) && (
          <InfoRow
            icon={<MapPin size={15} />}
            label="Location"
            value={[lead.city, lead.state, lead.pincode].filter(Boolean).join(', ')}
          />
        )}
        {lead.address && <InfoRow icon={<MapPin size={15} />} label="Address" value={lead.address} />}
        {lead.systemCapacity && (
          <InfoRow icon={<Zap size={15} />} label="Capacity" value={`${lead.systemCapacity} kW`} />
        )}
        <InfoRow
          icon={<Calendar size={15} />}
          label="Created"
          value={new Date(lead.createdAt).toLocaleString('en-IN')}
        />
        <InfoRow
          icon={<User size={15} />}
          label="Created By"
          value={lead.createdBy?.name || 'System'}
        />
        <InfoRow
          icon={<UserCheck size={15} />}
          label="Assigned To"
          value={lead.assignedTo ? (lead.assignedTo.name || 'Assigned') : 'Unassigned'}
        />
        {lead.assignedAt && (
          <InfoRow
            icon={<Calendar size={15} />}
            label="Assigned At"
            value={new Date(lead.assignedAt).toLocaleString('en-IN')}
          />
        )}
        {lead.notes && (
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-gray-700">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Update Status</p>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          <button
            onClick={handleStatusSave}
            disabled={savingStatus || status === lead.status}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {savingStatus ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Assign Button */}
      <button
        onClick={() => setShowAssign(true)}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm hover:bg-gray-700 transition"
      >
        <UserCheck size={15} /> Assign to Team Member
      </button>

      {showAssign && (
        <AssignedLeadModal
          lead={lead}
          onClose={() => setShowAssign(false)}
          onSuccess={() => { setShowAssign(false); fetchLead(); }}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}