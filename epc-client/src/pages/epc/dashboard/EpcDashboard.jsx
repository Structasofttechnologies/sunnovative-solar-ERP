import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const StatCard = ({ label, value, sub, color, bgColor, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 dark:text-slate-400 text-xs mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color} dark:text-white`}>{value ?? '—'}</p>
        {sub && <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

const EpcDashboard = () => {
  const { epc } = useEpcAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [enquiryCount, setEnquiryCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, enqRes] = await Promise.all([
          epcApi.get('/api/epc/orders/summary'),
          epcApi.get('/api/epc/enquiries'),
        ]);
        setSummary(ordRes.data);
        setEnquiryCount(enqRes.data.filter(e => e.status === 'New').length);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const planColors = {
    Standard:     'text-gray-600 dark:text-slate-300',
    Professional: 'text-blue-600 dark:text-blue-400',
    Enterprise:   'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white text-xl font-bold">
            Welcome, {epc?.companyName} 👋
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            <span className="font-medium text-blue-600 dark:text-blue-400">{epc?.plan} Plan</span>
            {' · '}
            Active Districts:{' '}
            <span className="text-gray-600 dark:text-slate-300">
              {epc?.activeDistricts?.join(', ') || 'Not assigned yet'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-yellow-600 dark:text-yellow-500 text-sm font-semibold">{epc?.rating?.toFixed(1) || '0.0'}</span>
        </div>
      </div>

      {/* Onboarding alert */}
      {epc?.onboardingStatus === 'Approved' && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Your account is approved. Please complete KYC to get fully verified and start accepting orders.
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="New Enquiries"
          value={loading ? '...' : enquiryCount ?? 0}
          sub="Awaiting your response"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/40"
          onClick={() => navigate('/epc/enquiries')}
          icon={<svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
        />
        <StatCard
          label="New Orders"
          value={loading ? '...' : summary?.new ?? 0}
          sub="Pending action"
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/40"
          onClick={() => navigate('/epc/orders?status=New')}
          icon={<svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Ongoing"
          value={loading ? '...' : summary?.ongoing ?? 0}
          sub="In progress"
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/40"
          onClick={() => navigate('/epc/orders?status=Ongoing')}
          icon={<svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Overdue"
          value={loading ? '...' : summary?.overdue ?? 0}
          sub="Past due date"
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/40"
          onClick={() => navigate('/epc/orders?status=Overdue')}
          icon={<svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard
          label="Completed"
          value={loading ? '...' : summary?.completed ?? 0}
          sub="Total completed"
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/40"
          onClick={() => navigate('/epc/orders?status=Completed')}
          icon={<svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
        />
        <StatCard
          label="My Plan"
          value={epc?.plan}
          sub={`${epc?.activeDistricts?.length || 0} active districts`}
          color={planColors[epc?.plan] || 'text-gray-600 dark:text-slate-300'}
          bgColor="bg-gray-100 dark:bg-slate-700"
          onClick={() => navigate('/epc/plan')}
          icon={<svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
        <h3 className="text-gray-700 dark:text-slate-200 text-sm font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'View Enquiries', path: '/epc/enquiries', cls: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/60' },
            { label: 'My Orders',      path: '/epc/orders',    cls: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-900/40 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/60' },
            { label: 'Set Calendar',   path: '/epc/settings',  cls: 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/60' },
            { label: 'Upgrade Plan',   path: '/epc/plan',      cls: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/60' },
          ].map((a) => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className={`border text-xs font-medium rounded-lg py-3 px-4 transition-colors ${a.cls}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EpcDashboard;