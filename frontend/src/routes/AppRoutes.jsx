// frontend/src/routes/AppRoutes.jsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { ROUTES, ROLES, ROLE_GROUPS } from './routeConfig';
import * as Components from './routeComponents';
// Layout component
import Layout from '../components/common/Layout/Layout';
// Public Pages
import HomePage from '../pages/home/HomePage';
import ContactPage from '../pages/contact/Contact';
import FeaturesPage from '../pages/features/Feature';
import AboutPage from '../pages/about/About';

// Import pages that don't use lazy loading
import LaboratoriesPage from '../pages/laboratories/LaboratoriesPage';
import ICTReportsPage from '../pages/reports/IctReportsPage/IctReportsPage';
import AddComputerPage from '../pages/computers/AddComputerPage/AddComputerPage';
import MessagesPage from '../pages/messages/MessagesPage'

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// ✅ FIXED: Changed parameter name from 'Components' to 'Component'
const renderProtectedRoute = (Component, allowedRoles) => (
  <PrivateRoute>
    <RoleBasedRoute allowedRoles={allowedRoles}>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Component />
        </Suspense>
      </Layout>
    </RoleBasedRoute>
  </PrivateRoute>
);

// ✅ FIXED: Changed parameter name from 'Components' to 'Component'
const renderPublicRouteWithLayout = (Component) => (
  <Layout>
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  </Layout>
);

// ✅ FIXED: Changed parameter name from 'Components' to 'Component'
const renderAuthRoute = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const AppRoutes = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* ==================== PUBLIC LANDING PAGES ==================== */}
        <Route 
          path="/" 
          element={
            <Layout>
              <HomePage />
            </Layout>
          } 
        />
        <Route 
          path="/home" 
          element={
            <Layout>
              <HomePage />
            </Layout>
          } 
        />
        <Route 
          path="/features" 
          element={
            <Layout>
              <FeaturesPage />
            </Layout>
          } 
        />
        <Route 
          path="/about" 
          element={
            <Layout>
              <AboutPage />
            </Layout>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <Layout>
              <ContactPage />
            </Layout>
          } 
        />

        {/* Laboratories Page */}
        <Route 
          path="/laboratories" 
          element={
            <Layout>
              <LaboratoriesPage />
            </Layout>
          } 
        />

        {/* ==================== AUTHENTICATION ROUTES (No Layout) ==================== */}
        <Route path={ROUTES.LOGIN} element={renderAuthRoute(Components.LoginPage)} />
        <Route path={ROUTES.REGISTER} element={renderAuthRoute(Components.RegisterPage)} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={renderAuthRoute(Components.ForgotPasswordPage)} />
        <Route path={ROUTES.RESET_PASSWORD} element={renderAuthRoute(Components.ResetPasswordPage)} />
        <Route path={ROUTES.VERIFY_EMAIL} element={renderAuthRoute(Components.VerifyEmailPage)} />

        {/* ==================== DASHBOARD ROUTES ==================== */}
        
        {/* Generic Dashboard (auto-detects role) */}
        <Route 
          path={ROUTES.DASHBOARD} 
          element={renderProtectedRoute(Components.Dashboard, ROLE_GROUPS.ALL)} 
        />
        
        {/* Role-specific Dashboard Routes */}
        <Route 
          path={ROUTES.ADMIN_DASHBOARD} 
          element={renderProtectedRoute(Components.AdminDashboard, [ROLES.ADMIN])} 
        />
        
        <Route 
          path={ROUTES.LAB_MANAGER_DASHBOARD} 
          element={renderProtectedRoute(Components.LabManagerDashboard, ['lab-manager', 'lab_manager'])} 
        />
        
        <Route 
          path={ROUTES.TEACHER_DASHBOARD} 
          element={renderProtectedRoute(Components.TeacherDashboard, [ROLES.TEACHER])} 
        />
        
        <Route 
          path={ROUTES.DEAN_DASHBOARD} 
          element={renderProtectedRoute(Components.DeanDashboard, [ROLES.DEAN])} 
        />
        
        <Route 
          path={ROUTES.STUDENT_DASHBOARD} 
          element={renderProtectedRoute(Components.StudentDashboard, [ROLES.STUDENT])} 
        />
        
        <Route 
          path={ROUTES.LAB_ASSISTANT_DASHBOARD} 
          element={renderProtectedRoute(Components.LabAssistantDashboard, [ROLES.LAB_ASSISTANT])} 
        />
        
        <Route 
          path={ROUTES.ICT_DASHBOARD} 
          element={renderProtectedRoute(Components.ICTDashboard, [ROLES.ICT])} 
        />
        
        {/* ICT Reports Route */}
        <Route 
          path="/ict/reports" 
          element={renderProtectedRoute(ICTReportsPage, [ROLES.ICT, ROLES.ADMIN])} 
        />
        
        <Route 
          path={ROUTES.ASSET_DASHBOARD} 
          element={renderProtectedRoute(Components.AssetDashboard, [ROLES.ASSET])} 
        />

        {/* ==================== SCHEDULE ROUTES ==================== */}
        <Route 
          path={ROUTES.BOOK_LAB} 
          element={renderProtectedRoute(Components.BookLabPage, [ROLES.ADMIN, ROLES.TEACHER, ROLES.DEAN])} 
        />
        
        <Route 
          path={ROUTES.MY_SCHEDULES} 
          element={renderProtectedRoute(Components.MySchedulesPage, [ROLES.TEACHER, ROLES.STUDENT, ROLES.DEAN])} 
        />
        
        <Route 
          path={ROUTES.PENDING_APPROVALS} 
          element={renderProtectedRoute(Components.SchedulePendingApprovalsPage, [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN])} 
        />
        
        <Route 
          path={ROUTES.BATCH_SCHEDULE} 
          element={renderProtectedRoute(Components.BatchSchedulePage, [ROLES.DEAN])} 
        />
        
        <Route 
          path={ROUTES.SCHEDULE_CALENDAR} 
          element={renderProtectedRoute(Components.ScheduleCalendarPage, [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.LAB_ASSISTANT])} 
        />

        {/* ==================== COMPUTER ROUTES ==================== */}
        <Route 
          path="/add-computer" 
          element={renderProtectedRoute(AddComputerPage, [ROLES.ADMIN, ROLES.ASSET, ROLES.LAB_MANAGER])} 
        />
        
        <Route 
          path={ROUTES.COMPUTERS} 
          element={renderProtectedRoute(Components.ComputersPage, ROLES.ALL_ROLES)} 
        />

      <Route 
      path="/lab-manager/messages" 
      element={renderProtectedRoute(MessagesPage, [ROLES.LAB_MANAGER, ROLES.ADMIN])} 
      />

        <Route 
          path={ROUTES.COMPUTER_DETAIL} 
          element={renderProtectedRoute(Components.ComputerDetailPage, ROLES.ALL_ROLES)} 
        />

        <Route 
          path={ROUTES.ADD_COMPUTER} 
          element={renderProtectedRoute(Components.AddComputerPage, [ROLES.ADMIN, ROLES.LAB_MANAGER])} 
        />

        <Route 
          path={ROUTES.COMPUTER_STATUS} 
          element={renderProtectedRoute(Components.ComputerStatusPage, [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT, ROLES.LAB_ASSISTANT, ROLES.ASSET])} 
        />

        {/* ==================== MAINTENANCE ROUTES ==================== */}
        <Route 
          path={ROUTES.CREATE_REQUEST} 
          element={renderProtectedRoute(Components.CreateRequestPage, [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.STUDENT, ROLES.LAB_ASSISTANT, ROLES.ICT])} 
        />

        <Route 
          path={ROUTES.MAINTENANCE} 
          element={renderProtectedRoute(Components.MaintenancePage, [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT])} 
        />

        {/* ICT PENDING APPROVALS - Maintenance requests only */}
        <Route 
          path="/ict/pending-approvals" 
          element={renderProtectedRoute(Components.MaintenancePendingApprovalsPage, [ROLES.ICT, ROLES.ADMIN])} 
        />

        <Route 
          path={ROUTES.REQUEST_DETAIL} 
          element={renderProtectedRoute(Components.RequestDetailPage, [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT])} 
        />

        <Route 
          path={ROUTES.MY_ASSIGNMENTS} 
          element={renderProtectedRoute(Components.MyAssignmentsPage, [ROLES.ICT])} 
        />

        {/* ==================== ATTENDANCE ROUTES ==================== */}
        
        {/* Teacher: Main attendance page - list of sessions */}
        <Route 
          path="/attendance" 
          element={renderProtectedRoute(Components.AttendancePage, [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.STUDENT, ROLES.LAB_ASSISTANT])} 
        />
        
        <Route 
          path="/attendance/:scheduleId" 
          element={renderProtectedRoute(Components.AttendancePage, [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_ASSISTANT])} 
        />
        
        {/* Teacher: Take attendance for a specific schedule */}
        <Route 
          path="/attendance/take/:scheduleId" 
          element={renderProtectedRoute(Components.TakeAttendancePage, [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_ASSISTANT])} 
        />
        
        {/* Student: View my attendance records */}
        <Route 
          path={ROUTES.MY_ATTENDANCE} 
          element={renderProtectedRoute(Components.MyAttendancePage, [ROLES.STUDENT])} 
        />

        {/* Student: View attendance summary */}
        <Route 
          path="/attendance/summary" 
          element={renderProtectedRoute(Components.AttendanceSummaryPage, [ROLES.STUDENT])} 
        />

        {/* Student: View attendance history */}
        <Route 
          path="/attendance/history" 
          element={renderProtectedRoute(Components.AttendanceHistoryPage, [ROLES.STUDENT])} 
        />

        {/* Teacher/Lab Manager/Dean: View attendance reports */}
        <Route 
          path={ROUTES.ATTENDANCE_REPORT} 
          element={renderProtectedRoute(Components.AttendanceReportPage, [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.STUDENT])} 
        />

        {/* Lab Assistant: View assigned sessions (when teacher is absent) */}
        <Route 
          path="/lab-assistant/assigned-sessions" 
          element={renderProtectedRoute(Components.AssignedSessionsPage, [ROLES.LAB_ASSISTANT])} 
        />

        {/* Lab Assistant: Take attendance for assigned session */}
        <Route 
          path="/lab-assistant/attendance/:scheduleId" 
          element={renderProtectedRoute(Components.LabAssistantAttendancePage, [ROLES.LAB_ASSISTANT])} 
        />

        {/* ==================== ASSET/EQUIPMENT ROUTES ==================== */}
        <Route 
          path={ROUTES.EQUIPMENT} 
          element={renderProtectedRoute(Components.EquipmentPage, [ROLES.ASSET, ROLES.ADMIN, ROLES.LAB_ASSISTANT])} 
        />
        
        <Route 
          path="/equipment/borrow" 
          element={renderProtectedRoute(Components.BorrowEquipmentPage, [ROLES.ASSET])} 
        />
        
        <Route 
          path={ROUTES.BORROW_EQUIPMENT} 
          element={renderProtectedRoute(Components.BorrowEquipmentPage, [ROLES.ASSET])} 
        />
        
        <Route 
          path={ROUTES.AUDIT} 
          element={renderProtectedRoute(Components.AuditPage, [ROLES.ADMIN, ROLES.ASSET, ROLES.LAB_ASSISTANT])} 
        />
        
        <Route 
          path={ROUTES.AUDIT_HISTORY} 
          element={renderProtectedRoute(Components.AuditHistoryPage, [ROLES.ASSET, ROLES.ADMIN, ROLES.LAB_ASSISTANT])} 
        />

        {/* ==================== USER ROUTES ==================== */}
        <Route 
          path={ROUTES.USERS} 
          element={renderProtectedRoute(Components.UsersPage, [ROLES.ADMIN])} 
        />
        
        <Route 
          path={ROUTES.PROFILE} 
          element={renderProtectedRoute(Components.ProfilePage, ROLE_GROUPS.ALL)} 
        />
        
        <Route 
          path={ROUTES.SETTINGS} 
          element={renderProtectedRoute(Components.SettingsPage, [ROLES.ADMIN])} 
        />
        
        <Route 
          path={ROUTES.CHANGE_PASSWORD} 
          element={renderProtectedRoute(Components.ChangePasswordPage, ROLE_GROUPS.ALL)} 
        />

        {/* ==================== REPORT ROUTES ==================== */}
        <Route 
          path={ROUTES.REPORTS} 
          element={renderProtectedRoute(Components.ReportsPage, [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT])} 
        />
        
        <Route 
          path={ROUTES.SCHEDULED_REPORTS} 
          element={renderProtectedRoute(Components.ScheduledReportsPage, [ROLES.ADMIN])} 
        />

        {/* ==================== NOT FOUND ROUTE ==================== */}
        <Route 
          path={ROUTES.NOT_FOUND} 
          element={
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Components.NotFoundPage />
              </Suspense>
            </Layout>
          } 
        />
        
        {/* Catch all - redirect to 404 */}
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;