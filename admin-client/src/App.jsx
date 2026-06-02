'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api/api';
import authStore from './store/authStore';

// ─── Only NON-LAZY imports (layouts + critical path) ───────────────────────
import GlobalLoader from './components/GlobalLoader';

// ─── Lazy: Auth Pages ───────────────────────────────────────────────────────
const Login         = lazy(() => import('./pages/Login'));
const EmployeeLogin = lazy(() => import('./employee/pages/EmployeeLogin'));
const CandidateLogin = lazy(() => import('./candidate/pages/Login'));

// ─── Lazy: Layouts ──────────────────────────────────────────────────────────
const AdminLayout            = lazy(() => import('./admin/layouts/AdminLayout'));
const DealerLayout           = lazy(() => import('./dealer/layouts/DealerLayout'));
const FranchiseeLayout       = lazy(() => import('./franchisee/layouts/FranchiseeLayout'));
const DealerManagerLayout    = lazy(() => import('./dealerManager/layouts/DealerManagerLayout'));
const FranchiseeManagerLayout = lazy(() => import('./franchiseeManager/layouts/FranchiseeManagerLayout'));
const CandidateLayout        = lazy(() => import('./candidate/layouts/CandidateLayout'));

// ─── Lazy: Admin Dashboards ─────────────────────────────────────────────────
const AdminInventoryDashboard        = lazy(() => import('./admin/pages/dashboard/InventoryDashboard'));
const AdminDeliveryDashboard         = lazy(() => import('./admin/pages/dashboard/DeliveryDashboard'));
const AdminInstallerDashboard        = lazy(() => import('./admin/pages/dashboard/InstallerDashboard'));
const FranchiseManagerDashboard      = lazy(() => import('./admin/pages/dashboard/userPerformance/FranchiseManagerDashboard'));
const FranchisePerformanceDashboard  = lazy(() => import('./admin/pages/dashboard/userPerformance/FranchiseDashboard'));
const DealerManagerPerformanceDashboard = lazy(() => import('./admin/pages/dashboard/userPerformance/DealerManagerDashboard'));
const DealerPerformanceDashboard     = lazy(() => import('./admin/pages/dashboard/userPerformance/DealerDashboard'));
const AdminOrdersDashboard           = lazy(() => import('./admin/pages/dashboard/OrdersDashboard'));
const AdminOrdersByLoanDashboard     = lazy(() => import('./admin/pages/dashboard/OrdersByLoanDashboard'));
const AdminVendorsDashboard          = lazy(() => import('./admin/pages/dashboard/VendorsDashboard'));
const AdminProjectReport             = lazy(() => import('./admin/pages/dashboard/ProjectReport'));

// ─── Lazy: Admin Pages ──────────────────────────────────────────────────────
const AdminDepartments         = lazy(() => import('./admin/pages/departments/Departments'));
const AdminOrganizationChart   = lazy(() => import('./admin/pages/departments/OrganizationChart'));
const AdminApprovals           = lazy(() => import('./admin/pages/approvals/Approvals'));
const ManagementProjects       = lazy(() => import('./admin/pages/project-management/management/Management'));
const InstallProjects          = lazy(() => import('./admin/pages/project-management/install/Install'));
const ServiceProjects          = lazy(() => import('./admin/pages/project-management/service/Service'));
const TrackServiceProjects     = lazy(() => import('./admin/pages/project-management/track-service/TrackService'));
const AdminResidentialProject  = lazy(() => import('./admin/pages/project-management/residential/AdminResidentialProject'));
const AdminCommercialProject   = lazy(() => import('./admin/pages/project-management/commercial/AdminCommercialProject'));
const AdminWarehouse           = lazy(() => import('./admin/pages/operations/Warehouse'));
const AdminAddInventory        = lazy(() => import('./admin/pages/operations/AddInventory'));
const AdminInventoryManagement = lazy(() => import('./admin/pages/operations/InventoryManagement'));

// ─── Lazy: Admin Leads ──────────────────────────────────────────────────────
const LeadsPage     = lazy(() => import('./admin/pages/leads'));
const AnalyticsPage = lazy(() => import('./admin/pages/leads/analytics'));
const UploadPage    = lazy(() => import('./admin/pages/leads/upload'));
const ProjectWise   = lazy(() => import('./admin/pages/leads/ProjectWise'));
const LeadDetails   = lazy(() => import('./admin/pages/leads/leadDetails'));
const MyLeads       = lazy(() => import('./admin/pages/leads/my-leads'));
const AssignedLeads = lazy(() => import('./admin/pages/leads/AssignedLead'));

// ─── Lazy: Admin Settings ───────────────────────────────────────────────────
const SetupLocations            = lazy(() => import('./admin/pages/settings/location/SetupLocations'));
const ApprovalOverdueSetting    = lazy(() => import('./admin/pages/settings/ApprovalOverdueSetting'));
const OverdueTaskSetting        = lazy(() => import('./admin/pages/settings/OverdueTaskSetting'));
const OverdueStatusSetting      = lazy(() => import('./admin/pages/settings/OverdueStatusSetting'));
const LoanSetting               = lazy(() => import('./admin/pages/settings/LoanSetting'));
const ChecklistSetting          = lazy(() => import('./admin/pages/settings/ChecklistSetting'));
const FormBuilderList           = lazy(() => import('./admin/pages/settings/Form/FormBuilderList'));
const FormBuilderEditor         = lazy(() => import('./admin/pages/settings/Form/FormBuilderEditor'));
const FormBuilderPreview        = lazy(() => import('./admin/pages/settings/Form/FormBuilderPreview'));
const FormSubmissionsViewer     = lazy(() => import('./admin/pages/settings/Form/FormSubmissionsViewer'));
const RoleSettings              = lazy(() => import('./admin/pages/settings/hr/RoleSettings'));
const CreateDepartment          = lazy(() => import('./admin/pages/settings/hr/CreateDepartment'));
const ManageEmployees           = lazy(() => import('./admin/pages/settings/hr/ManageEmployees'));
const ManageModules             = lazy(() => import('./admin/pages/settings/hr/ManageModules'));
const DepartmentWiseModules     = lazy(() => import('./admin/pages/settings/hr/DepartmentWiseModules'));
const TemporaryInchargeSetting  = lazy(() => import('./admin/pages/settings/hr/TemporaryInchargeSetting'));
const LeaveApprovals            = lazy(() => import('./admin/pages/settings/hr/LeaveApprovals'));
const ResignApprovals           = lazy(() => import('./admin/pages/settings/hr/ResignApprovals'));
const InstallerVendors          = lazy(() => import('./admin/pages/settings/vendor/InstallerVendors'));
const SupplierType              = lazy(() => import('./admin/pages/settings/vendor/SupplierType'));
const SupplierVendors           = lazy(() => import('./admin/pages/settings/vendor/SupplierVendors'));
const SetPrice                  = lazy(() => import('./admin/pages/settings/sales/SetPrice'));
const SetPriceAmc               = lazy(() => import('./admin/pages/settings/sales/SetPriceAmc'));
const Offers                    = lazy(() => import('./admin/pages/settings/sales/Offers'));
const SolarPanelBundleSetting   = lazy(() => import('./admin/pages/settings/sales/SolarPanelBundleSetting'));
const CampaignManagement        = lazy(() => import('./admin/pages/settings/marketing/CampaignManagement'));
const DeliveryType              = lazy(() => import('./admin/pages/settings/delivery/DeliveryType'));
const VehicleSelection          = lazy(() => import('./admin/pages/settings/delivery/VehicleSelection'));
const VendorDeliveryPlan        = lazy(() => import('./admin/pages/settings/delivery/VendorDeliveryPlan'));
const SolarInstaller            = lazy(() => import('./admin/pages/settings/installer/SolarInstaller'));
const ToolRequirements          = lazy(() => import('./admin/pages/settings/installer/ToolRequirements'));
const RatingSetting             = lazy(() => import('./admin/pages/settings/installer/RatingSetting'));
const Agency                    = lazy(() => import('./admin/pages/settings/installer/Agency'));
const AgencyPlan                = lazy(() => import('./admin/pages/settings/installer/AgencyPlan'));
const InventoryOverview         = lazy(() => import('./admin/pages/settings/inventory/InventoryOverview'));
const RestockOrderLimit         = lazy(() => import('./admin/pages/settings/inventory/RestockOrderLimit'));
const CombokitBrandOverview     = lazy(() => import('./admin/pages/settings/inventory/CombokitBrandOverview'));
const AddProjectType            = lazy(() => import('./admin/pages/settings/product/AddProjectType'));
const AddProjectCategory        = lazy(() => import('./admin/pages/settings/product/AddProjectCategory'));
const AddProduct                = lazy(() => import('./admin/pages/settings/product/AddProduct'));
const Sku                       = lazy(() => import('./admin/pages/settings/product/Sku'));
const PriceMaster               = lazy(() => import('./admin/pages/settings/product/PriceMaster'));
const AddUnitManagement         = lazy(() => import('./admin/pages/settings/product/AddUnitManagement'));
const AddProjectDescription     = lazy(() => import('./admin/pages/settings/product/AddProjectDescription'));
const AddBrandManufacturer      = lazy(() => import('./admin/pages/operations/brand/AddBrandManufacturer'));
const SupplierOverview          = lazy(() => import('./admin/pages/operations/brand/SupplierOverview'));
const CreateSolarkit            = lazy(() => import('./admin/pages/settings/combokit/CreateSolarkit'));
const CreateAmc                 = lazy(() => import('./admin/pages/settings/combokit/CreateAmc'));
const AmcServices               = lazy(() => import('./admin/pages/settings/combokit/AmcServices'));
const BundlePlans               = lazy(() => import('./admin/pages/settings/combokit/BundlePlans'));
const AddComboKit               = lazy(() => import('./admin/pages/settings/combokit/AddComboKit'));
const Customize                 = lazy(() => import('./admin/pages/settings/combokit/Customize'));
const CombokitOverview          = lazy(() => import('./admin/pages/settings/combokit-overview/CombokitOverview'));
const OrderProcurement          = lazy(() => import('./admin/pages/settings/order-procurement/OrderProcurement'));
const AddPartner                = lazy(() => import('./admin/pages/settings/partner/AddPartner'));
const PartnerPlans              = lazy(() => import('./admin/pages/settings/partner/Plans'));
const PartnerPointsRewards      = lazy(() => import('./admin/pages/settings/partner/PointsRewards'));
const PartnerOnboardingGoals    = lazy(() => import('./admin/pages/settings/partner/OnboardingGoals'));
const PartnerProfessionType     = lazy(() => import('./admin/pages/settings/partner/ProfessionType'));
const FranchiseeManagerSetting  = lazy(() => import('./admin/pages/settings/partner/FranchiseeManagerSetting'));
const FranchiseBuyLeadSetting   = lazy(() => import('./admin/pages/settings/partner/FranchiseBuyLeadSetting'));
const HrmsSettings              = lazy(() => import('./admin/pages/settings/hrms/Settings'));
const CandidateList             = lazy(() => import('./admin/pages/settings/hrms/CandidateList'));
const CandidateTestSetting      = lazy(() => import('./admin/pages/settings/hrms/CandidateTestSetting'));
const CandidateTrainingSetting  = lazy(() => import('./admin/pages/settings/hrms/CandidateTrainingSetting'));
const VacancySetting            = lazy(() => import('./admin/pages/settings/hrms/VacancySetting'));
const JourneyStageSetting       = lazy(() => import('./admin/pages/settings/project/JourneyStageSetting'));
const ProjectOverdueSetting     = lazy(() => import('./admin/pages/settings/project/OverdueSetting'));
const ConfigurationSetting      = lazy(() => import('./admin/pages/settings/project/ConfigurationSetting'));
const DocumentationSetting      = lazy(() => import('./admin/pages/settings/project/DocumentationSetting'));
const PlaceholderNameSetting    = lazy(() => import('./admin/pages/settings/project/PlaceholderNameSetting'));
const QuoteSetting              = lazy(() => import('./admin/pages/settings/quote/QuoteSetting'));
const SurveyBomSetting          = lazy(() => import('./admin/pages/settings/quote/SurveyBomSetting'));
const TerraceSetting            = lazy(() => import('./admin/pages/settings/quote/TerraceSetting'));
const StructureSetting          = lazy(() => import('./admin/pages/settings/quote/StructureSetting'));
const BuildingSetting           = lazy(() => import('./admin/pages/settings/quote/BuildingSetting'));
const DiscomMaster              = lazy(() => import('./admin/pages/settings/quote/DiscomMaster'));

// ─── Lazy: Admin Reports ────────────────────────────────────────────────────
const AdminFinancialPLReport       = lazy(() => import('./admin/pages/reports/FinancialPLReport'));
const AdminCashflowReport          = lazy(() => import('./admin/pages/reports/CashflowReport'));
const AdminInventoryReport         = lazy(() => import('./admin/pages/reports/InventoryReport'));
const AdminLoansSummaryReport      = lazy(() => import('./admin/pages/reports/LoansSummaryReport'));
const AdminCaptableReport          = lazy(() => import('./admin/pages/reports/CaptableReport'));
const AdminRevenueByCPTypesReport  = lazy(() => import('./admin/pages/reports/RevenueByCPTypesReport'));
const AdminClusterReport           = lazy(() => import('./admin/pages/reports/ClusterReport'));
const AdminDistrictReport          = lazy(() => import('./admin/pages/reports/DistrictReport'));
const AdminCityReport              = lazy(() => import('./admin/pages/reports/CityReport'));

// ─── Lazy: Dealer ───────────────────────────────────────────────────────────
const DealerDashboard         = lazy(() => import('./dealer/pages/dashboard/Dashboard'));
const Lead                    = lazy(() => import('./dealer/pages/projectSignup/Lead'));
const SurveyBOM               = lazy(() => import('./dealer/pages/projectSignup/SurveyBOM'));
const ProjectQuote            = lazy(() => import('./dealer/pages/projectSignup/ProjectQuote'));
const ProjectSignupPage       = lazy(() => import('./dealer/pages/projectSignup/ProjectSignup'));
const Manage                  = lazy(() => import('./dealer/pages/projectManagement/Manage'));
const TrackPM                 = lazy(() => import('./dealer/pages/projectManagement/Track'));
const DealerResidentialProject = lazy(() => import('./dealer/pages/projectManagement/DealerResidentialProject'));
const DealerCommercialProject  = lazy(() => import('./dealer/pages/projectManagement/DealerCommercialProject'));
const ProjectProgress         = lazy(() => import('./dealer/pages/track/ProjectProgress'));
const MyCommission            = lazy(() => import('./dealer/pages/track/MyCommission'));
const RaiseTicket             = lazy(() => import('./dealer/pages/tickets/RaiseTicket'));
const TicketStatus            = lazy(() => import('./dealer/pages/tickets/TicketStatus'));
const SolarKit                = lazy(() => import('./dealer/pages/solarKit/SolarKit'));
const Loan                    = lazy(() => import('./dealer/pages/loan/Loan'));
const Reports                 = lazy(() => import('./dealer/pages/reports/Reports'));

// ─── Lazy: Dealer Manager ───────────────────────────────────────────────────
const DealerManagerDashboard            = lazy(() => import('./dealerManager/pages/dashboard/DealerManagerDashboard'));
const DealerManagerLeads                = lazy(() => import('./dealerManager/pages/leads/Leads'));
const DealerManagerOnboardingCompanyLead = lazy(() => import('./dealerManager/pages/leads/DealerManagerOnboardingCompanyLead'));
const DealerManagerMyLeads              = lazy(() => import('./dealerManager/pages/leads/DealerManagerMyLeads'));
const DealerManagerSubLeads             = lazy(() => import('./dealerManager/pages/leads/SubLeads'));
const DealerManagerAppDemo              = lazy(() => import('./dealerManager/pages/myTask/AppDemo'));
const DealerManagerDealerSignup         = lazy(() => import('./dealerManager/pages/myTask/dealerOnboarding/DealerSignup'));
const DealerManagerDealerOrientation    = lazy(() => import('./dealerManager/pages/myTask/dealerOnboarding/DealerOrientation'));
const DealerManagerOrientationVideo     = lazy(() => import('./dealerManager/pages/myTask/dealerOnboarding/DealerManagerOrientationVideo'));
const DealerManagerProjectInProgress    = lazy(() => import('./dealerManager/pages/myTask/projectManagement/ProjectInProgress'));
const DealerManagerCompletedProjects    = lazy(() => import('./dealerManager/pages/myTask/projectManagement/CompletedProjects'));
const DealerManagerDealerPerformance    = lazy(() => import('./dealerManager/pages/myTask/DealerPerformance'));
const DealerManagerDealerPerformanceList = lazy(() => import('./dealerManager/pages/myTask/DealerPerformanceList'));
const DealerManagerOnboardingGoals      = lazy(() => import('./dealerManager/pages/onboardingGoals/OnboardingGoals'));
const DealerManagerServiceTicket        = lazy(() => import('./dealerManager/pages/tickets/Service'));
const DealerManagerDisputeTicket        = lazy(() => import('./dealerManager/pages/tickets/Dispute'));
const DealerManagerReport               = lazy(() => import('./dealerManager/pages/report/Report'));

// ─── Lazy: Franchisee ───────────────────────────────────────────────────────
const FranchiseDashboard      = lazy(() => import('./franchisee/pages/dashboard/FranchiseDashboard'));
const DistrictManager         = lazy(() => import('./franchisee/pages/DistrictManager/DistrictManager'));
const LeadAssignDashboard     = lazy(() => import('./franchisee/pages/dashboard/LeadAssignDashboard'));
const SurveyBom               = lazy(() => import('./franchisee/pages/SurveyBom/SurveyBom'));
const DealerManager           = lazy(() => import('./franchisee/pages/DealerManager/DealerManager'));
const CreateLeadPartner       = lazy(() => import('./franchisee/pages/LeadPartner/CreateLeadPartner'));
const LeadManagement          = lazy(() => import('./franchisee/pages/LeadPartner/LeadManagement'));
const MyTeam                  = lazy(() => import('./franchisee/pages/MyTeam/MyTeam'));
const TrackPayments           = lazy(() => import('./franchisee/pages/Account/TrackPayments'));
const Solarkits               = lazy(() => import('./franchisee/pages/Solarkits/Solarkits'));
const BulkOrder               = lazy(() => import('./franchisee/pages/Solarkits/BulkOrder'));
const Settings                = lazy(() => import('./franchisee/pages/Settings/Settings'));
const FranchiseeLead          = lazy(() => import('./franchisee/pages/projectSignup/Lead'));
const FranchiseeCreateQuotation = lazy(() => import('./franchisee/pages/projectSignup/CreateQuotation'));
const FranchiseeProjectSignup = lazy(() => import('./franchisee/pages/projectSignup/ProjectSignup'));
const FranchiseeLoan          = lazy(() => import('./franchisee/pages/projectSignup/Loan'));
const FranchiseeManagement    = lazy(() => import('./franchisee/pages/projectManagement/Management'));
const FranchiseeInstall       = lazy(() => import('./franchisee/pages/projectManagement/Install'));
const FranchiseeService       = lazy(() => import('./franchisee/pages/projectManagement/Service'));
const FranchiseeTrackService  = lazy(() => import('./franchisee/pages/projectManagement/TrackService'));

// ─── Lazy: Franchisee Manager ───────────────────────────────────────────────
const FranchiseeManagerDashboard      = lazy(() => import('./franchiseeManager/pages/dashboard/FranchiseeManagerDashboard'));
const FranchiseeManagerLeads          = lazy(() => import('./franchiseeManager/pages/leads/Leads'));
const FranchiseeManagerLeadManagement = lazy(() => import('./franchiseeManager/pages/leadManagement/LeadManagement'));
const FranchiseeManagerOnboardingGoals = lazy(() => import('./franchiseeManager/pages/onboardingGoals/OnboardingGoals'));
const FranchiseeManagerFindResources  = lazy(() => import('./franchiseeManager/pages/resources/FindResources'));
const FranchiseeManagerReport         = lazy(() => import('./franchiseeManager/pages/report/Report'));
const FMAppDemo                       = lazy(() => import('./franchiseeManager/pages/myTask/AppDemo'));
const FMFranchiseeSignup              = lazy(() => import('./franchiseeManager/pages/myTask/franchiseeOnboarding/FranchiseeSignup'));
const FMFranchiseeOrientation         = lazy(() => import('./franchiseeManager/pages/myTask/franchiseeOnboarding/FranchiseeOrientation'));
const FMProjectInProgress             = lazy(() => import('./franchiseeManager/pages/myTask/projectManagement/ProjectInProgress'));
const FMFranchiseePerformance         = lazy(() => import('./franchiseeManager/pages/myTask/FranchiseePerformance'));
const FMComboKitCustomization         = lazy(() => import('./franchiseeManager/pages/franchiseSetting/ComboKitCustomization'));
const FMOffers                        = lazy(() => import('./franchiseeManager/pages/franchiseSetting/Offers'));
const FMTrackCashback                 = lazy(() => import('./franchiseeManager/pages/franchiseSetting/TrackCashback'));
const FMAssignToFranchisee            = lazy(() => import('./franchiseeManager/pages/dealerManagement/AssignToFranchisee'));
const FMTrackDealer                   = lazy(() => import('./franchiseeManager/pages/dealerManagement/TrackDealer'));
const FMReassignToCompany             = lazy(() => import('./franchiseeManager/pages/dealerManagement/ReassignToCompany'));
const FMServiceTicket                 = lazy(() => import('./franchiseeManager/pages/tickets/Service'));
const FMDisputeTicket                 = lazy(() => import('./franchiseeManager/pages/tickets/Dispute'));

// ─── Lazy: Candidate ────────────────────────────────────────────────────────
const CandidateDashboard          = lazy(() => import('./candidate/pages/Dashboard'));
const CandidateTest               = lazy(() => import('./candidate/pages/Test'));
const CandidateCompleteApplication = lazy(() => import('./candidate/pages/CompleteApplication'));

// ─── Lazy: Employee ─────────────────────────────────────────────────────────
const OnboardingTraining = lazy(() => import('./employee/pages/OnboardingTraining'));

// ─── Shared fallback spinner ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── ProtectedRoute ─────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = authStore((state) => ({
    user: state.user,
    token: state.token,
  }));

  if (!token || !user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" />;
  return children;
}

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  const { setUser, user, token } = authStore((state) => ({
    setUser: state.setUser,
    user: state.user,
    token: state.token,
  }));

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      setIsInitializing(false);
    };
    initAuth();
  }, [token, user, setUser]);

  if (isInitializing) return <PageLoader />;

  const redirectPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':            return '/admin/dashboard';
      case 'dealer':           return '/dealer/dashboard';
      case 'franchisee':       return '/franchisee/dashboard';
      case 'dealerManager':    return '/dealer-manager/dashboard';
      case 'franchiseeManager': return '/franchisee-manager/dashboard';
      default:                 return '/login';
    }
  };

  // ─── Candidate routes (public, shared in both states) ──────────────────
  const candidateRoutes = (
    <Route path="/candidate-portal/*" element={
      <Suspense fallback={<PageLoader />}><CandidateLayout /></Suspense>
    }>
      <Route path="dashboard"            element={<Suspense fallback={<PageLoader />}><CandidateDashboard /></Suspense>} />
      <Route path="test"                 element={<Suspense fallback={<PageLoader />}><CandidateTest /></Suspense>} />
      <Route path="complete-application" element={<Suspense fallback={<PageLoader />}><CandidateCompleteApplication /></Suspense>} />
      <Route path=""                     element={<Navigate to="test" />} />
    </Route>
  );

  return (
    <>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/login"          element={<Login />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/candidate-login" element={<CandidateLogin />} />
            {candidateRoutes}

            {/* ── Admin ── */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
            }>
              <Route path="dashboard"                        element={<AdminInventoryDashboard />} />
              <Route path="dashboard/inventory"              element={<AdminInventoryDashboard />} />
              <Route path="dashboard/delivery"               element={<AdminDeliveryDashboard />} />
              <Route path="dashboard/installer"              element={<AdminInstallerDashboard />} />
              <Route path="dashboard/orders"                 element={<AdminOrdersDashboard />} />
              <Route path="dashboard/orders-by-loan"         element={<AdminOrdersByLoanDashboard />} />
              <Route path="dashboard/vendors"                element={<AdminVendorsDashboard />} />
              <Route path="dashboard/project-report"         element={<AdminProjectReport />} />
              <Route path="dashboard/user-performance/partner-manager" element={<FranchiseManagerDashboard />} />
              <Route path="dashboard/user-performance/partner"         element={<FranchisePerformanceDashboard />} />
              <Route path="dashboard/user-performance/dealer-manager"  element={<DealerManagerPerformanceDashboard />} />
              <Route path="dashboard/user-performance/dealer"          element={<DealerPerformanceDashboard />} />
              <Route path="departments"                      element={<AdminDepartments />} />
              <Route path="departments/organization-chart"   element={<AdminOrganizationChart />} />
              <Route path="approvals"                        element={<AdminApprovals />} />
              <Route path="project-management/:entityType/management"   element={<ManagementProjects />} />
              <Route path="project-management/:entityType/install"      element={<InstallProjects />} />
              <Route path="project-management/:entityType/service"      element={<ServiceProjects />} />
              <Route path="project-management/:entityType/track-service" element={<TrackServiceProjects />} />
              <Route path="residential-project"              element={<AdminResidentialProject />} />
              <Route path="commercial-project"               element={<AdminCommercialProject />} />
              <Route path="project-management"               element={<Navigate to="company/management" />} />
              <Route path="operations/warehouse"             element={<AdminWarehouse />} />
              <Route path="operations/add-inventory"         element={<AdminAddInventory />} />
              <Route path="operations/inventory-management"  element={<AdminInventoryManagement />} />
              {/* Leads */}
              <Route path="leads"               element={<LeadsPage />} />
              <Route path="leads/my-leads"      element={<MyLeads />} />
              <Route path="leads/assigned"      element={<AssignedLeads />} />
              <Route path="leads/upload"        element={<UploadPage />} />
              <Route path="leads/analytics"     element={<AnalyticsPage />} />
              <Route path="leads/project/:type" element={<ProjectWise />} />
              <Route path="leads/:id"           element={<LeadDetails />} />
              {/* Settings */}
              <Route path="settings/location/setup-locations"            element={<SetupLocations />} />
              <Route path="settings/hr/role-settings"                    element={<RoleSettings />} />
              <Route path="settings/hr/create-department"                element={<CreateDepartment />} />
              <Route path="settings/hr/manage-employees"                 element={<ManageEmployees />} />
              <Route path="settings/hr/manage-modules"                   element={<ManageModules />} />
              <Route path="settings/hr/department-wise-modules"          element={<DepartmentWiseModules />} />
              <Route path="settings/hr/temporary-incharge-setting"       element={<TemporaryInchargeSetting />} />
              <Route path="settings/hr/leave-approvals"                  element={<LeaveApprovals />} />
              <Route path="settings/hr/resign-approvals"                 element={<ResignApprovals />} />
              <Route path="settings/vendor/installer-vendors"            element={<InstallerVendors />} />
              <Route path="settings/vendor/supplier-type"                element={<SupplierType />} />
              <Route path="settings/vendor/supplier-vendors"             element={<SupplierVendors />} />
              <Route path="settings/sales/set-price"                     element={<SetPrice />} />
              <Route path="settings/sales/set-price-amc"                 element={<SetPriceAmc />} />
              <Route path="settings/sales/offers"                        element={<Offers />} />
              <Route path="settings/sales/solar-panel-bundle-setting"    element={<SolarPanelBundleSetting />} />
              <Route path="settings/marketing/campaign-management"       element={<CampaignManagement />} />
              <Route path="settings/delivery/delivery-type"              element={<DeliveryType />} />
              <Route path="settings/delivery/delivery_type"              element={<DeliveryType />} />
              <Route path="settings/delivery/vehicle-selection"          element={<VehicleSelection />} />
              <Route path="settings/delivery/vehicle_selection"          element={<VehicleSelection />} />
              <Route path="settings/delivery/vendor-delivery-plan"       element={<VendorDeliveryPlan />} />
              <Route path="settings/delivery/vendor_delivery_plan"       element={<VendorDeliveryPlan />} />
              <Route path="settings/installer/solar-installer"           element={<SolarInstaller />} />
              <Route path="settings/installer/tool-requirements"         element={<ToolRequirements />} />
              <Route path="settings/installer/rating-setting"            element={<RatingSetting />} />
              <Route path="settings/installer/agency"                    element={<Agency />} />
              <Route path="settings/installer/agency-plans"              element={<AgencyPlan />} />
              <Route path="settings/inventory/inventory-overview"        element={<InventoryOverview />} />
              <Route path="settings/inventory/restock-order-limit"       element={<RestockOrderLimit />} />
              <Route path="settings/inventory/combokit-brand-overview"   element={<CombokitBrandOverview />} />
              <Route path="settings/product/add-project-type"            element={<AddProjectType />} />
              <Route path="settings/product/project-description"         element={<AddProjectDescription />} />
              <Route path="settings/product/add-project-category"        element={<AddProjectCategory />} />
              <Route path="settings/product/add-product"                 element={<AddProduct />} />
              <Route path="settings/product/sku"                         element={<Sku />} />
              <Route path="settings/product/price-master"                element={<PriceMaster />} />
              <Route path="settings/product/add-unit-management"         element={<AddUnitManagement />} />
              <Route path="operations/brand/add-brand-manufacturer"      element={<AddBrandManufacturer />} />
              <Route path="operations/brand/supplier-overview"           element={<SupplierOverview />} />
              <Route path="settings/combokit/create-solarkit"            element={<CreateSolarkit />} />
              <Route path="settings/combokit/create-amc"                 element={<CreateAmc />} />
              <Route path="settings/combokit/amc-services"               element={<AmcServices />} />
              <Route path="settings/combokit/bundle-plans"               element={<BundlePlans />} />
              <Route path="settings/combokit/add-combokit"               element={<AddComboKit />} />
              <Route path="settings/combokit/customize"                  element={<Customize />} />
              <Route path="settings/combokit-overview"                   element={<CombokitOverview />} />
              <Route path="settings/order-procurement"                   element={<OrderProcurement />} />
              <Route path="settings/partner/add-partner"                 element={<AddPartner />} />
              <Route path="settings/partner/plans"                       element={<PartnerPlans />} />
              <Route path="settings/partner/points-rewards"              element={<PartnerPointsRewards />} />
              <Route path="settings/partner/onboarding-goals"            element={<PartnerOnboardingGoals />} />
              <Route path="settings/partner/profession-type"             element={<PartnerProfessionType />} />
              <Route path="settings/hrms/settings"                       element={<HrmsSettings />} />
              <Route path="settings/hrms/candidates"                     element={<CandidateList />} />
              <Route path="settings/hrms/candidate-test-setting"         element={<CandidateTestSetting />} />
              <Route path="settings/hrms/candidate-training-setting"     element={<CandidateTrainingSetting />} />
              <Route path="settings/hrms/vacancy-module"                 element={<VacancySetting />} />
              <Route path="settings/project/journey-stage-setting"       element={<JourneyStageSetting />} />
              <Route path="settings/project/overdue-setting"             element={<ProjectOverdueSetting />} />
              <Route path="settings/project/configuration-setting"       element={<ConfigurationSetting />} />
              <Route path="settings/project/documentation-setting"       element={<DocumentationSetting />} />
              <Route path="settings/project/placeholder-name-setting"    element={<PlaceholderNameSetting />} />
              <Route path="settings/quote/quote-setting"                 element={<QuoteSetting />} />
              <Route path="settings/quote/survey-bom-setting"            element={<SurveyBomSetting />} />
              <Route path="settings/quote/terrace-setting"               element={<TerraceSetting />} />
              <Route path="settings/quote/structure-setting"             element={<StructureSetting />} />
              <Route path="settings/quote/building-setting"              element={<BuildingSetting />} />
              <Route path="settings/quote/discom-master"                 element={<DiscomMaster />} />
              <Route path="settings/approval-overdue"                    element={<ApprovalOverdueSetting />} />
              <Route path="settings/overdue-task"                        element={<OverdueTaskSetting />} />
              <Route path="settings/overdue-status"                      element={<OverdueStatusSetting />} />
              <Route path="settings/partner-manager"                     element={<FranchiseeManagerSetting />} />
              <Route path="settings/partner-buy-lead"                    element={<FranchiseBuyLeadSetting />} />
              <Route path="settings/loan"                                element={<LoanSetting />} />
              <Route path="settings/checklist"                           element={<ChecklistSetting />} />
              <Route path="settings/forms"                               element={<FormBuilderList />} />
              <Route path="settings/forms/:id/edit"                      element={<FormBuilderEditor />} />
              <Route path="settings/forms/:id/preview"                   element={<FormBuilderPreview />} />
              <Route path="settings/forms/:id/submissions"               element={<FormSubmissionsViewer />} />
              {/* Reports */}
              <Route path="reports/financial-pl"       element={<AdminFinancialPLReport />} />
              <Route path="reports/cashflow"           element={<AdminCashflowReport />} />
              <Route path="reports/inventory"          element={<AdminInventoryReport />} />
              <Route path="reports/loans-summary"      element={<AdminLoansSummaryReport />} />
              <Route path="reports/captable"           element={<AdminCaptableReport />} />
              <Route path="reports/revenue-by-cp-types" element={<AdminRevenueByCPTypesReport />} />
              <Route path="reports/cluster"            element={<AdminClusterReport />} />
              <Route path="reports/district"           element={<AdminDistrictReport />} />
              <Route path="reports/city"               element={<AdminCityReport />} />
            </Route>

            {/* ── Dealer ── */}
            <Route path="/dealer/*" element={
              <ProtectedRoute requiredRole="dealer"><DealerLayout /></ProtectedRoute>
            }>
              <Route path="dashboard"                              element={<DealerDashboard />} />
              <Route path="project-signup/lead"                    element={<Lead />} />
              <Route path="project-signup/survey-bom"              element={<SurveyBOM />} />
              <Route path="project-signup/project-quote"           element={<ProjectQuote />} />
              <Route path="project-signup/project-signup"          element={<ProjectSignupPage />} />
              <Route path="project-signup"                         element={<Navigate to="project-signup/lead" />} />
              <Route path="project-management/manage"              element={<Manage />} />
              <Route path="project-management/track"               element={<TrackPM />} />
              <Route path="residential-project"                    element={<DealerResidentialProject />} />
              <Route path="commercial-project"                     element={<DealerCommercialProject />} />
              <Route path="project-management"                     element={<Navigate to="project-management/manage" />} />
              <Route path="track/project-progress"                 element={<ProjectProgress />} />
              <Route path="track/my-commission"                    element={<MyCommission />} />
              <Route path="track"                                  element={<Navigate to="track/project-progress" />} />
              <Route path="tickets/raise-ticket"                   element={<RaiseTicket />} />
              <Route path="tickets/ticket-status"                  element={<TicketStatus />} />
              <Route path="tickets"                                element={<Navigate to="tickets/raise-ticket" />} />
              <Route path="solar-kit"                              element={<SolarKit />} />
              <Route path="loan"                                   element={<Loan />} />
              <Route path="reports"                                element={<Reports />} />
            </Route>

            {/* ── Franchisee ── */}
            <Route path="/franchisee/*" element={
              <ProtectedRoute requiredRole="franchisee"><FranchiseeLayout /></ProtectedRoute>
            }>
              <Route path="dashboard"                        element={<FranchiseDashboard />} />
              <Route path="dashboard/lead-assign"            element={<LeadAssignDashboard />} />
              <Route path="survey-bom"                       element={<SurveyBom />} />
              <Route path="district-manager"                 element={<DistrictManager />} />
              <Route path="dealer-manager"                   element={<DealerManager />} />
              <Route path="lead-partner/create"              element={<CreateLeadPartner />} />
              <Route path="lead-partner/management"          element={<LeadManagement />} />
              <Route path="my-team"                          element={<MyTeam />} />
              <Route path="account/track-payments"           element={<TrackPayments />} />
              <Route path="solarkits"                        element={<Solarkits />} />
              <Route path="solarkits/bulk-order"             element={<BulkOrder />} />
              <Route path="settings"                         element={<Settings />} />
              <Route path="project-signup/lead"              element={<FranchiseeLead />} />
              <Route path="project-signup/create-quotation"  element={<FranchiseeCreateQuotation />} />
              <Route path="project-signup/project-signup"    element={<FranchiseeProjectSignup />} />
              <Route path="project-signup/loan"              element={<FranchiseeLoan />} />
              <Route path="project-management/management"    element={<FranchiseeManagement />} />
              <Route path="project-management/install"       element={<FranchiseeInstall />} />
              <Route path="project-management/service"       element={<FranchiseeService />} />
              <Route path="project-management/track-service" element={<FranchiseeTrackService />} />
            </Route>

            {/* ── Dealer Manager ── */}
            <Route path="/dealer-manager/*" element={
              <ProtectedRoute requiredRole="dealerManager"><DealerManagerLayout /></ProtectedRoute>
            }>
              <Route path="dashboard"                                          element={<DealerManagerDashboard />} />
              <Route path="leads"                                              element={<DealerManagerLeads />} />
              <Route path="onboarding/company-lead"                            element={<DealerManagerOnboardingCompanyLead />} />
              <Route path="onboarding/my-lead"                                 element={<DealerManagerMyLeads />} />
              <Route path="onboarding/sub-leads/:id"                           element={<DealerManagerSubLeads />} />
              <Route path="my-task/app-demo"                                   element={<DealerManagerAppDemo />} />
              <Route path="my-task/dealer-onboarding/dealer-signup"            element={<DealerManagerDealerSignup />} />
              <Route path="my-task/dealer-onboarding/dealer-orientation"       element={<DealerManagerDealerOrientation />} />
              <Route path="orientation/video"                                  element={<DealerManagerOrientationVideo />} />
              <Route path="my-task/dealer-onboarding"                          element={<Navigate to="dealer-signup" />} />
              <Route path="my-task/project-management/project-in-progress"     element={<DealerManagerProjectInProgress />} />
              <Route path="my-task/project-management/completed-projects"      element={<DealerManagerCompletedProjects />} />
              <Route path="my-task/project-management"                         element={<Navigate to="project-in-progress" />} />
              <Route path="my-task/dealer-performance"                         element={<DealerManagerDealerPerformance />} />
              <Route path="my-task/dealer-performance/:type"                   element={<DealerManagerDealerPerformanceList />} />
              <Route path="my-task"                                            element={<Navigate to="app-demo" />} />
              <Route path="onboarding-goals"                                   element={<DealerManagerOnboardingGoals />} />
              <Route path="tickets/service"                                    element={<DealerManagerServiceTicket />} />
              <Route path="tickets/dispute"                                    element={<DealerManagerDisputeTicket />} />
              <Route path="tickets"                                            element={<Navigate to="service" />} />
              <Route path="report"                                             element={<DealerManagerReport />} />
              <Route path=""                                                   element={<Navigate to="dashboard" />} />
            </Route>

            {/* ── Franchisee Manager ── */}
            <Route path="/franchisee-manager/*" element={
              <ProtectedRoute requiredRole="franchiseeManager"><FranchiseeManagerLayout /></ProtectedRoute>
            }>
              <Route path="dashboard"                                              element={<FranchiseeManagerDashboard />} />
              <Route path="leads"                                                  element={<FranchiseeManagerLeads />} />
              <Route path="lead-management"                                        element={<FranchiseeManagerLeadManagement />} />
              <Route path="onboarding-goals"                                       element={<FranchiseeManagerOnboardingGoals />} />
              <Route path="my-task/app-demo"                                       element={<FMAppDemo />} />
              <Route path="my-task/franchisee-onboarding/franchisee-signup"        element={<FMFranchiseeSignup />} />
              <Route path="my-task/franchisee-onboarding/franchisee-orientation"   element={<FMFranchiseeOrientation />} />
              <Route path="my-task/franchisee-onboarding"                          element={<Navigate to="franchisee-signup" />} />
              <Route path="my-task/project-management/project-in-progress"         element={<FMProjectInProgress />} />
              <Route path="my-task/project-management"                             element={<Navigate to="project-in-progress" />} />
              <Route path="my-task/franchisee-performance"                         element={<FMFranchiseePerformance />} />
              <Route path="my-task"                                                element={<Navigate to="app-demo" />} />
              <Route path="franchisee-setting/combokit-customization"              element={<FMComboKitCustomization />} />
              <Route path="franchisee-setting/offers"                              element={<FMOffers />} />
              <Route path="franchisee-setting/track-cashback"                      element={<FMTrackCashback />} />
              <Route path="franchisee-setting"                                     element={<Navigate to="combokit-customization" />} />
              <Route path="dealer-management/assign-to-franchisee"                 element={<FMAssignToFranchisee />} />
              <Route path="dealer-management/track-dealer"                         element={<FMTrackDealer />} />
              <Route path="dealer-management/reasign-to-company"                   element={<FMReassignToCompany />} />
              <Route path="dealer-management"                                      element={<Navigate to="assign-to-franchisee" />} />
              <Route path="tickets/service"                                        element={<FMServiceTicket />} />
              <Route path="tickets/dispute"                                        element={<FMDisputeTicket />} />
              <Route path="tickets"                                                element={<Navigate to="service" />} />
              <Route path="find-resources"                                         element={<FranchiseeManagerFindResources />} />
              <Route path="report"                                                 element={<FranchiseeManagerReport />} />
              <Route path=""                                                       element={<Navigate to="dashboard" />} />
            </Route>

            {/* ── Employee ── */}
            <Route path="/employee/*" element={
              <ProtectedRoute requiredRole="employee">
                <Routes>
                  <Route path="training"  element={<Suspense fallback={<PageLoader />}><OnboardingTraining /></Suspense>} />
                  <Route path="dashboard" element={<div className="p-8 text-center text-xl font-bold">Employee Dashboard Integration Pending...</div>} />
                  <Route path=""          element={<Navigate to="training" />} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* ── Redirects ── */}
            <Route path="/"          element={<Navigate to={redirectPath()} />} />
            <Route path="/dashboard" element={<Navigate to={redirectPath()} />} />
            <Route path="*"          element={<Navigate to={redirectPath()} />} />
          </Routes>
        </Suspense>
      </Router>
      <GlobalLoader />
    </>
  );
}

export default App;