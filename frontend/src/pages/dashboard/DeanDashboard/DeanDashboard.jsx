// frontend/src/pages/dashboard/DeanDashboard/DeanDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { dashboardService } from '../../../services';
import { StatCard } from '../../../components/dashboard';
import './DeanDashboard.css';

const DeanDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDean } = useRole();
  const { addToast } = useNotification();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New batch schedule request from Computer Science', time: '5 min ago', read: false, link: '/pending-approvals' },
    { id: 2, message: 'Department performance report ready', time: '1 hour ago', read: false, link: '/reports' },
    { id: 3, message: 'Lab utilization increased by 15%', time: '2 hours ago', read: true, link: '/reports' },
    { id: 4, message: 'New course registration completed', time: '1 day ago', read: true, link: '/courses' }
  ]);

  useEffect(() => {
    loadDashboardData();
    loadDepartmentStats();
    loadRecentActivities();
    loadPendingApprovals();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    // REMOVED budget field from stats
    setStats({
      departments: 4,
      students: 1245,
      labUtilization: '72%',
      activeCourses: 28,
      faculty: 45,
      researchProjects: 12,
      publications: 38
      // budget: '4.2M ETB' - REMOVED
    });
    setLoading(false);
  };

  const loadDepartmentStats = () => {
    setDepartmentStats([
      { id: 1, name: 'Computer Science', students: 450, labs: 3, utilization: 85, faculty: 12, courses: 8, trend: 'up' },
      { id: 2, name: 'Software Engineering', students: 320, labs: 2, utilization: 68, faculty: 8, courses: 6, trend: 'up' },
      { id: 3, name: 'Information Technology', students: 380, labs: 2, utilization: 72, faculty: 10, courses: 7, trend: 'down' },
      { id: 4, name: 'Computer Engineering', students: 95, labs: 1, utilization: 55, faculty: 6, courses: 4, trend: 'up' },
    ]);
  };

  const loadRecentActivities = () => {
    setRecentActivities([
      { id: 1, user: 'Dr. Abebe Kebede', action: 'submitted batch schedule for Computer Science department', time: '10 minutes ago', type: 'schedule' },
      { id: 2, user: 'Prof. Almaz Wondimu', action: 'approved research project proposal', time: '1 hour ago', type: 'approval' },
      { id: 3, user: 'System', action: 'generated monthly department report', time: '2 hours ago', type: 'system' },
      { id: 4, user: 'Dr. Biruk Assefa', action: 'requested additional lab equipment', time: '3 hours ago', type: 'request' },
    ]);
  };

  const loadPendingApprovals = () => {
    setPendingApprovals([
      { id: 1, title: 'Batch Schedule Request', department: 'Computer Science', requester: 'Dr. Abebe', date: '2026-04-21', priority: 'high' },
      { id: 2, title: 'Equipment Purchase Request', department: 'Software Engineering', requester: 'Lab Manager', date: '2026-04-20', priority: 'medium' },
      { id: 3, title: 'New Course Approval', department: 'Information Technology', requester: 'Department Head', date: '2026-04-19', priority: 'high' },
      { id: 4, title: 'Lab Expansion Proposal', department: 'Computer Science', requester: 'Dean Office', date: '2026-04-18', priority: 'low' },
    ]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const handleApprove = (id) => {
    addToast('Request approved successfully', 'success');
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
  };

  const handleReject = (id) => {
    addToast('Request rejected', 'warning');
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
  };

  const markNotificationAsRead = (id, link) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    navigate(link);
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    setSidebarOpen(false);
    navigate(path);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // REMOVED budget stat item
  const statItems = [
    { title: 'Departments', value: stats?.departments || '4', icon: '🏛️', color: '#667eea', trend: 0, changeType: 'neutral' },
    { title: 'Students', value: stats?.students || '1,245', icon: '👨‍🎓', color: '#48bb78', trend: 8, changeType: 'up' },
    { title: 'Lab Utilization', value: stats?.labUtilization || '72%', icon: '📊', color: '#ed8936', trend: 3, changeType: 'up' },
    { title: 'Active Courses', value: stats?.activeCourses || '28', icon: '📚', color: '#4299e1', trend: 2, changeType: 'up' },
    { title: 'Faculty', value: stats?.faculty || '45', icon: '👨‍🏫', color: '#8b5cf6', trend: 5, changeType: 'up' }
    // budget stat REMOVED
  ];

  // Sidebar Menu Items for Dean Role - CHANGED Faculty Management to Profile
  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard/dean', color: '#f59e0b', name: 'dashboard' },
    { label: 'Department Overview', icon: '🏛️', path: '/departments', color: '#10b981', name: 'departments' },
    { label: 'Schedule Calendar', icon: '📅', path: '/schedule-calendar', color: '#3b82f6', name: 'schedule' },
    { label: 'Batch Schedule', icon: '📆', path: '/batch-schedule', color: '#8b5cf6', name: 'batch' },
    { label: 'Pending Approvals', icon: '⏳', path: '/pending-approvals', color: '#ef4444', name: 'approvals' },
    { label: 'Reports', icon: '📊', path: '/reports', color: '#06b6d4', name: 'reports' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#ec4899', name: 'profile' }, // CHANGED from Faculty Management
    { label: 'Settings', icon: '⚙️', path: '/settings', color: '#6b7280', name: 'settings' },
  ];

  // Quick Actions
  const quickActions = [
    { label: 'Batch Schedule', icon: '📆', path: '/batch-schedule', color: '#8b5cf6' },
    { label: 'Department Report', icon: '📊', path: '/reports', color: '#3b82f6' },
    { label: 'View Schedule', icon: '📅', path: '/schedule-calendar', color: '#10b981' },
    { label: 'Approve Requests', icon: '✅', path: '/pending-approvals', color: '#ef4444' },
    { label: 'View Profile', icon: '👤', path: '/profile', color: '#ec4899' },
    { label: 'Settings', icon: '⚙️', path: '/settings', color: '#f59e0b' },
  ];

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dean-dashboard">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar Menu */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">CLMS</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        {/* User Info in Sidebar */}
        <div className="sidebar-user">
          <div className="user-avatar-large">{user?.name?.charAt(0) || 'D'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Dean User'}</span>
            <span className="user-role">Dean of Faculty</span>
            <span className="user-email">{user?.email || 'dean@clms.com'}</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <h3>Main Menu</h3>
          <div className="menu-items">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`menu-item ${activeMenu === item.name ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path, item.name)}
                style={{ borderLeftColor: item.color }}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                <span className="menu-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="date-time">
            <span className="date">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="time">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <div className="top-header">
          <div className="header-left">
            <h1 className="dashboard-title">Dean Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Dean'}! Overview of faculty and department performance.</p>
          </div>
          <div className="header-right">
            {/* Notifications */}
            <div className="notification-dropdown">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span>Notifications ({unreadCount} unread)</span>
                    <button className="mark-all-read" onClick={markAllAsRead}>Mark all read</button>
                  </div>
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`} 
                      onClick={() => markNotificationAsRead(notif.id, notif.link)}
                    >
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="user-avatar">{user?.name?.charAt(0) || 'D'}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Dean User'}</span>
                <span className="user-role">Dean</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Budget stat removed */}
        <div className="stats-grid">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="two-columns">
          {/* Department Performance Table */}
          <div className="card">
            <div className="card-header">
              <h3>📊 Department Performance</h3>
              <button className="view-all-btn" onClick={() => navigate('/departments')}>View All →</button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="department-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Students</th>
                      <th>Labs</th>
                      <th>Faculty</th>
                      <th>Utilization</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((dept) => (
                      <tr key={dept.id}>
                        <td><strong>{dept.name}</strong></td>
                        <td>{dept.students}</td>
                        <td>{dept.labs}</td>
                        <td>{dept.faculty}</td>
                        <td className="utilization-cell">
                          <div className="utilization-bar">
                            <div 
                              className={`utilization-fill ${dept.utilization > 70 ? 'high' : dept.utilization > 50 ? 'medium' : 'low'}`}
                              style={{ width: `${dept.utilization}%` }}
                            ></div>
                          </div>
                          <span>{dept.utilization}%</span>
                        </td>
                        <td>
                          <span className={`status-badge ${dept.utilization > 70 ? 'status-good' : 'status-warning'}`}>
                            {dept.utilization > 70 ? 'Excellent' : dept.utilization > 50 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="card">
            <div className="card-header">
              <h3>⏳ Pending Approvals</h3>
              <span className="badge">{pendingApprovals.length} pending</span>
            </div>
            <div className="card-body">
              {pendingApprovals.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-icon">✅</div>
                  <p>No pending approvals</p>
                </div>
              ) : (
                <div className="approvals-list">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="approval-item">
                      <div className="approval-info">
                        <div className="approval-header">
                          <span className="approval-title">{item.title}</span>
                          <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="approval-details">
                          <span>🏛️ {item.department}</span>
                          <span>👤 {item.requester}</span>
                          <span>📅 {item.date}</span>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button className="approve-btn" onClick={() => handleApprove(item.id)}>✓ Approve</button>
                        <button className="reject-btn" onClick={() => handleReject(item.id)}>✗ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <div className="card">
            <div className="card-header">
              <h3>📋 Recent Activities</h3>
              <button className="view-all-btn" onClick={() => navigate('/reports')}>View All →</button>
            </div>
            <div className="card-body">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'schedule' && '📅'}
                    {activity.type === 'approval' && '✓'}
                    {activity.type === 'system' && '⚙️'}
                    {activity.type === 'request' && '📝'}
                  </div>
                  <div className="activity-content">
                    <p><strong>{activity.user}</strong> {activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-container">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-card"
                onClick={() => navigate(action.path)}
              >
                <span className="quick-action-icon">{action.icon}</span>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="modal-close" onClick={() => setShowLogoutModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="logout-icon-large">🚪</div>
              <p>Are you sure you want to logout?</p>
              <p className="modal-subtitle">You will need to login again to access your dashboard.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeanDashboard;