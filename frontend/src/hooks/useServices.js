import { 
  authService,
  dashboardService,
  scheduleService,
  attendanceService,
  assetService,
  userService,
  maintenanceService,
  computerService,
  reportService
} from '../services';

const useServices = () => {
  return {
    auth: authService,
    dashboard: dashboardService,
    schedule: scheduleService,
    attendance: attendanceService,
    asset: assetService,
    user: userService,
    maintenance: maintenanceService,
    computer: computerService,
    report: reportService
  };
};

export default useServices;