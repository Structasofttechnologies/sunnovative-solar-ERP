import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import { leadsApi } from '../../../services/leads/leadsApi.js';
import LeadTables from './components/tables/LeadTables.jsx';

const PROJECTS = [
  { value: 'surya-ghar', label: 'Surya Ghar Yojana' },
  { value: 'group-solar', label: 'Group Solar' },
  { value: 'rwa-society', label: 'RWA Society Solar' },
  { value: 'commercial', label: 'Commercial SolarKits' },
  { value: 'village', label: 'Village Campaigns' },
  { value: 'msme', label: 'MSME Solar' },
  { value: 'general', label: 'General' },
];

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [project, setProject] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Uploaded leads table
  const [uploadedLeads, setUploadedLeads] = useState([]);
  const [fetchingLeads, setFetchingLeads] = useState(false);

  const inputRef = useRef();

  const handleFile = (f) => {
    setResult(null);
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      setResult({ success: false, message: 'Only CSV, XLSX, XLS files allowed' });
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // After upload — fetch leads of that project to show in table
  const fetchUploadedLeads = async (projectSlug) => {
    setFetchingLeads(true);
    try {
      const res = await leadsApi.getAllLeads({ project: projectSlug, limit: 100 });
      setUploadedLeads(res.data || []);
    } catch (err) {
      console.error('fetch leads error:', err);
    } finally {
      setFetchingLeads(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setUploadedLeads([]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project', project);
      const res = await leadsApi.uploadLeads(formData);
      setResult({ success: true, message: res.message, total: res.total });
      setFile(null);
      // Fetch leads of selected project to show in table
      await fetchUploadedLeads(project);
    } catch (err) {
      setResult({
        success: false,
        message: err?.response?.data?.message || 'Upload failed',
      });
    } finally {
      setLoading(false);
    }
  };

  // Template download — backend ke actual fields
  // Backend (leadController.js) reads: name, phone/mobile, email, city, state,
  // pincode, address, systemCapacity/kw, billAmount, notes
  const downloadTemplate = () => {
    const headers = [
      'name',
      'phone',
      'email',
      'city',
      'state',
      'pincode',
      'address',
      'systemCapacity',
      'billAmount',
      'notes',
    ].join(',');

    // Sirf ek example row — actual data nahi
    const exampleRow = [
      'Ramesh Kumar',
      '9876543210',
      'ramesh@email.com',
      'Agra',
      'Uttar Pradesh',
      '282001',
      'Near Bus Stand Gandhi Nagar',
      '5',
      '3000',
      'Interested in rooftop solar',
    ].join(',');

    const csv = headers + '\n' + exampleRow + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bulk Upload Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Either upload a CSV or Excel file — all leads will be added at once
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* Project Select */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
        >
          {PROJECTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <Upload size={32} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">Either drop your file or browse your file from your device</p>
        <p className="text-xs text-gray-400 mt-1">CSV, XLSX, XLS — max 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Selected File */}
      {file && (
        <div className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <FileText size={18} className="text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-700 truncate">{file.name}</p>
            <p className="text-xs text-blue-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-blue-400 hover:text-blue-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Result Banner */}
      {result && (
        <div className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 ${
          result.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {result.success
            ? <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-medium ${result.success ? 'text-green-700' : 'text-red-600'}`}>
              {result.message}
            </p>
            {result.total > 0 && (
              <p className="text-xs text-green-600 mt-0.5">
                {result.total} leads are added to the database
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading
          ? <><span className="animate-spin inline-block">⏳</span> Uploading...</>
          : <><Upload size={15} /> Upload Leads</>
        }
      </button>

      {/* ── Uploaded Leads Table ── */}
      {fetchingLeads && (
        <div className="mt-8 text-center text-gray-400 text-sm">Loading uploaded leads...</div>
      )}

      {!fetchingLeads && uploadedLeads.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700">
              Uploaded Leads — {uploadedLeads.length} records
            </h2>
          </div>
          <LeadTables
            leads={uploadedLeads}
            onRefresh={() => fetchUploadedLeads(project)}
          />
        </div>
      )}

      {/* ── CSV Format Guide ── */}
      <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-1">CSV / Excel Format</p>
        <p className="text-xs text-gray-500 mb-3">
          <span className="text-red-500 font-medium">phone</span> — is required , rest are optional
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs text-gray-600 w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {['name','phone *','email','city','state','pincode','address','systemCapacity','billAmount','notes'].map((c) => (
                  <th
                    key={c}
                    className={`px-2 py-1.5 text-left font-semibold border border-gray-300 ${
                      c === 'phone *' ? 'text-red-600' : ''
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-2 py-1 border border-gray-200">Ramesh Kumar</td>
                <td className="px-2 py-1 border border-gray-200 text-red-600 font-medium">9876543210</td>
                <td className="px-2 py-1 border border-gray-200">r@mail.com</td>
                <td className="px-2 py-1 border border-gray-200">Agra</td>
                <td className="px-2 py-1 border border-gray-200">UP</td>
                <td className="px-2 py-1 border border-gray-200">282001</td>
                <td className="px-2 py-1 border border-gray-200">Near Bus Stand</td>
                <td className="px-2 py-1 border border-gray-200">5</td>
                <td className="px-2 py-1 border border-gray-200">3000</td>
                <td className="px-2 py-1 border border-gray-200">Interested</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}