import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage/LoginPage';

// Dashboard Pages - All 8 Roles
import AdminDashboard from '../pages/dashboard/AdminDashboard/AdiminDashbord';
import LabManagerDashboard from '../pages/dashboard/LabManagerDashboard/LabManagerDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard/TeacherDashboard';
import DeanDashboard from '../pages/dashboard/DeanDashboard/DeanDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard/StudentDashboard';
import LabAssistantDashboard from '../pages/dashboard/LabAssistantDashboard/LabAssistantDashboard';
import ICTDashboard from '../pages/dashboard/IctDashboard/IctDashboard';
import AssetDashboard from '../pages/dashboard/AssetDashboard/AssetDashboard';

// Protected Route Component
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
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Lab Manager Routes */}
        <Route path="/lab-manager/dashboard" element={
          <ProtectedRoute allowedRoles={['lab-manager']}>
            <LabManagerDashboard />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Dean Routes */}
        <Route path="/dean/dashboard" element={
          <ProtectedRoute allowedRoles={['dean']}>
            <DeanDashboard />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Lab Assistant Routes */}
        <Route path="/lab-assistant/dashboard" element={
          <ProtectedRoute allowedRoles={['lab-assistant']}>
            <LabAssistantDashboard />
          </ProtectedRoute>
        } />
        
        {/* ICT Team Routes */}
        <Route path="/ict/dashboard" element={
          <ProtectedRoute allowedRoles={['ict']}>
            <ICTDashboard />
          </ProtectedRoute>
        } />
        
        {/* Asset Division Routes */}
        <Route path="/asset/dashboard" element={
          <ProtectedRoute allowedRoles={['asset']}>
            <AssetDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;