import React from 'react';
import { useRole } from '../../hooks';
import AdminDashboard from './AdminDashboard/AdminDashboard';
import TeacherDashboard from './TeacherDashboard/TeacherDashboard';
import StudentDashboard from './StudentDashboard/StudentDashboard';
import LabManagerDashboard from './LabManagerDashboard/LabManagerDashboard';
import DeanDashboard from './DeanDashboard/DeanDashboard';
import ICTDashboard from './IctDashboard/IctDashboard';
import AssetDashboard from './AssetDashboard/AssetDashboard';
import LabAssistantDashboard from './LabAssistantDashboard/LabAssistantDashboard';

const Dashboard = () => {
  const { role, isAdmin, isTeacher, isStudent, isLabManager, isDean, isICT, isAsset, isLabAssistant } = useRole();

  if (isAdmin()) return <AdminDashboard />;
  if (isTeacher()) return <TeacherDashboard />;
  if (isStudent()) return <StudentDashboard />;
  if (isLabManager()) return <LabManagerDashboard />;
  if (isDean()) return <DeanDashboard />;
  if (isICT()) return <ICTDashboard />;
  if (isAsset()) return <AssetDashboard />;
  if (isLabAssistant()) return <LabAssistantDashboard />;

  return <div>Unknown role: {role}</div>;
};

export default Dashboard;