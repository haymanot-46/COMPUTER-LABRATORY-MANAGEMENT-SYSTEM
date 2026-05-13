import React from 'react';
import envConfig from '../../config/env';

const FeatureToggle = ({ feature, children, fallback = null }) => {
  const features = {
    offlineMode: envConfig.get('enableOfflineMode'),
    pwa: envConfig.get('enablePWA'),
    analytics: envConfig.get('enableAnalytics'),
    notifications: envConfig.get('enableNotifications'),
    themeSwitch: envConfig.get('allowThemeSwitch')
  };
  
  if (features[feature]) {
    return children;
  }
  
  return fallback;
};

export default FeatureToggle;