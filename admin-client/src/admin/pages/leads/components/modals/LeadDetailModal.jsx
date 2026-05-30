import { X, Phone, Mail, MapPin, Zap, Calendar, User } from 'lucide-react';

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

export default function LeadDetailModal({ lead, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Lead Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Status + Project badges */}
        <div className="flex gap-2 mb-5">
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

        {/* Info Grid */}
        <div className="space-y-3 text-sm">
          <Row icon={<User size={15} />} label="Name" value={lead.name} />
          <Row icon={<Phone size={15} />} label="Phone" value={lead.phone} />
          {lead.email && <Row icon={<Mail size={15} />} label="Email" value={lead.email} />}
          {(lead.city || lead.state) && (
            <Row
              icon={<MapPin size={15} />}
              label="Location"
              value={[lead.city, lead.state, lead.pincode].filter(Boolean).join(', ')}
            />
          )}
          {lead.address && <Row icon={<MapPin size={15} />} label="Address" value={lead.address} />}
          {lead.systemCapacity && (
            <Row icon={<Zap size={15} />} label="System Capacity" value={`${lead.systemCapacity} kW`} />
          )}
          <Row
            icon={<Calendar size={15} />}
            label="Created"
            value={new Date(lead.createdAt).toLocaleString('en-IN')}
          />
          {lead.assignedTo && (
            <Row
              icon={<User size={15} />}
              label="Assigned To"
              value={lead.assignedTo.name || lead.assignedTo}
            />
          )}
          {lead.notes && (
            <div className="bg-gray-50 rounded-xl p-3 mt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <span className="text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}