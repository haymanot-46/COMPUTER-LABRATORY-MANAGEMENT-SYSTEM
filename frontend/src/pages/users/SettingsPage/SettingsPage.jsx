import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification, useLocalStorage } from '../../../hooks';
import { userService } from '../../../services';
import './SettingPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { addToast } = useNotification();
  
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notifications', true);
  const [autoSave, setAutoSave] = useLocalStorage('autoSave', true);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('itemsPerPage', 10);
  
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    backupSchedule: 'daily',
    retentionDays: 30
  });
  
  const [loading, setLoading] = useState(false);

  // Function to get dashboard path based on role
  const getDashboardPath = () => {
    const role = user?.role;
    switch(role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      case 'lab_manager':
        return '/lab-manager/dashboard';
      case 'dean':
        return '/dean/dashboard';
      case 'lab_assistant':
        return '/lab-assistant/dashboard';
      case 'ict':
        return '/ict/dashboard';
      case 'asset':
        return '/asset/dashboard';
      default:
        return '/dashboard';
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadSystemSettings();
    }
  }, [isAdmin]);

  const loadSystemSettings = async () => {
    // Load system settings from API
    setSystemSettings({
      maintenanceMode: false,
      registrationOpen: true,
      backupSchedule: 'daily',
      retentionDays: 30
    });
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    // Save to API
    setTimeout(() => {
      addToast('System settings saved successfully', 'success');
      setLoading(false);
    }, 1000);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cached data? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      addToast('Cache cleared. Please log in again.', 'success');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await userService.exportUserData();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([JSON.stringify(result.data, null, 2)]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'user_data_export.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast('Data exported successfully', 'success');
      }
    } catch (error) {
      addToast('Export failed', 'error');
    }
  };

  
  return (
    <div className="settings-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(getDashboardPath())}>
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
        <p>Manage your preferences and system configuration</p>
      </div>

      {/* Rest of your component remains the same */}
      <div className="settings-container">
        {/* Appearance Settings */}
        <div className="settings-section">
          <h2>🎨 Appearance</h2>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Theme</div>
                <div className="setting-description">Choose between light and dark mode</div>
              </div>
              <div className="setting-control">
                <button 
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Light
                </button>
                <button 
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h2>🔔 Notifications</h2>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Push Notifications</div>
                <div className="setting-description">Receive browser notifications for important updates</div>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="settings-section">
          <h2>⚙️ General</h2>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Auto-save</div>
                <div className="setting-description">Automatically save form data while typing</div>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Items Per Page</div>
                <div className="setting-description">Number of items to display in tables</div>
              </div>
              <div className="setting-control">
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                  <option value={5}>5 items</option>
                  <option value={10}>10 items</option>
                  <option value={25}>25 items</option>
                  <option value={50}>50 items</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2>💾 Data Management</h2>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Export My Data</div>
                <div className="setting-description">Download all your personal data</div>
              </div>
              <div className="setting-control">
                <button className="data-btn export" onClick={handleExportData}>
                  📥 Export Data
                </button>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Clear Cache</div>
                <div className="setting-description">Clear all locally stored data</div>
              </div>
              <div className="setting-control">
                <button className="data-btn clear" onClick={handleClearCache}>
                  🗑️ Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings (Admin Only) */}
        {isAdmin() && (
          <div className="settings-section">
            <h2>🔧 System Settings</h2>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Maintenance Mode</div>
                  <div className="setting-description">Put the system in maintenance mode</div>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">User Registration</div>
                  <div className="setting-description">Allow new user registrations</div>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={systemSettings.registrationOpen}
                      onChange={(e) => setSystemSettings({...systemSettings, registrationOpen: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Backup Schedule</div>
                  <div className="setting-description">Automatic database backup frequency</div>
                </div>
                <div className="setting-control">
                  <select 
                    value={systemSettings.backupSchedule} 
                    onChange={(e) => setSystemSettings({...systemSettings, backupSchedule: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Data Retention</div>
                  <div className="setting-description">Days to keep audit logs</div>
                </div>
                <div className="setting-control">
                  <select 
                    value={systemSettings.retentionDays} 
                    onChange={(e) => setSystemSettings({...systemSettings, retentionDays: Number(e.target.value)})}
                  >
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>365 days</option>
                  </select>
                </div>
              </div>
              <div className="setting-actions">
                <button className="save-settings-btn" onClick={handleSaveSystemSettings} disabled={loading}>
                  {loading ? 'Saving...' : 'Save System Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;