class EnvConfig {
  constructor() {
    this.config = {
      appName: import.meta.env.VITE_APP_NAME || 'CLMS',
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      appEnv: import.meta.env.VITE_APP_ENV || 'development',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5001',
      enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
      enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
      enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
      allowThemeSwitch: import.meta.env.VITE_ALLOW_THEME_SWITCH === 'true',
      defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
      maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
      notificationDuration: parseInt(import.meta.env.VITE_NOTIFICATION_DURATION) || 5000,
      offlineSyncInterval: parseInt(import.meta.env.VITE_OFFLINE_SYNC_INTERVAL) || 30000
    };
  }

  get(key) {
    return this.config[key];
  }

  isDevelopment() {
    return this.config.appEnv === 'development';
  }

  isProduction() {
    return this.config.appEnv === 'production';
  }

  isStaging() {
    return this.config.appEnv === 'staging';
  }

  isDebugMode() {
    return this.config.enableDebugMode;
  }

  getApiUrl() {
    return this.config.apiUrl;
  }

  getWsUrl() {
    return this.config.wsUrl;
  }
}

export default new EnvConfig();