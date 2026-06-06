import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EpcSidebar from './EpcSidebar';
import { useEpcAuth } from '../../context/EpcAuthContext';

const EpcLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { epc } = useEpcAuth();

  const statusBadge = {
    Pending:  { color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', label: 'Pending Approval' },
    Approved: { color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',   label: 'Approved' },
    Verified: { color: 'bg-green-500/10 text-green-400 border border-green-500/20', label: 'Verified' },
  };

  const badge = statusBadge[epc?.onboardingStatus] || statusBadge.Pending;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <EpcSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-white text-sm font-medium">{epc?.companyName}</h1>
            <p className="text-gray-500 text-xs">{epc?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <div className="flex items-center gap-1.5 text-yellow-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-xs font-medium">{epc?.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EpcLayout;