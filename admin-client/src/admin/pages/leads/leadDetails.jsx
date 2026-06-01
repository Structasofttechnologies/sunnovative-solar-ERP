import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Zap, Calendar, User, UserCheck, IndianRupee } from 'lucide-react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import AssignedLeadModal from './components/modals/AssignedLeadModal.jsx';

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
  'surya-ghar':  'Surya Ghar Yojana',
  'group-solar': 'Group Solar',
  'rwa-society': 'RWA Society Solar',
  'commercial':  'Commercial SolarKits',
  'village':     'Village Campaigns',
  'msme':        'MSME Solar',
  'general':     'General',
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
      const res = await leadsApi.getLeadById(id);
      // Backend returns { success, data: lead }
      const l = res.data || res.lead;
      setLead(l);
      setStatus(l?.status || 'New');
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
    } catch {
      alert('Status update failed');
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading lead details...</div>;
  if (!lead)   return <div className="p-6 text-red-500">Lead not found</div>;

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={15} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">{lead.name}</h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
          {lead.status || 'New'}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {PROJECT_LABELS[lead.solarType] || lead.solarType || 'General'}
        </span>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-5 space-y-3 text-sm">
        <InfoRow icon={<Phone size={15}/>}       label="Mobile"    value={lead.mobile || lead.phone || '—'} />
        {lead.whatsapp && lead.whatsapp !== lead.mobile &&
          <InfoRow icon={<Phone size={15}/>}     label="WhatsApp"  value={lead.whatsapp} />}
        {lead.email &&
          <InfoRow icon={<Mail size={15}/>}      label="Email"     value={lead.email} />}
        {(lead.city || lead.state) &&
          <InfoRow icon={<MapPin size={15}/>}    label="Location"
            value={[lead.city?.name || lead.city, lead.state?.name || lead.state, lead.pincode].filter(Boolean).join(', ')} />}
        {lead.address &&
          <InfoRow icon={<MapPin size={15}/>}    label="Address"   value={lead.address} />}
        {lead.kw &&
          <InfoRow icon={<Zap size={15}/>}       label="Capacity"  value={`${lead.kw} kW`} />}
        {lead.billAmount > 0 &&
          <InfoRow icon={<IndianRupee size={15}/>} label="Bill Amt" value={`₹${lead.billAmount}`} />}
        <InfoRow icon={<Calendar size={15}/>}    label="Created"
          value={new Date(lead.createdAt).toLocaleString('en-IN')} />
        <InfoRow icon={<User size={15}/>}        label="Dealer"
          value={lead.dealer?.name || 'System'} />
        <InfoRow icon={<UserCheck size={15}/>}   label="Assigned"
          value={lead.assignedTo?.name || 'Unassigned'} />
        {lead.notes &&
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-gray-700">{lead.notes}</p>
          </div>
        }
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3"> Update status </p>
        <div className="flex gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleStatusSave}
            disabled={savingStatus || status === lead.status}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition">
            {savingStatus ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Assign */}
      <button onClick={() => setShowAssign(true)}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm hover:bg-gray-700 transition">
        <UserCheck size={15}/> Assign to Team Member
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