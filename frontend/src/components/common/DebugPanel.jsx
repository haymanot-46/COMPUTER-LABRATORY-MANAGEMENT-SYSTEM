import React from 'react';
import envConfig from '../../config/env';

const DebugPanel = () => {
  if (!envConfig.isDebugMode()) {
    return null;
  }
  
  return (
    <div className="debug-panel">
      <details>
        <summary>Debug Information</summary>
        <pre>
          {JSON.stringify({
            appName: envConfig.get('appName'),
            appVersion: envConfig.get('appVersion'),
            environment: envConfig.get('appEnv'),
            apiUrl: envConfig.getApiUrl(),
            wsUrl: envConfig.getWsUrl(),
            offlineMode: envConfig.get('enableOfflineMode'),
            notifications: envConfig.get('enableNotifications'),
            debugMode: envConfig.isDebugMode(),
            defaultPageSize: envConfig.get('defaultPageSize'),
            maxFileSize: `${envConfig.get('maxFileSize') / 1024 / 1024}MB`,
            notificationDuration: `${envConfig.get('notificationDuration')}ms`,
            offlineSyncInterval: `${envConfig.get('offlineSyncInterval')}ms`
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DebugPanel;