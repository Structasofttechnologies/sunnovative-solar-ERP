import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EpcSidebar from './EpcSidebar';
import { useEpcAuth } from '../../context/EpcAuthContext';

const EpcLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { epc } = useEpcAuth();

  const statusBadge = {
    Pending:  { color: 'bg-yellow-50 text-yellow-600 border border-yellow-200', label: 'Pending Approval' },
    Approved: { color: 'bg-blue-50 text-blue-600 border border-blue-200',       label: 'Approved' },
    Verified: { color: 'bg-green-50 text-green-600 border border-green-200',     label: 'Verified' },
  };

  const badge = statusBadge[epc?.onboardingStatus] || statusBadge.Pending;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar stays dark */}
      <EpcSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - white with light border */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-gray-800 text-sm font-semibold">{epc?.companyName}</h1>
            <p className="text-gray-400 text-xs">{epc?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <div className="flex items-center gap-1.5 text-yellow-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-xs font-medium text-gray-700">{epc?.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </header>

        {/* Page content - light background */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EpcLayout;