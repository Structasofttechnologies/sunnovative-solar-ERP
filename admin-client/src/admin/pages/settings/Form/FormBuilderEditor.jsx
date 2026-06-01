import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formBuilderAPI } from '../../../../api/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Settings2,
  Eye,
  Type,
  Hash,
  Mail,
  Phone,
  AlignLeft,
  ChevronDown as DropdownIcon,
  Circle,
  CheckSquare,
  Upload,
  Calendar,
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text',     label: 'Text Input',    icon: Type },
  { value: 'number',   label: 'Number',        icon: Hash },
  { value: 'email',    label: 'Email',         icon: Mail },
  { value: 'mobile',   label: 'Mobile Number', icon: Phone },
  { value: 'textarea', label: 'Textarea',      icon: AlignLeft },
  { value: 'dropdown', label: 'Dropdown',      icon: DropdownIcon },
  { value: 'radio',    label: 'Radio Button',  icon: Circle },
  { value: 'checkbox', label: 'Checkbox',      icon: CheckSquare },
  { value: 'file',     label: 'File Upload',   icon: Upload },
  { value: 'date',     label: 'Date Picker',   icon: Calendar },
];

const EMPTY_FIELD = () => ({
  _tempId: Math.random().toString(36).slice(2),
  label: '',
  fieldName: '',
  fieldType: 'text',
  placeholder: '',
  isRequired: false,
  options: [],
  acceptedFormats: [],
  isActive: true,
});

const toSlug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');

export default function FormBuilderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeFieldIdx, setActiveFieldIdx] = useState(null);
  const [optionInput, setOptionInput] = useState('');

  const fetchForm = useCallback(async () => {
    try {
      const res = await formBuilderAPI.getFormById(id);
      const data = res.data?.data;
      setForm(data);
      const sorted = [...(data.fields || [])].sort((a, b) => a.order - b.order);
      setFields(sorted.map((f) => ({ ...f, _tempId: f._id || Math.random().toString(36).slice(2) })));
    } catch {
      toast.error('error in loading the form data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const addField = () => {
    const f = EMPTY_FIELD();
    setFields((prev) => [...prev, f]);
    setActiveFieldIdx(fields.length);
  };

  const removeField = (idx) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
    setActiveFieldIdx(null);
  };

  const moveField = (idx, dir) => {
    setFields((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
    setActiveFieldIdx(idx + dir);
  };

  const updateField = (idx, updates) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        const updated = { ...f, ...updates };
        // Auto-generate fieldName from label if not manually set
        if (updates.label !== undefined && !f._manualFieldName) {
          updated.fieldName = toSlug(updates.label);
        }
        if (updates.fieldName !== undefined) {
          updated._manualFieldName = true;
        }
        return updated;
      })
    );
  };

  const addOption = (idx) => {
    if (!optionInput.trim()) return;
    updateField(idx, { options: [...(fields[idx].options || []), optionInput.trim()] });
    setOptionInput('');
  };

  const removeOption = (idx, optIdx) => {
    const opts = [...(fields[idx].options || [])];
    opts.splice(optIdx, 1);
    updateField(idx, { options: opts });
  };

  const handleSave = async () => {
    // Validate all fields have labels
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].label.trim()) {
        toast.error(`Field ${i + 1} ka label empty hai`);
        setActiveFieldIdx(i);
        return;
      }
    }

    try {
      setSaving(true);
      const normalized = fields.map((f, idx) => ({
        ...f,
        order: idx,
        fieldName: f.fieldName || toSlug(f.label),
      }));
      await formBuilderAPI.updateFormFields(id, normalized);
      toast.success('Form fields saved!');
      fetchForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const activeField = activeFieldIdx !== null ? fields[activeFieldIdx] : null;
  const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(activeField?.fieldType);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading form...</div>;
  if (!form)   return <div className="p-10 text-center text-red-500">Form not found</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ──── Left Panel: Field List ──── */}
      <div className="flex flex-col w-80 min-w-[300px] border-r border-gray-200 bg-white shadow-sm">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/settings/forms')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 text-sm truncate">{form.projectName}</h2>
            <p className="text-xs text-gray-400 font-mono">{form.projectSlug}</p>
          </div>
          <button
            onClick={() => navigate(`/admin/settings/forms/${id}/preview`)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
            title="Preview"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Fields list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
          {fields.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">
              there is no field added. <br />
              add from below + button.
            </div>
          )}
          {fields.map((field, idx) => {
            const FIcon = FIELD_TYPES.find((t) => t.value === field.fieldType)?.icon || Type;
            const isActive = activeFieldIdx === idx;
            return (
              <div
                key={field._tempId || idx}
                onClick={() => setActiveFieldIdx(idx)}
                className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition border ${
                  isActive
                    ? 'border-orange-400 bg-orange-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                <FIcon size={14} className={`flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {field.label || <span className="text-gray-400 italic">Unlabeled field</span>}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {FIELD_TYPES.find((t) => t.value === field.fieldType)?.label}
                    {field.isRequired && <span className="ml-1 text-red-400">*required</span>}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(idx, -1); }}
                    disabled={idx === 0}
                    className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20"
                  >
                    <ChevronUp size={11} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(idx, 1); }}
                    disabled={idx === fields.length - 1}
                    className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20"
                  >
                    <ChevronDown size={11} />
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeField(idx); }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded transition text-gray-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-2">
          <button
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-xl py-2 text-sm font-medium transition"
          >
            <Plus size={15} />
            Add Field
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-60 transition"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ──── Right Panel: Field Config ──── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeField === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Settings2 size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">select any field</p>
            <p className="text-sm">or add a new field</p>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Settings2 size={16} className="text-orange-500" />
                Field Configuration
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  #{activeFieldIdx + 1}
                </span>
              </h3>

              <div className="space-y-4">
                {/* Field Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Field Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FIELD_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => updateField(activeFieldIdx, { fieldType: value, options: [] })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                          activeField.fieldType === value
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. Full Name"
                    value={activeField.label}
                    onChange={(e) => updateField(activeFieldIdx, { label: e.target.value })}
                  />
                </div>

                {/* Field Name (key) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Field Key (auto-generated)
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="full_name"
                    value={activeField.fieldName}
                    onChange={(e) => updateField(activeFieldIdx, { fieldName: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    this key is used in submitted data and should be unique. It will be auto-generated from label but you can edit it.
                  </p>
                </div>

                {/* Placeholder */}
                {!['checkbox', 'radio', 'file', 'date'].includes(activeField.fieldType) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Placeholder
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="e.g. register your name here "
                      value={activeField.placeholder}
                      onChange={(e) => updateField(activeFieldIdx, { placeholder: e.target.value })}
                    />
                  </div>
                )}

                {/* Required toggle */}
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Required Field</p>
                    <p className="text-xs text-gray-400"> mandatory for user </p>
                  </div>
                  <button
                    onClick={() => updateField(activeFieldIdx, { isRequired: !activeField.isRequired })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      activeField.isRequired ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        activeField.isRequired ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active</p>
                    <p className="text-xs text-gray-400">may senn</p>
                  </div>
                  <button
                    onClick={() => updateField(activeFieldIdx, { isActive: !activeField.isActive })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      activeField.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        activeField.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Options for dropdown/radio/checkbox */}
                {needsOptions && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Options
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {(activeField.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                            {opt}
                          </span>
                          <button
                            onClick={() => removeOption(activeFieldIdx, oi)}
                            className="p-1 text-red-400 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Option add karein..."
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption(activeFieldIdx))}
                      />
                      <button
                        onClick={() => addOption(activeFieldIdx)}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Accepted formats for file */}
                {activeField.fieldType === 'file' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Accepted Formats (comma-separated)
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder=".pdf, .jpg, .png"
                      value={(activeField.acceptedFormats || []).join(', ')}
                      onChange={(e) =>
                        updateField(activeFieldIdx, {
                          acceptedFormats: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </div>
                )}

                {/* Min/Max for number/text */}
                {['number'].includes(activeField.fieldType) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Min Value</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={activeField.minValue ?? ''}
                        onChange={(e) => updateField(activeFieldIdx, { minValue: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Max Value</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={activeField.maxValue ?? ''}
                        onChange={(e) => updateField(activeFieldIdx, { maxValue: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                  </div>
                )}
                {['text', 'textarea'].includes(activeField.fieldType) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Min Length</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={activeField.minLength ?? ''}
                        onChange={(e) => updateField(activeFieldIdx, { minLength: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Max Length</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={activeField.maxLength ?? ''}
                        onChange={(e) => updateField(activeFieldIdx, { maxLength: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delete field button */}
            <button
              onClick={() => removeField(activeFieldIdx)}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-2.5 text-sm font-medium transition"
            >
              <Trash2 size={14} />
              Remove this field
            </button>
          </div>
        )}
      </div>
    </div>
  );
}