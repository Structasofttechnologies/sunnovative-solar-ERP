import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formBuilderAPI } from '../../../../api/api';
import DynamicFormRenderer from './DynamicFormRender';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Eye, Monitor, Smartphone } from 'lucide-react';

export default function FormBuilderPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slug, setSlug] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [view, setView] = useState('desktop'); // desktop | mobile

  useEffect(() => {
    formBuilderAPI
      .getFormById(id)
      .then((res) => {
        setSlug(res.data?.data?.projectSlug);
        setProjectName(res.data?.data?.projectName);
      })
      .catch(() => toast.error('Form load nahi hua'));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(`/settings/forms/${id}/edit`)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 text-sm">Preview: {projectName}</h2>
          <p className="text-xs text-gray-400">Yahan form exactly waise dikhega jaise users ko dikhega</p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              view === 'desktop' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Monitor size={13} /> Desktop
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              view === 'mobile' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone size={13} /> Mobile
          </button>
        </div>

        <button
          onClick={() => navigate(`/settings/forms/${id}/edit`)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Edit2 size={14} /> Edit Fields
        </button>
      </div>

      {/* Preview area */}
      <div className="p-8 flex justify-center">
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
            view === 'mobile' ? 'w-[390px]' : 'w-full max-w-2xl'
          }`}
        >
          {/* Mock browser bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 font-mono truncate">
              /apply/{slug || '...'}
            </div>
          </div>

          {/* Actual form */}
          <div className="p-6">
            {slug ? (
              <DynamicFormRenderer
                slug={slug}
                submitLabel="Submit Application"
                onSuccess={() =>
                  toast.success('Preview: Form submit simulate kiya gaya!')
                }
              />
            ) : (
              <div className="text-center text-gray-400 py-10">Loading preview...</div>
            )}
          </div>
        </div>
      </div>

      {/* API info box */}
      {slug && (
        <div className="max-w-2xl mx-auto pb-8 px-4">
          <div className="bg-gray-800 rounded-xl p-4 text-xs font-mono">
            <p className="text-gray-400 mb-2 font-sans font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Eye size={11} /> Public API Endpoint
            </p>
            <p className="text-green-400">GET /api/forms/public/<span className="text-yellow-300">{slug}</span></p>
            <p className="text-gray-500 mt-1">POST /api/forms/public/<span className="text-yellow-300">{slug}</span>/submit</p>
          </div>
        </div>
      )}
    </div>
  );
}