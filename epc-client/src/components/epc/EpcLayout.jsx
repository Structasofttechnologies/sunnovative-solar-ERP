import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EpcSidebar from './EpcSidebar';
import { useEpcAuth } from '../../context/EpcAuthContext';

const EpcLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode]   = useState(false);
  const { epc } = useEpcAuth();

  const statusBadge = {
    Pending:  { color: 'bg-yellow-50 text-yellow-600 border border-yellow-200', label: 'Pending Approval' },
    Approved: { color: 'bg-blue-50 text-blue-600 border border-blue-200',       label: 'Approved' },
    Verified: { color: 'bg-green-50 text-green-600 border border-green-200',     label: 'Verified' },
  };

  const badge = statusBadge[epc?.onboardingStatus] || statusBadge.Pending;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: darkMode ? '#0f172a' : '#f9fafb' }}
    >
      {/* Sidebar — always dark */}
      <EpcSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Right side */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: darkMode ? '#0f172a' : '#f9fafb' }}
      >
        {/* Top navbar */}
        <header
          className="px-6 py-3 flex items-center justify-between flex-shrink-0"
          style={{
            background:   darkMode ? '#1e293b' : '#ffffff',
            borderBottom: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
          }}
        >
          <div>
            <h1
              className="text-sm font-semibold"
              style={{ color: darkMode ? '#f1f5f9' : '#1f2937' }}
            >
              {epc?.companyName}
            </h1>
            <p
              className="text-xs"
              style={{ color: darkMode ? '#64748b' : '#9ca3af' }}
            >
              {epc?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span
                className="text-xs font-medium"
                style={{ color: darkMode ? '#f1f5f9' : '#374151' }}
              >
                {epc?.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: darkMode ? '#0f172a' : '#f9fafb' }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ darkMode }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EpcLayout;