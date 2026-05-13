// Export all utilities
export * from './constants';
export * from './validators';
export * from './formatters';
export * from './offlineStorage';
export * from './socket';
export * from './permissions';
export * from './ethiopianCalendar';

// Default export
export default {
  // Constants
  API_CONFIG,
  APP_CONFIG,
  ROLES,
  ROLE_GROUPS,
  STATUS_CODES,
  ATTENDANCE_STATUS,
  EQUIPMENT_STATUS,
  COMPUTER_STATUS,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_STATUS,
  SCHEDULE_STATUS,
  USER_STATUS,
  PAGINATION,
  DATE_FORMATS,
  FILE_UPLOAD,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  
  // Validators
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidStudentId,
  isRequired,
  minLength,
  maxLength,
  isNumber,
  isPositiveNumber,
  isValidDate,
  isFutureDate,
  isPastDate,
  isValidUrl,
  validateForm,
  validationRules,
  
  // Formatters
  formatDate,
  formatDateTime,
  formatTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatDuration,
  timeAgo,
  truncateText,
  capitalize,
  toTitleCase,
  slugify,
  getInitials,
  formatPhone,
  
  // Offline Storage
  openDB,
  saveToStore,
  getFromStore,
  getAllFromStore,
  deleteFromStore,
  clearStore,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  saveOfflineAttendance,
  getOfflineAttendance,
  clearAllOfflineData,
  isOnline,
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  
  // Socket
  socketClient,
  SOCKET_EVENTS,
  
  // Permissions
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAccessibleModules,
  getMenuItems,
  
  // Ethiopian Calendar
  ethiopianMonths,
  toEthiopianDate,
  formatEthiopianDate,
  getCurrentEthiopianDate,
  isValidEthiopianDate
};