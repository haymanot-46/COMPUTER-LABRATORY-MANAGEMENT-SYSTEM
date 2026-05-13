import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services';
import './Sidebar.css';

const Sidebar = ({ collapsed, mobileOpen, onCloseMobile, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { icon: '📊', label: 'Dashboard', path: `/${userRole}/dashboard` },
    ];

    const roleBasedItems = {
      admin: [
        { icon: '👥', label: 'Users', path: '/users' },
        { icon: '🖥️', label: 'Computers', path: '/computers' },
        { icon: '📅', label: 'Schedules', path: '/schedule-calendar' },
        { icon: '🔧', label: 'Maintenance', path: '/maintenance' },
        { icon: '📦', label: 'Assets', path: '/equipment' },
        { icon: '📊', label: 'Reports', path: '/reports' },
        { icon: '⚙️', label: 'Settings', path: '/settings' },
      ],
      teacher: [
        { icon: '📅', label: 'My Schedule', path: '/schedule-calendar' },
        { icon: '📝', label: 'Attendance', path: '/attendance-report' },
        { icon: '📖', label: 'Book Lab', path: '/book-lab' },
        { icon: '🔧', label: 'Report Issue', path: '/create-request' },
        { icon: '👤', label: 'Profile', path: '/profile' },
      ],
      student: [
        { icon: '📅', label: 'My Schedule', path: '/my-schedules' },
        { icon: '📝', label: 'My Attendance', path: '/my-attendance' },
        { icon: '🔧', label: 'Report Issue', path: '/create-request' },
        { icon: '👤', label: 'Profile', path: '/profile' },
      ],
      'lab-manager': [
        { icon: '📅', label: 'Schedules', path: '/schedule-calendar' },
        { icon: '🖥️', label: 'Computers', path: '/computers' },
        { icon: '🔧', label: 'Maintenance', path: '/maintenance' },
        { icon: '📦', label: 'Assets', path: '/equipment' },
        { icon: '⏳', label: 'Approvals', path: '/pending-approvals' },
      ],
      dean: [
        { icon: '📅', label: 'Schedules', path: '/schedule-calendar' },
        { icon: '📊', label: 'Reports', path: '/reports' },
        { icon: '📦', label: 'Batch Schedule', path: '/batch-schedule' },
      ],
      ict: [
        { icon: '🖥️', label: 'Computers', path: '/computers' },
        { icon: '🔧', label: 'Maintenance', path: '/maintenance' },
        { icon: '📋', label: 'My Assignments', path: '/my-assignments' },
        { icon: '📊', label: 'Status', path: '/computer-status' },
      ],
      asset: [
        { icon: '📦', label: 'Equipment', path: '/equipment' },
        { icon: '📋', label: 'Audits', path: '/audit-history' },
        { icon: '📊', label: 'Reports', path: '/reports' },
      ],
      'lab-assistant': [
        { icon: '📝', label: 'Attendance', path: '/attendance' },
        { icon: '📦', label: 'Equipment', path: '/equipment' },
        { icon: '🔧', label: 'Report Issue', path: '/create-request' },
      ],
    };

    const items = roleBasedItems[userRole] || roleBasedItems.student;
    return [...commonItems, ...items];
  };

  const navItems = getNavItems();

  const sidebarClass = `sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`;

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile}></div>}
      
      <aside className={sidebarClass}>
        <div className="sidebar-logo">
          <span className="logo-icon">🖥️</span>
          {!collapsed && <span className="logo-text">CLMS</span>}
          {!collapsed && <span className="logo-version">v2.0</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                if (mobileOpen) onCloseMobile();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </a>
          ))}

          <div className="nav-divider"></div>

          <button
            className="change-password-btn"
            onClick={() => navigate('/change-password')}
          >
            <span className="btn-icon">🔐</span>
            {!collapsed && <span>Change Password</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{userRole || 'User'}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;