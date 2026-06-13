import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';
// 🔥 TOAST IMPORT KIYA
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Master 9-Step Flow Synced with Schema and Controller
const stageSteps = [
  'Registration Started',
  'Material Delivered',
  'Installation In Progress',
  'Installation Completed',
  'QC Verification',
  '90% Payment Released',
  'Customer Approval',
  '10% Payment Released',
  'Project Closed',
];

const stageColors = {
  'Registration Started':     'bg-blue-50 text-blue-600 border-blue-200',
  'Material Delivered':       'bg-amber-50 text-amber-600 border-amber-200',
  'Installation In Progress': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Installation Completed':   'bg-indigo-50 text-indigo-600 border-indigo-200',
  'QC Verification':          'bg-purple-50 text-purple-600 border-purple-200',
  '90% Payment Released':     'bg-teal-50 text-teal-600 border-teal-200',
  'Customer Approval':        'bg-pink-50 text-pink-600 border-pink-200',
  '10% Payment Released':     'bg-orange-50 text-orange-600 border-orange-200',
  'Project Closed':           'bg-green-50 text-green-600 border-green-200',
};

const EpcProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await epcApi.get(`/api/epc/projects/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Project detail fetch error:', error);
      toast.error('Project details fetch karne me dikkat aayi!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const advanceStage = async () => {
    const idx = stageSteps.indexOf(order.stage);
    if (idx === -1 || idx >= stageSteps.length - 1) return;
    const nextStage = stageSteps[idx + 1];
    if (!window.confirm(`Move project to "${nextStage}"?`)) return;
    setStageLoading(true);
    try {
      await epcApi.put(`/api/epc/projects/${id}/stage`, { stage: nextStage });
      // 🔥 STAGE CHANGE TOAST POPUP
      toast.success(`🎉 Status successfully moved to: ${nextStage}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setStageLoading(false);
    }
  };

  const handleFileUpload = async (type, files) => {
    if (!files || files.length === 0) return;

    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedDocTypes   = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedPcrTypes   = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 🔥 EARLY ERRORS TOAST POPUPS
      if (file.size > MAX_SIZE) {
        toast.error(`⚠️ File "${file.name}" limit se bahar hai. Max size 25MB hai!`);
        return; 
      }

      if (type === 'install' && !allowedImageTypes.includes(file.type)) {
        toast.error('❌ Photos section me sirf Images (.jpg, .png) allowed hain.');
        return;
      }

      if (type === 'docs' && !allowedDocTypes.includes(file.type)) {
        toast.error('❌ Docs section me sirf PDFs ya Images bhein.');
        return;
      }

      if (type === 'netmetering' && !allowedDocTypes.includes(file.type)) {
        toast.error('❌ Net metering file ke liye PDF ya Image upload karein.');
        return;
      }

      if (type === 'pcr' && !allowedPcrTypes.includes(file.type)) {
        toast.error('❌ PCR report me sirf PDF ya Word File (.doc, .docx) chalegi.');
        return;
      }
    }

    setUploadLoading(type);
    try {
      const formData = new FormData();
      
      if (type === 'docs') {
        Array.from(files).forEach(f => formData.append('files', f));
      } else if (type === 'install') {
        Array.from(files).forEach(f => formData.append('photos', f));
      } else if (type === 'netmetering') {
        formData.append('netMetering', files[0]);
      } else if (type === 'pcr') {
        formData.append('pcrReport', files[0]);
      }

      const endpoint = type === 'docs' ? `/api/epc/projects/${id}/upload-docs`
                     : (type === 'install' || type === 'netmetering') ? `/api/epc/projects/${id}/upload-installation`
                     : `/api/epc/projects/${id}/upload-pcr`;

      await epcApi.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // 🔥 SUCCESS TOAST POPUP
      toast.success('🚀 File uploaded successfully!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server Upload failed');
    } finally {
      setUploadLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Project not found</p>
        <button onClick={() => navigate('/epc/projects')}
          className="mt-3 text-blue-600 text-sm hover:underline">← Back to Projects</button>
      </div>
    );
  }

  const currentStageIdx = stageSteps.indexOf(order.stage);
  const progress = currentStageIdx === -1 ? 0 : Math.round((currentStageIdx / (stageSteps.length - 1)) * 100);

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* 🔥 GLOBAL TOAST CONTAINER (Isi ki wajah se alert pops dikhenge screen par) */}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} theme="colored" />

      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/epc/projects')}
          className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-gray-800 text-xl font-bold">Project Detail</h2>
          <p className="text-gray-400 text-xs font-mono">#{order.orderNumber}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded border font-medium ${stageColors[order.stage] || ''}`}>
            {order.stage}
          </span>
          {order.isOverdue && (
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded font-medium">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-700 text-sm font-semibold">Installation Progress</h3>
          <span className="text-blue-600 text-sm font-bold">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {stageSteps.map((stage, i) => (
            <div key={stage} className="text-center flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs font-bold border-2 ${
                i < currentStageIdx  ? 'bg-blue-500 border-blue-500 text-white' :
                i === currentStageIdx ? 'bg-blue-50 border-blue-500 text-blue-600' :
                'bg-white border-gray-200 text-gray-400'
              }`}>
                {i < currentStageIdx ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <p className={`text-[10px] tracking-tight leading-tight transition-colors hidden sm:block ${
                i === currentStageIdx ? 'text-blue-600 font-semibold' :
                i < currentStageIdx  ? 'text-gray-500' : 'text-gray-300'
              }`}>{stage}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 font-medium mt-2 sm:hidden text-center">
          Current State: <span className="text-blue-600 font-bold">{order.stage}</span>
        </p>

        {order.stage !== 'Project Closed' ? (
          <button onClick={advanceStage} disabled={stageLoading || currentStageIdx === -1}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            {stageLoading ? 'Updating...' : `→ Mark as: ${stageSteps[currentStageIdx + 1] || 'Next Step'}`}
          </button>
        ) : (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
            <p className="text-green-700 text-sm font-medium">✅ Project Closed & Completed!</p>
          </div>
        )}
      </div>

      {/* Customer + Project Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Details
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs">Name</p>
              <p className="text-gray-800 text-sm font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Mobile</p>
              <p className="text-gray-800 text-sm">{order.customerMobile}</p>
            </div>
            {order.customerEmail && (
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-gray-800 text-sm">{order.customerEmail}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-xs">Location</p>
              <p className="text-gray-800 text-sm">{order.district}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''}</p>
            </div>
            {order.address && (
              <div>
                <p className="text-gray-400 text-xs">Address</p>
                <p className="text-gray-800 text-sm">{order.address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
            Project Details
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs">Project Type</p>
              <p className="text-gray-800 text-sm font-medium">{order.projectType}</p>
            </div>
            {order.systemCapacityKw && (
              <div>
                <p className="text-gray-400 text-xs">System Capacity</p>
                <p className="text-gray-800 text-sm">{order.systemCapacityKw} kW</p>
              </div>
            )}
            {order.scheduledInstallDate && (
              <div>
                <p className="text-gray-400 text-xs">Scheduled Date</p>
                <p className="text-gray-800 text-sm">{new Date(order.scheduledInstallDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            )}
            {order.dueDateForCompletion && (
              <div>
                <p className="text-gray-400 text-xs">Due Date</p>
                <p className={`text-sm font-medium ${order.isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                  {new Date(order.dueDateForCompletion).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
            {order.installCompletedAt && (
              <div>
                <p className="text-gray-400 text-xs">Completed On</p>
                <p className="text-green-600 text-sm font-medium">{new Date(order.installCompletedAt).toLocaleDateString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Payment Details
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Total Value</p>
            <p className="text-gray-800 text-lg font-bold">₹{order.totalProjectValue?.toLocaleString('en-IN') || 0}</p>
          </div>
          <div className={`rounded-lg p-3 text-center border ${order.payment90?.status === 'Released' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
            <p className="text-gray-400 text-xs mb-1">90% Payment</p>
            <p className="text-gray-800 text-sm font-bold">₹{order.payment90?.amount?.toLocaleString('en-IN') || 0}</p>
            <span className={`text-xs font-medium ${order.payment90?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.payment90?.status || 'Pending'}
            </span>
          </div>
          <div className={`rounded-lg p-3 text-center border ${order.payment10?.status === 'Released' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
            <p className="text-gray-400 text-xs mb-1">10% Escrow</p>
            <p className="text-gray-800 text-sm font-bold">₹{order.payment10?.amount?.toLocaleString('en-IN') || 0}</p>
            <span className={`text-xs font-medium ${order.payment10?.status === 'Released' ? 'text-green-600' : 'text-orange-600'}`}>
              {order.payment10?.status || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Documents Upload Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents & Media Uploads
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          
          {/* 1. MNRE / Registration Docs */}
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <p className="text-gray-700 text-xs font-semibold mb-1">MNRE / Registration Docs</p>
              <p className="text-gray-400 text-xs mb-3">Upload deployment letters</p>
              {order.registrationDocs?.length > 0 ? (
                <div className="space-y-1 mb-3">
                  {order.registrationDocs.map((doc, i) => (
                    <a key={i} href={getFileUrl(doc.fileUrl)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 text-xs hover:underline truncate">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {doc.docName || `Document ${i + 1}`}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-xs mb-3">No docs uploaded</p>
              )}
            </div>
            <label className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border cursor-pointer transition-colors ${
              uploadLoading === 'docs' ? 'opacity-50 cursor-not-allowed' : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}>
              {uploadLoading === 'docs' ? 'Uploading...' : '+ Upload Docs'}
              <input type="file" multiple className="hidden"
                onChange={e => handleFileUpload('docs', e.target.files)}
                disabled={uploadLoading !== ''} />
            </label>
          </div>

          {/* 2. Installation Photos & Net Metering Split */}
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <p className="text-gray-700 text-xs font-semibold mb-1">Site Media & Metering</p>
              <p className="text-gray-400 text-xs mb-3">Upload structural images</p>
              
              <div className="space-y-1.5 mb-3">
                {order.installationPhotos?.length > 0 ? (
                  <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                    ✓ {order.installationPhotos.length} Site photo(s) saved
                  </p>
                ) : (
                  <p className="text-gray-300 text-xs">No photos uploaded</p>
                )}

                {order.netMeteringDoc ? (
                  <a href={getFileUrl(order.netMeteringDoc)} target="_blank" rel="noreferrer"
                    className="text-green-600 text-xs hover:underline flex items-center gap-1 font-medium">
                    ✓ Net Metering Doc Uploaded
                  </a>
                ) : (
                  <p className="text-gray-300 text-xs">No Net Metering doc</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                uploadLoading === 'install' ? 'opacity-50 cursor-not-allowed' : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
              }`}>
                {uploadLoading === 'install' ? 'Uploading...' : '+ Photos'}
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={e => handleFileUpload('install', e.target.files)}
                  disabled={uploadLoading !== ''} />
              </label>

              <label className={`flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                uploadLoading === 'netmetering' ? 'opacity-50 cursor-not-allowed' : 'border-teal-200 text-teal-600 bg-teal-50 hover:bg-teal-100'
              }`}>
                {uploadLoading === 'netmetering' ? 'Uploading...' : '+ Metering Doc'}
                <input type="file" accept="application/pdf,image/*" className="hidden"
                  onChange={e => handleFileUpload('netmetering', e.target.files)}
                  disabled={uploadLoading !== ''} />
              </label>
            </div>
          </div>

          {/* 3. PCR Report */}
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <p className="text-gray-700 text-xs font-semibold mb-1">PCR Report</p>
              <p className="text-gray-400 text-xs mb-3">Audit Completion Assessment</p>
              {order.pcrReport ? (
                <div className="mb-3">
                  <a href={getFileUrl(order.pcrReport)} target="_blank" rel="noreferrer"
                    className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    View PCR Report
                  </a>
                  {order.pcrUploadedAt && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      Uploaded: {new Date(order.pcrUploadedAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-300 text-xs mb-3">No PCR uploaded</p>
              )}
            </div>
            <label className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border cursor-pointer transition-colors ${
              uploadLoading === 'pcr' ? 'opacity-50 cursor-not-allowed' : 'border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100'
            }`}>
              {uploadLoading === 'pcr' ? 'Uploading...' : '+ Upload PCR'}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => handleFileUpload('pcr', e.target.files)}
                disabled={uploadLoading !== ''} />
            </label>
          </div>

        </div>
      </div>

      {/* Customer Rating */}
      {order.customerRating && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3">Customer Rating</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-5 h-5 ${s <= order.customerRating ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="text-gray-800 font-bold text-lg">{order.customerRating}/5</span>
            {order.ratedAt && (
              <span className="text-gray-400 text-xs">on {new Date(order.ratedAt).toLocaleDateString('en-IN')}</span>
            )}
          </div>
          {order.customerFeedback && (
            <p className="text-gray-600 text-sm mt-2 bg-gray-50 rounded-lg p-3 italic">
              "{order.customerFeedback}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EpcProjectDetail;