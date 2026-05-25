// frontend/src/pages/dashboard/LabManagerDashboard/LabManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { dashboardService, scheduleService, maintenanceService, computerService, contactService } from '../../../services';
import { StatCard } from '../../../components/dashboard';
import './LabMangenerDashboard.css';

const LabManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isLabManager } = useRole();
  const { addToast } = useNotification();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [labUtilization, setLabUtilization] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [recentActivities, setRecentActivities] = useState([]);
  const [computerStatus, setComputerStatus] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 });
  const [notifications, setNotifications] = useState([]);
  const [unreadContactCount, setUnreadContactCount] = useState(0);

  useEffect(() => {
    loadAllData();
    loadUnreadContactCount();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const messageTimer = setInterval(() => loadUnreadContactCount(), 30000); // Refresh every 30 seconds
    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadDashboardStats(),
      loadPendingApprovals(),
      loadLabUtilization(),
      loadRecentActivities(),
      loadComputerStatus(),
      loadNotifications()
    ]);
    setLoading(false);
  };

  const loadUnreadContactCount = async () => {
    try {
      const data = await contactService.getMessages('pending');
      if (data.success) {
        setUnreadContactCount(data.data.length);
      }
    } catch (error) {
      console.error('Error fetching unread contact count:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const computers = await computerService.getAll();
      const totalComputers = computers?.data?.length || 0;
      
      const available = computers?.data?.filter(c => c.status === 'available' || c.status === 'active').length || 0;
      const inUse = computers?.data?.filter(c => c.status === 'in-use' || c.status === 'occupied').length || 0;
      const maintenance = computers?.data?.filter(c => c.status === 'maintenance' || c.status === 'damaged').length || 0;
      
      setComputerStatus({ total: totalComputers, available, inUse, maintenance });
      
      setStats({
        laboratories: 5,
        computers: totalComputers,
        activeSessions: 8,
        maintenance: maintenance,
        totalStudents: 450,
        weeklyBookings: 24
      });
    } catch (error) {
      setStats({
        laboratories: 5,
        computers: 156,
        activeSessions: 8,
        maintenance: 3,
        totalStudents: 450,
        weeklyBookings: 24
      });
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const result = await scheduleService.getPendingApprovals();
      if (result?.success && result.data) {
        setPendingApprovals(result.data);
      } else {
        setPendingApprovals([
          { id: 1, lab: 'Lab 101', course: 'Database Systems', instructor: 'Dr. Abebe Kebede', date: 'Apr 15, 2026', time: '10:00 AM - 12:00 PM', priority: 'high' },
          { id: 2, lab: 'Lab 102', course: 'Computer Networks', instructor: 'Dr. Almaz Wondimu', date: 'Apr 15, 2026', time: '2:00 PM - 4:00 PM', priority: 'medium' },
        ]);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    }
  };

  const loadLabUtilization = () => {
    setLabUtilization([
      { name: 'Lab 101', utilization: 85, students: 35, trend: 'up' },
      { name: 'Lab 102', utilization: 62, students: 28, trend: 'down' },
      { name: 'Lab 103', utilization: 45, students: 22, trend: 'down' },
      { name: 'Lab 104', utilization: 78, students: 32, trend: 'up' },
      { name: 'Lab 105', utilization: 30, students: 15, trend: 'down' },
    ]);
  };

  const loadRecentActivities = async () => {
    try {
      const result = await maintenanceService.getRequests({ limit: 5 });
      if (result?.success && result.data) {
        const activities = result.data.map(req => ({
          id: req.id,
          user: req.requester_name || 'System',
          action: req.status === 'completed' ? `✅ Completed: ${req.title}` : `📝 New: ${req.title}`,
          time: new Date(req.created_at).toLocaleString(),
          type: req.status
        }));
        setRecentActivities(activities);
      } else {
        setRecentActivities([
          { id: 1, user: 'Dr. Abebe', action: 'requested lab booking for Database Systems', time: '10 minutes ago', type: 'booking' },
          { id: 2, user: 'System', action: 'auto-generated weekly utilization report', time: '1 hour ago', type: 'system' },
        ]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadComputerStatus = async () => {
    try {
      const computers = await computerService.getAll();
      if (computers?.success && computers.data) {
        const available = computers.data.filter(c => c.status === 'available' || c.status === 'active').length;
        const inUse = computers.data.filter(c => c.status === 'in-use' || c.status === 'occupied').length;
        const maintenance = computers.data.filter(c => c.status === 'maintenance' || c.status === 'damaged').length;
        setComputerStatus({ total: computers.data.length, available, inUse, maintenance });
      }
    } catch (error) {
      console.error('Error loading computer status:', error);
    }
  };

  const loadNotifications = () => {
    const pendingCount = pendingApprovals.length;
    const list = [];
    if (pendingCount > 0) {
      list.push({
        id: 1,
        message: `${pendingCount} pending schedule approval${pendingCount > 1 ? 's' : ''}`,
        time: 'Just now',
        read: false,
        link: '/pending-approvals'
      });
    }
    if (unreadContactCount > 0) {
      list.push({
        id: 2,
        message: `${unreadContactCount} new contact message${unreadContactCount > 1 ? 's' : ''}`,
        time: 'Just now',
        read: false,
        link: '/lab-manager/messages'
      });
    }
    setNotifications(list);
  };

  const handleApprove = (id) => {
    addToast('Schedule approved successfully', 'success');
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    loadNotifications();
  };

  const handleReject = (id) => {
    addToast('Schedule rejected', 'warning');
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    loadNotifications();
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    setSidebarOpen(false);
    navigate(path);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id, link) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    navigate(link);
    setShowNotifications(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const unreadCount = notifications.filter(n => !n.read).length;

  const statItems = [
    { title: 'Laboratories', value: stats?.laboratories || '5', icon: '🔬', color: '#667eea', trend: 0, changeType: 'neutral' },
    { title: 'Computers', value: stats?.computers || '156', icon: '🖥️', color: '#48bb78', trend: 5, changeType: 'up' },
    { title: 'Active Sessions', value: stats?.activeSessions || '8', icon: '📅', color: '#ed8936', trend: 2, changeType: 'up' },
    { title: 'Maintenance', value: stats?.maintenance || '3', icon: '🔧', color: '#e53e3e', trend: -1, changeType: 'down' },
    { title: 'Total Students', value: stats?.totalStudents || '450', icon: '👨‍🎓', color: '#8b5cf6', trend: 8, changeType: 'up' },
    { title: 'Weekly Bookings', value: stats?.weeklyBookings || '24', icon: '📊', color: '#06b6d4', trend: 3, changeType: 'up' }
  ];

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard/lab-manager', color: '#f59e0b', name: 'dashboard' },
    { label: 'Schedule Calendar', icon: '📅', path: '/schedule-calendar', color: '#10b981', name: 'schedule' },
    { label: 'Pending Approvals', icon: '⏳', path: '/pending-approvals', color: '#3b82f6', name: 'approvals' },
    { label: 'Computers', icon: '🖥️', path: '/computers', color: '#8b5cf6', name: 'computers' },
    { label: 'Maintenance', icon: '🔧', path: '/maintenance', color: '#ef4444', name: 'maintenance' },
    { label: 'Attendance Reports', icon: '📋', path: '/attendance-report', color: '#ec4899', name: 'attendance' },
    { label: 'Equipment', icon: '📦', path: '/equipment', color: '#06b6d4', name: 'equipment' },
    { label: '📧 Contact Messages', icon: '📧', path: '/lab-manager/messages', color: '#ec4899', name: 'messages', badge: unreadContactCount > 0 ? unreadContactCount : null },
    { label: 'Reports', icon: '📊', path: '/reports', color: '#f97316', name: 'reports' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#8b5cf6', name: 'profile' }
  ];

  const quickActions = [
    { label: 'View Schedule', icon: '📅', path: '/schedule-calendar', color: '#10b981' },
    { label: 'Approve Requests', icon: '✅', path: '/pending-approvals', color: '#3b82f6' },
    { label: 'Computer Status', icon: '🖥️', path: '/computers', color: '#8b5cf6' },
    { label: 'View Contact Messages', icon: '📧', path: '/lab-manager/messages', color: '#ec4899' },
    { label: 'View Reports', icon: '📊', path: '/reports', color: '#f59e0b' },
    { label: 'Check Maintenance', icon: '🔧', path: '/maintenance', color: '#ef4444' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#8b5cf6' }
  ];

  const getUtilizationColor = (percent) => {
    if (percent > 70) return '#ef4444';
    if (percent > 50) return '#f59e0b';
    return '#10b981';
  };

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
    <div className="labmanager-dashboard">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🔬</span>
            <span className="logo-text">CLMS</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-large">{user?.name?.charAt(0) || 'L'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Lab Manager'}</span>
            <span className="user-role">Laboratory Manager</span>
            <span className="user-email">{user?.email || 'labmanager@clms.com'}</span>
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
                style={{ borderLeftColor: item.color, position: 'relative' }}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                <span className="menu-arrow">→</span>
                {item.badge && (
                  <span className="menu-badge">{item.badge}</span>
                )}
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
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* Top Header */}
        <div className="top-header">
          <div className="header-left">
            <h1 className="dashboard-title">Laboratory Management Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Lab Manager'}! Monitor and manage all laboratory activities.</p>
          </div>
          <div className="header-right">
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
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => markNotificationAsRead(notif.id, notif.link)}>
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="user-profile">
              <div className="user-avatar">{user?.name?.charAt(0) || 'L'}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Lab Manager'}</span>
                <span className="user-role">Lab Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statItems.map((stat, index) => (<StatCard key={index} {...stat} />))}
        </div>

        {/* Computer Status Summary */}
        <div className="computer-status-summary">
          <div className="status-card total"><div className="status-icon">🖥️</div><div className="status-info"><div className="status-value">{computerStatus.total}</div><div className="status-label">Total Computers</div></div></div>
          <div className="status-card available"><div className="status-icon">✅</div><div className="status-info"><div className="status-value">{computerStatus.available}</div><div className="status-label">Available</div></div></div>
          <div className="status-card in-use"><div className="status-icon">🔄</div><div className="status-info"><div className="status-value">{computerStatus.inUse}</div><div className="status-label">In Use</div></div></div>
          <div className="status-card maintenance"><div className="status-icon">🔧</div><div className="status-info"><div className="status-value">{computerStatus.maintenance}</div><div className="status-label">Maintenance</div></div></div>
        </div>

        {/* Two Column Layout */}
        <div className="two-columns">
          {/* Pending Approvals */}
          <div className="card">
            <div className="card-header">
              <h3>⏳ Pending Approvals</h3>
              <span className="badge">{pendingApprovals.length} pending</span>
            </div>
            <div className="card-body">
              {pendingApprovals.length === 0 ? (
                <div className="no-data"><div className="no-data-icon">✅</div><p>No pending approvals</p></div>
              ) : (
                <div className="approvals-list">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="approval-item">
                      <div className="approval-info">
                        <div className="approval-header">
                          <span className="approval-lab">🔬 {item.lab}</span>
                          <span className={`priority-badge ${getPriorityClass(item.priority)}`}>{item.priority}</span>
                        </div>
                        <div className="approval-details">
                          <span>📚 {item.course}</span>
                          <span>👨‍🏫 {item.instructor}</span>
                          <span>📅 {item.date}</span>
                          <span>⏰ {item.time}</span>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button className="reject-btn" onClick={() => handleReject(item.id)}>✗ Reject</button>
                        <button className="approve-btn" onClick={() => handleApprove(item.id)}>✓ Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lab Utilization */}
          <div className="card">
            <div className="card-header">
              <h3>📊 Laboratory Utilization</h3>
              <button className="view-all-btn" onClick={() => navigate('/schedule-calendar')}>View Details →</button>
            </div>
            <div className="card-body">
              {labUtilization.map((lab, index) => (
                <div key={index} className="utilization-item">
                  <div className="utilization-header">
                    <div className="lab-info">
                      <span className="lab-name">🔬 {lab.name}</span>
                      <span className="lab-students">👥 {lab.students} students</span>
                    </div>
                    <span className={`utilization-percent ${lab.utilization > 70 ? 'high' : lab.utilization > 50 ? 'medium' : 'low'}`}>{lab.utilization}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${lab.utilization}%`, backgroundColor: getUtilizationColor(lab.utilization) }}>
                      <span className="progress-trend">{lab.trend === 'up' ? '↑' : '↓'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <div className="card">
            <div className="card-header"><h3>📋 Recent Activities</h3><button className="view-all-btn" onClick={() => navigate('/reports')}>View All →</button></div>
            <div className="card-body">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.type === 'booking' ? '📅' : activity.type === 'system' ? '⚙️' : activity.type === 'maintenance' ? '🔧' : '✓'}</div>
                  <div className="activity-content"><p><strong>{activity.user}</strong> {activity.action}</p><span className="activity-time">{activity.time}</span></div>
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
              <button key={index} className="quick-action-card" onClick={() => navigate(action.path)}>
                <span className="quick-action-icon">{action.icon}</span>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lab Manager Role Card */}
        <div className="role-info-card">
          <div className="role-icon">🔬</div>
          <div className="role-info">
            <h4>Lab Manager Responsibilities</h4>
            <div className="role-grid">
              <div className="role-section"><h5>✅ Responsibilities:</h5><ul><li>📅 Approve lab schedule requests</li><li>🖥️ Manage computer inventory</li><li>🔧 Oversee maintenance</li><li>📊 Monitor lab utilization</li><li>📋 Generate reports</li><li>📧 Respond to contact messages</li></ul></div>
              <div className="role-section"><h5>❌ Does NOT Handle:</h5><ul><li>👥 User management (Admin only)</li><li>📦 Equipment assets (Asset Manager)</li><li>💰 Financial reports (Admin/Dean)</li></ul></div>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content">
            <div className="modal-header"><h3>Confirm Logout</h3><button className="modal-close" onClick={() => setShowLogoutModal(false)}>×</button></div>
            <div className="modal-body"><div className="logout-icon-large">🚪</div><p>Are you sure you want to logout?</p></div>
            <div className="modal-footer"><button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button><button className="confirm-btn" onClick={handleLogout}>Logout</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabManagerDashboard;