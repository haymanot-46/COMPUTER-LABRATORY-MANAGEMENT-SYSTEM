import useAuth from './useAuth';

const useRole = () => {
  const { user } = useAuth();

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole(['admin']);
  const isTeacher = () => hasRole(['teacher']);
  const isStudent = () => hasRole(['student']);
  const isLabManager = () => hasRole(['lab-manager']);
  const isDean = () => hasRole(['dean']);
  const isLabAssistant = () => hasRole(['lab-assistant']);
  const isICT = () => hasRole(['ict']);
  const isAsset = () => hasRole(['asset']);

  return {
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
    isLabManager,
    isDean,
    isLabAssistant,
    isICT,
    isAsset,
    role: user?.role,
    userRole: user?.role,
    userName: user?.name,
    userEmail: user?.email
  };
};

export default useRole;