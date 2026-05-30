import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formBuilderAPI } from '../../../../api/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  ChevronDown,
  X,
  FileText,
  Filter,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-700' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function FormSubmissionsViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const formRes = await formBuilderAPI.getFormById(id);
      const f = formRes.data?.data;
      setFormData(f);

      const subRes = await formBuilderAPI.getSubmissions(f.projectSlug, { limit: 100 });
      setSubmissions(subRes.data?.data || []);
    } catch {
      toast.error('Data load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId, status) => {
    try {
      setUpdatingId(submissionId);
      await formBuilderAPI.updateSubmissionStatus(submissionId, { status });
      toast.success(`Status updated to ${status}`);
      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? { ...s, status } : s))
      );
      if (selectedSub?._id === submissionId) {
        setSelectedSub((prev) => ({ ...prev, status }));
      }
    } catch {
      toast.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (!formData || submissions.length === 0) return;
    const fields = formData.fields.map((f) => f.fieldName);
    const headers = ['Sr.No', ...formData.fields.map((f) => f.label), 'Status', 'Submitted At'];
    const rows = submissions.map((s, i) => [
      i + 1,
      ...fields.map((fn) => {
        const val = s.data?.[fn] ?? s.data?.get?.(fn) ?? '';
        return Array.isArray(val) ? val.join('; ') : val;
      }),
      s.status,
      new Date(s.createdAt).toLocaleString('en-IN'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.projectSlug}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVal = (sub, fieldName) => {
    if (!sub?.data) return '-';
    // data can be a plain object (from API) or Map
    const val = typeof sub.data.get === 'function' ? sub.data.get(fieldName) : sub.data[fieldName];
    if (val === undefined || val === null || val === '') return '-';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  const filtered = submissions.filter((s) => {
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    if (!matchStatus) return false;
    if (!search) return true;
    // Search in all data values
    const dataStr = JSON.stringify(s.data || '').toLowerCase();
    return dataStr.includes(search.toLowerCase());
  });

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = submissions.filter((s) => s.status === k).length;
    return acc;
  }, {});

  if (loading) return <div className="p-10 text-center text-gray-400">Loading submissions...</div>;
  if (!formData) return <div className="p-10 text-center text-red-500">Form not found</div>;

  const formFields = (formData.fields || []).filter((f) => f.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/settings/forms')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{formData.projectName} — Submissions</h1>
          <p className="text-xs text-gray-400">
            Total {submissions.length} submissions • Slug:{' '}
            <span className="font-mono">{formData.projectSlug}</span>
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`p-4 rounded-xl border text-left transition ${
              statusFilter === key
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <p className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${cfg.color}`}>
              {cfg.label}
            </p>
            <p className="text-2xl font-bold text-gray-800">{counts[key] || 0}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Data mein search karein..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="flex items-center gap-1 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <Filter size={13} /> {STATUS_CONFIG[statusFilter]?.label}
            <X size={12} />
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Koi submission nahi mili</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide">#</th>
                {formFields.slice(0, 4).map((f) => (
                  <th key={f._id} className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide">Date</th>
                <th className="text-center px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, idx) => (
                <tr key={sub._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  {formFields.slice(0, 4).map((f) => (
                    <td key={f._id} className="px-4 py-3 text-gray-700 max-w-[160px] truncate">
                      {getVal(sub, f.fieldName)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CONFIG[sub.status]?.color}`}>
                      {STATUS_CONFIG[sub.status]?.label || sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      {sub.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(sub._id, 'approved')}
                          disabled={updatingId === sub._id}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition disabled:opacity-40"
                          title="Approve"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {sub.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(sub._id, 'rejected')}
                          disabled={updatingId === sub._id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition disabled:opacity-40"
                          title="Reject"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Submission Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedSub.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CONFIG[selectedSub.status]?.color}`}>
                  {STATUS_CONFIG[selectedSub.status]?.label}
                </span>
                <button onClick={() => setSelectedSub(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
              {formFields.map((f) => (
                <div key={f._id} className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{f.label}</span>
                  <span className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 min-h-[36px]">
                    {getVal(selectedSub, f.fieldName)}
                  </span>
                </div>
              ))}
            </div>

            {/* Status update */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusUpdate(selectedSub._id, key)}
                    disabled={selectedSub.status === key || updatingId === selectedSub._id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition border ${
                      selectedSub.status === key
                        ? `${cfg.color} border-transparent`
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-60`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}