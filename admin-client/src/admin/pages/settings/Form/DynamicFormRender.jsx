/**
 * DynamicFormRenderer
 *
 * Reusable component that fetches form schema by projectSlug
 * and dynamically renders all fields with built-in validation.
 *
 * Usage:
 *   <DynamicFormRenderer slug="surya-ghar-yojana" onSuccess={(data) => ...} />
 */
import { useEffect, useState } from 'react';
import { formBuilderAPI } from '../../../../api/api';
import toast from 'react-hot-toast';
import {
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react';

export default function DynamicFormRenderer({
  slug,
  onSuccess,
  submitLabel = 'Submit',
  className = '',
  hideTitle = false,
}) {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    formBuilderAPI
      .getPublicForm(slug)
      .then((res) => {
        const schema = res.data?.data;
        setFormSchema(schema);
        // Initialize formData with empty values
        const init = {};
        schema?.fields?.forEach((f) => {
          if (f.type === 'checkbox') init[f.fieldName] = [];
          else init[f.fieldName] = '';
        });
        setFormData(init);
      })
      .catch(() => toast.error('Form schema load nahi hua'))
      .finally(() => setLoading(false));
  }, [slug]);

  const validate = () => {
    const errs = {};
    formSchema.fields.forEach((field) => {
      const val = formData[field.fieldName];

      if (field.required) {
        if (field.type === 'checkbox') {
          if (!val || val.length === 0) errs[field.fieldName] = `${field.label} required hai`;
        } else if (!val || val === '') {
          errs[field.fieldName] = `${field.label} required hai`;
        }
      }

      if (val && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errs[field.fieldName] = 'Valid email darj karein';
      }
      if (val && field.type === 'mobile' && !/^\d{10}$/.test(val)) {
        errs[field.fieldName] = '10 digit mobile number darj karein';
      }
      if (val && field.minLength && val.length < field.minLength) {
        errs[field.fieldName] = `Minimum ${field.minLength} characters required`;
      }
      if (val && field.maxLength && val.length > field.maxLength) {
        errs[field.fieldName] = `Maximum ${field.maxLength} characters allowed`;
      }
      if (val && field.type === 'number') {
        const num = Number(val);
        if (field.minValue !== null && field.minValue !== undefined && num < field.minValue)
          errs[field.fieldName] = `Minimum value ${field.minValue} honi chahiye`;
        if (field.maxValue !== null && field.maxValue !== undefined && num > field.maxValue)
          errs[field.fieldName] = `Maximum value ${field.maxValue} honi chahiye`;
      }
    });
    return errs;
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => { const e = { ...prev }; delete e[fieldName]; return e; });
    }
  };

  const handleCheckboxChange = (fieldName, option) => {
    const current = formData[fieldName] || [];
    const updated = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    handleChange(fieldName, updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Kuch fields mein error hai');
      return;
    }
    try {
      setSubmitting(true);
      const res = await formBuilderAPI.submitForm(slug, formData);
      setSubmitted(true);
      toast.success('Form submit ho gaya!');
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length) {
        toast.error(serverErrors[0]);
      } else {
        toast.error(err.response?.data?.message || 'Submit failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading form...
      </div>
    );

  if (!formSchema)
    return (
      <div className="flex items-center gap-2 text-red-500 py-8 justify-center">
        <AlertCircle size={20} />
        Form not found
      </div>
    );

  if (submitted)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={52} className="text-green-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Successfully Submitted!</h3>
        <p className="text-gray-500 mt-1">
          Aapka {formSchema.projectName} form submit ho gaya hai
        </p>
      </div>
    );

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {!hideTitle && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={20} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">{formSchema.projectName}</h2>
          </div>
          {formSchema.description && (
            <p className="text-sm text-gray-500">{formSchema.description}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formSchema.fields.map((field) => (
          <FieldRenderer
            key={field._id || field.fieldName}
            field={field}
            value={formData[field.fieldName]}
            error={errors[field.fieldName]}
            onChange={(val) => handleChange(field.fieldName, val)}
            onCheckboxChange={(opt) => handleCheckboxChange(field.fieldName, opt)}
          />
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 mt-2"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {submitting ? 'Submitting...' : submitLabel}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
// Individual Field Renderer
// ─────────────────────────────────────────────
function FieldRenderer({ field, value, error, onChange, onCheckboxChange }) {
  const baseInput =
    'w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ' +
    (error
      ? 'border-red-400 focus:ring-red-300 bg-red-50'
      : 'border-gray-200 focus:ring-orange-400');

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            className={baseInput}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'mobile':
        return (
          <input
            type="tel"
            className={baseInput}
            placeholder={field.placeholder || '10 digit mobile number'}
            value={value || ''}
            maxLength={10}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className={baseInput}
            placeholder={field.placeholder}
            value={value || ''}
            min={field.minValue ?? undefined}
            max={field.maxValue ?? undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'textarea':
        return (
          <textarea
            className={`${baseInput} resize-none`}
            rows={4}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'dropdown':
        return (
          <select
            className={baseInput}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">-- Select karein --</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2 pt-1">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.fieldName}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2 pt-1">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={opt}
                  checked={(value || []).includes(opt)}
                  onChange={() => onCheckboxChange(opt)}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            className={`${baseInput} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100`}
            accept={(field.acceptedFormats || []).join(',')}
            onChange={(e) => onChange(e.target.files[0]?.name || '')}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className={baseInput}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default:
        return (
          <input
            type="text"
            className={baseInput}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}