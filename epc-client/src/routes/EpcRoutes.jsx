// ─────────────────────────────────────────────────────────────────────────────
// EpcRoutes.jsx
// Apne main App.jsx mein import karke use karo:
//   import EpcRoutes from './routes/EpcRoutes';
//   <Routes>
//     ... existing admin routes ...
//     <Route path="/epc/*" element={<EpcRoutes />} />
//   </Routes>
// ─────────────────────────────────────────────────────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom';
import { EpcAuthProvider } from '../context/EpcAuthContext';
import EpcProtectedRoute   from '../components/epc/EpcProtectedRoute';
import EpcLayout           from '../components/epc/EpcLayout';

import EpcLogin          from '../pages/epc/auth/EpcLogin';
import EpcRegister       from '../pages/epc/auth/EpcRegister';
import EpcDashboard      from '../pages/epc/dashboard/EpcDashboard';
import EpcMyEnquiries    from '../pages/epc/enquiries/EpcMyEnquiries';
import EpcOrders         from '../pages/epc/orders/EpcOrders';
import EpcMyTeam         from '../pages/epc/team/EpcMyTeam';
import EpcAdminSettings  from '../pages/epc/settings/EpcAdminSettings';
import EpcMyPlan         from '../pages/epc/plan/EpcMyPlan';
import EpcOrderDetail from '../pages/epc/orders/EpcOrderDetail';
import EpcProjectManagement from '../pages/epc/projects/EpcProjectManagement';
import EpcProjectDetail from '../pages/epc/projects/EpcProjectDetail';

const EpcRoutes = () => (
  <EpcAuthProvider>
    <Routes>
      {/* Public routes */}
      <Route path="login"    element={<EpcLogin />} />
      <Route path="register" element={<EpcRegister />} />

      {/* Protected routes — inside EpcLayout (sidebar + topbar) */}
      <Route
        element={
          <EpcProtectedRoute>
            <EpcLayout />
          </EpcProtectedRoute>
        }
      >
        <Route index            element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EpcDashboard />} />


        <Route path="enquiries" element={<EpcMyEnquiries />} />


        <Route path="orders"    element={<EpcOrders />} />

   <Route path="orders/:id"       element={<EpcOrderDetail />} />


    {/* Projects */}
        <Route path="projects"         element={<EpcProjectManagement />} />
        <Route path="projects/:id"     element={<EpcProjectDetail />} />

        <Route path="projects"  element={<EpcOrders />} />  {/* Placeholder — EpcProjectManagement alag banegi */}
        <Route path="team"      element={<EpcMyTeam />} />
        <Route path="settings"  element={<EpcAdminSettings />} />
        <Route path="plan"      element={<EpcMyPlan />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  </EpcAuthProvider>
);

export default EpcRoutes;