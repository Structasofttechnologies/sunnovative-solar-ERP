import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formBuilderAPI } from '../../../../api/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  FileText,
  Search,
  Layers,
} from 'lucide-react';

export default function FormBuilderList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState({ projectName: '', description: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await formBuilderAPI.getAllForms();
      setForms(res.data?.data || []);
    } catch (err) {
      toast.error('Forms load karne mein error aaya');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" form delete karna chahte hain?`)) return;
    try {
      await formBuilderAPI.deleteForm(id);
      toast.success('Form deleted');
      fetchForms();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleActive = async (form) => {
    try {
      await formBuilderAPI.updateForm(form._id, { isActive: !form.isActive });
      toast.success(`Form ${!form.isActive ? 'activated' : 'deactivated'}`);
      fetchForms();
    } catch {
      toast.error('Status update failed');
    }
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    if (!newForm.projectName.trim()) return toast.error('Project name required');
    try {
      setCreating(true);
      const res = await formBuilderAPI.createForm(newForm);
      toast.success('Form created!');
      setShowCreateModal(false);
      setNewForm({ projectName: '', description: '' });
      navigate(`/settings/forms/${res.data.data._id}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const filtered = forms.filter(
    (f) =>
      f.projectName.toLowerCase().includes(search.toLowerCase()) ||
      f.projectSlug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers size={26} className="text-orange-500" />
            Dynamic Form Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Har project ke liye alag form configure karein — bina coding ke
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={18} />
          New Form
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Form ya project name se search karein..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p>Koi form nahi mila</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-semibold">Project Name</th>
                <th className="text-left px-5 py-3 text-gray-600 font-semibold">Slug</th>
                <th className="text-center px-5 py-3 text-gray-600 font-semibold">Fields</th>
                <th className="text-center px-5 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-center px-5 py-3 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((form, idx) => (
                <tr
                  key={form._id}
                  className={`border-b border-gray-50 hover:bg-orange-50/30 transition ${
                    idx % 2 === 0 ? '' : 'bg-gray-50/40'
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-gray-800">{form.projectName}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{form.projectSlug}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                      <Layers size={11} />
                      {form.fieldCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(form)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition ${
                        form.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {form.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {form.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/settings/forms/${form._id}/preview`)}
                        title="Preview form"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/settings/forms/${form._id}/edit`)}
                        title="Edit fields"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(form._id, form.projectName)}
                        title="Delete form"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Naya Form Create Karein</h2>
            <p className="text-sm text-gray-500 mb-4">
              Project name se slug automatically generate hoga
            </p>
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. Surya Ghar Yojana"
                  value={newForm.projectName}
                  onChange={(e) => setNewForm({ ...newForm, projectName: e.target.value })}
                  required
                />
                {newForm.projectName && (
                  <p className="text-xs text-gray-400 mt-1">
                    Slug:{' '}
                    <span className="font-mono text-orange-600">
                      {newForm.projectName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  rows={2}
                  placeholder="Form ki brief description..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create & Add Fields'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}