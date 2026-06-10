import { Routes, Route, Navigate } from 'react-router-dom';
import { EpcAuthProvider }    from '../context/EpcAuthContext';
import EpcProtectedRoute      from '../components/epc/EpcProtectedRoute';
import EpcLayout              from '../components/epc/EpcLayout';

import EpcLogin             from '../pages/epc/auth/EpcLogin';
import EpcRegister          from '../pages/epc/auth/EpcRegister';
import EpcDashboard         from '../pages/epc/dashboard/EpcDashboard';
import EpcMyEnquiries       from '../pages/epc/enquiries/EpcMyEnquiries';
import EpcOrders            from '../pages/epc/orders/EpcOrders';
import EpcOrderDetail       from '../pages/epc/orders/EpcOrderDetail';
import EpcProjectManagement from '../pages/epc/projects/EpcProjectManagement';
import EpcProjectDetail     from '../pages/epc/projects/EpcProjectDetail';
import EpcMyTeam            from '../pages/epc/team/EpcMyTeam';
import EpcAdminSettings     from '../pages/epc/settings/EpcAdminSettings';
import EpcMyPlan            from '../pages/epc/plan/EpcMyPlan';
import EpcMyProfile         from '../pages/epc/profile/EpcMyProfile';

const EpcRoutes = () => (
  <EpcAuthProvider>
    <Routes>
      {/* Public */}
      <Route path="login"    element={<EpcLogin />} />
      <Route path="register" element={<EpcRegister />} />

      {/* Protected — EpcLayout ke andar (sidebar + topbar) */}
      <Route
        element={
          <EpcProtectedRoute>
            <EpcLayout />
          </EpcProtectedRoute>
        }
      >
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<EpcDashboard />} />
        <Route path="enquiries"     element={<EpcMyEnquiries />} />
        <Route path="orders"        element={<EpcOrders />} />
        <Route path="orders/:id"    element={<EpcOrderDetail />} />
        <Route path="projects"      element={<EpcProjectManagement />} />
        <Route path="projects/:id"  element={<EpcProjectDetail />} />
        <Route path="team"          element={<EpcMyTeam />} />
        <Route path="settings"      element={<EpcAdminSettings />} />
        <Route path="plan"          element={<EpcMyPlan />} />
        <Route path="profile"       element={<EpcMyProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  </EpcAuthProvider>
);

export default EpcRoutes;