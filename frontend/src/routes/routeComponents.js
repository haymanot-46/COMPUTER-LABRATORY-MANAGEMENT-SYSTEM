// frontend/src/routes/routeComponents.js
import { lazy } from 'react';
import { lazyWithFallback } from './lazyWithFallback';

// ==================== AUTH PAGES ====================
export const LoginPage = lazy(() => import('../pages/auth/LoginPage/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/auth/RegisterPage/RegisterPage'));
export const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage/ForgotPasswordPage'));
export const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage/ResetPasswordPage'));
export const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage/VerifyEmailPage'));

// ==================== DASHBOARD PAGES ====================
export const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard/AdminDashboard'));
export const LabManagerDashboard = lazy(() => import('../pages/dashboard/LabManagerDashboard/LabManagerDashboard'));
export const TeacherDashboard = lazy(() => import('../pages/dashboard/TeacherDashboard/TeacherDashboard'));
export const DeanDashboard = lazy(() => import('../pages/dashboard/DeanDashboard/DeanDashboard'));
export const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard/StudentDashboard'));
export const LabAssistantDashboard = lazy(() => import('../pages/dashboard/LabAssistantDashboard/LabAssistantDashboard'));
export const ICTDashboard = lazy(() => import('../pages/dashboard/IctDashboard/IctDashboard'));
export const AssetDashboard = lazy(() => import('../pages/dashboard/AssetDashboard/AssetDashboard'));
export const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));

// ==================== SCHEDULE PAGES ====================
export const BookLabPage = lazyWithFallback(() => import('../pages/schedules/BookLabPage/BookLabPage'), 'Book Lab');
export const MySchedulesPage = lazyWithFallback(() => import('../pages/schedules/MySchedulesPage/MySchedulesPage'), 'My Schedules');
export const SchedulePendingApprovalsPage = lazyWithFallback(() => import('../pages/schedules/PendingApprovalsPage/PendingApprovalsPage'), 'Schedule Pending Approvals');
export const BatchSchedulePage = lazyWithFallback(() => import('../pages/schedules/BatchSchedulePage/BatchSchedulePage'), 'Batch Schedule');
export const ScheduleCalendarPage = lazyWithFallback(() => import('../pages/schedules/ScheduleCalendarPage/ScheduleCalendarPage'), 'Schedule Calendar');

// ==================== COMPUTER PAGES ====================
export const ComputersPage = lazyWithFallback(() => import('../pages/computers/ComputersPage/ComputersPage'), 'Computers');
export const ComputerDetailPage = lazyWithFallback(() => import('../pages/computers/ComputerDetailPage/ComputerDetailPage'), 'Computer Details');
export const AddComputerPage = lazyWithFallback(() => import('../pages/computers/AddComputerPage/AddComputerPage'), 'Add Computer');
export const ComputerStatusPage = lazyWithFallback(() => import('../pages/computers/ComputerStatusPage/ComputerStatusPage'), 'Computer Status');

// ==================== MAINTENANCE PAGES ====================
export const CreateRequestPage = lazyWithFallback(() => import('../pages/maintenance/CreateRequestPage/CreateRequestPage'), 'Create Request');
export const MaintenancePage = lazyWithFallback(() => import('../pages/maintenance/MaintenancePage/MaintenancePage'), 'Maintenance');
export const RequestDetailPage = lazyWithFallback(() => import('../pages/maintenance/RequestDetailPage/RequestDetailPage'), 'Request Details');
export const MyAssignmentsPage = lazyWithFallback(() => import('../pages/maintenance/MyAssignmentsPage/MyAssignmentsPage'), 'My Assignments');
export const MaintenancePendingApprovalsPage = lazyWithFallback(() => import('../pages/maintenance/PendingMaintenancePage/PendingMaintenancePage'), 'Maintenance Pending Approvals');

// ==================== ATTENDANCE PAGES ====================
export const AttendancePage = lazyWithFallback(() => import('../pages/attendance/AttendancePage/AttendancePage'), 'Attendance');
export const AttendanceListView = lazyWithFallback(() => import('../pages/attendance/AttendanceListView/AttendanceListView'), 'Attendance List');
export const TakeAttendancePage = lazyWithFallback(() => import('../pages/attendance/TakeAttendancePage/TakeAttendancePage'), 'Take Attendance');
export const MyAttendancePage = lazyWithFallback(() => import('../pages/attendance/MyAttendancePage/MyAttendancePage'), 'My Attendance');
export const AttendanceReportPage = lazyWithFallback(() => import('../pages/attendance/AttendanceReportPage/AttendanceReportPage'), 'Attendance Report');
export const AttendanceSummaryPage = lazyWithFallback(() => import('../pages/attendance/AttendanceSummary/AttendanceSummary'), 'Attendance Summary');
export const AttendanceHistoryPage = lazyWithFallback(() => import('../pages/attendance/AttendanceReportPage/AttendanceReportPage'), 'Attendance History');
export const LabAssistantAttendancePage = lazyWithFallback(() => import('../pages/attendance/TakeAttendancePage/TakeAttendancePage'), 'Lab Assistant Attendance');

// ==================== ASSET PAGES ====================
export const EquipmentPage = lazyWithFallback(() => import('../pages/asset/EquipmentPage.jsx'), 'Equipment');
export const RegisterEquipmentPage = lazyWithFallback(() => import('../pages/asset/RegisterEquipment/RegisterEquipment/RegisterEquipment.jsx'),'Register Equipment');
export const AuditPage = lazyWithFallback(() => import('../pages/asset/AuditManagement/AuditList/AuditList.jsx'), 'Audit');
export const AuditHistoryPage = lazyWithFallback(() => import('../pages/asset/AuditManagement/AuditDetails/AuditDetails.jsx'),AuditPage);
export const EquipmentBorrowingPage = lazyWithFallback(() => import('../pages/lab-assistant/EquipmentBorrowingPage/EquipmentBorrowingPage'), 'Equipment Borrowing');

// ==================== USER PAGES ====================
export const UsersPage = lazyWithFallback(() => import('../pages/users/UsersPage/UsersPage'), 'Users');
export const ProfilePage = lazyWithFallback(() => import('../pages/users/ProfilePage/ProfilePage'), 'Profile');
export const SettingsPage = lazyWithFallback(() => import('../pages/users/SettingsPage/SettingsPage'), 'Settings');
export const ChangePasswordPage = lazyWithFallback(() => import('../pages/users/ChangePasswordPage/ChangePasswordPage'), 'Change Password');

// ==================== REPORT PAGES ====================
export const ReportsPage = lazyWithFallback(() => import('../pages/reports/ReportsPage/ReportsPage'), 'Reports');
export const ScheduledReportsPage = lazyWithFallback(() => import('../pages/reports/ScheduledReportsPage/ScheduledReportsPage'), 'Scheduled Reports');
export const ICTReportsPage = lazyWithFallback(() => import('../pages/reports/IctReportsPage/IctReportsPage'), 'ICT Reports');


// ==================== NOT FOUND PAGE ====================
export const NotFoundPage = lazy(() => import('../pages/notFound/NotFoundPage'));