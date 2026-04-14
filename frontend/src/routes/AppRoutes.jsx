import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage/LoginPage';

// Dashboard Pages
import AdminDashboard from '../pages/dashboard/AdminDashboard/AdiminDashbord';
import LabManagerDashboard from '../pages/dashboard/LabManagerDashboard/LabManagerDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard/TeacherDashboard';
import DeanDashboard from '../pages/dashboard/DeanDashboard/DeanDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard/StudentDashboard';
import LabAssistantDashboard from '../pages/dashboard/LabAssistantDashboard/LabAssistantDashboard';
import ICTDashboard from '../pages/dashboard/IctDashboard/IctDashboard';
import AssetDashboard from '../pages/dashboard/AssetDashboard/AssetDashboard';

// Schedule Pages
import BookLabPage from '../pages/schedules/BookLabPage/BookLabPage';
import MySchedulesPage from '../pages/schedules/MySchedulesPage/MySchedulePage';
import PendingApprovalsPage from '../pages/schedules/PandingApprovalsPage/PandingApprovalsPage';
import BatchSchedulePage from '../pages/schedules/BatchSchedulePage/BatchSchedulePage';
import ScheduleCalendarPage from '../pages/schedules/ScheduleCalenderPage/ScheduleCalenderPage';

// Computer Pages
import ComputersPage from '../pages/computers/ComputersPage/ComputerPage';
import ComputerDetailPage from '../pages/computers/ComputerDetailpage/ComputerDetailPage';
import AddComputerPage from '../pages/computers/AddComputerPage/AddComputerPage';
import ComputerStatusPage from '../pages/computers/ComputerStatusPage/ComputerStatusPage';

// Maintenance Pages
import CreateRequestPage from '../pages/maintenance/CreateRequestPage/CreateRequestPage';
import MaintenancePage from '../pages/maintenance/MaintenancePage/MaintenancePage';
import RequestDetailPage from '../pages/maintenance/RequestDetailPage/RequestDetailPage';
import MyAssignmentsPage from '../pages/maintenance/MyAssignmentsPage/MyAssignmentsPage';

// Attendance Pages
import AttendancePage from '../pages/attendance/attendancePage/AttendancePage';
import MyAttendancePage from '../pages/attendance/myAttendancePage/MyAttendancePage';
import AttendanceReportPage from '../pages/attendance/AttendanceReportPage/AttendanceReportPage';

// Asset Pages
import EquipmentPage from '../pages/asset/EquipmentPage/EquipmentPage';
import RegisterEquipmentPage from '../pages/asset/RegisterEquipmentPage/RegisterEquipmentPage';
import AuditPage from '../pages/asset/AuditPage/AuditPage';
import AuditHistoryPage from '../pages/asset/AuditHistoryPage/AuditHistoryPage';

// User Pages
import UsersPage from '../pages/users/UsersPage/UsersPage';
import ProfilePage from '../pages/users/ProfilePage/ProfilePage';
import SettingsPage from '../pages/users/SettingsPage/SettingPage';

// Report Pages
import ReportsPage from '../pages/reports/ReoprtsPage/ReportPage';
import ScheduledReportsPage from '../pages/reports/scheduledReportPage/ScheduledReportPage';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Dashboard Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/lab-manager/dashboard" element={<ProtectedRoute allowedRoles={['lab-manager']}><LabManagerDashboard /></ProtectedRoute>} />
        <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/dean/dashboard" element={<ProtectedRoute allowedRoles={['dean']}><DeanDashboard /></ProtectedRoute>} />
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/lab-assistant/dashboard" element={<ProtectedRoute allowedRoles={['lab-assistant']}><LabAssistantDashboard /></ProtectedRoute>} />
        <Route path="/ict/dashboard" element={<ProtectedRoute allowedRoles={['ict']}><ICTDashboard /></ProtectedRoute>} />
        <Route path="/asset/dashboard" element={<ProtectedRoute allowedRoles={['asset']}><AssetDashboard /></ProtectedRoute>} />
        
        {/* Schedule Routes */}
        <Route path="/book-lab" element={<ProtectedRoute allowedRoles={['teacher', 'dean']}><BookLabPage /></ProtectedRoute>} />
        <Route path="/my-schedules" element={<ProtectedRoute allowedRoles={['teacher', 'student', 'dean']}><MySchedulesPage /></ProtectedRoute>} />
        <Route path="/pending-approvals" element={<ProtectedRoute allowedRoles={['lab-manager', 'dean']}><PendingApprovalsPage /></ProtectedRoute>} />
        <Route path="/batch-schedule" element={<ProtectedRoute allowedRoles={['dean']}><BatchSchedulePage /></ProtectedRoute>} />
        <Route path="/schedule-calendar" element={<ProtectedRoute allowedRoles={['teacher', 'student', 'lab-manager']}><ScheduleCalendarPage /></ProtectedRoute>} />
        
        {/* Computer Routes */}
        <Route path="/computers" element={<ProtectedRoute allowedRoles={['lab-manager', 'admin', 'ict']}><ComputersPage /></ProtectedRoute>} />
        <Route path="/computer/:id" element={<ProtectedRoute allowedRoles={['lab-manager', 'admin', 'ict']}><ComputerDetailPage /></ProtectedRoute>} />
        <Route path="/add-computer" element={<ProtectedRoute allowedRoles={['lab-manager', 'admin']}><AddComputerPage /></ProtectedRoute>} />
        <Route path="/computer-status" element={<ProtectedRoute allowedRoles={['lab-manager', 'ict']}><ComputerStatusPage /></ProtectedRoute>} />
        
        {/* Maintenance Routes */}
        <Route path="/create-request" element={<ProtectedRoute allowedRoles={['teacher', 'student', 'lab-assistant']}><CreateRequestPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['lab-manager', 'ict']}><MaintenancePage /></ProtectedRoute>} />
        <Route path="/request/:id" element={<ProtectedRoute allowedRoles={['lab-manager', 'ict']}><RequestDetailPage /></ProtectedRoute>} />
        <Route path="/my-assignments" element={<ProtectedRoute allowedRoles={['ict']}><MyAssignmentsPage /></ProtectedRoute>} />
        
        {/* Attendance Routes */}
        <Route path="/attendance/:scheduleId" element={<ProtectedRoute allowedRoles={['teacher', 'lab-assistant']}><AttendancePage /></ProtectedRoute>} />
        <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendancePage /></ProtectedRoute>} />
        <Route path="/attendance-report" element={<ProtectedRoute allowedRoles={['teacher', 'lab-manager', 'dean']}><AttendanceReportPage /></ProtectedRoute>} />
        
        {/* Asset Routes */}
        <Route path="/equipment" element={<ProtectedRoute allowedRoles={['asset', 'lab-manager', 'admin']}><EquipmentPage /></ProtectedRoute>} />
        <Route path="/register-equipment" element={<ProtectedRoute allowedRoles={['asset']}><RegisterEquipmentPage /></ProtectedRoute>} />
        <Route path="/audit/:labId" element={<ProtectedRoute allowedRoles={['asset']}><AuditPage /></ProtectedRoute>} />
        <Route path="/audit-history" element={<ProtectedRoute allowedRoles={['asset', 'admin']}><AuditHistoryPage /></ProtectedRoute>} />
        
        {/* User Routes */}
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'lab-manager', 'dean', 'lab-assistant', 'ict', 'asset']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
        
        {/* Report Routes */}
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'lab-manager', 'dean']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/scheduled-reports" element={<ProtectedRoute allowedRoles={['admin']}><ScheduledReportsPage /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;