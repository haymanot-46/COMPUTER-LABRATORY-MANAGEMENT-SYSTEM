// frontend/src/pages/dashboard/IctDashboard/IctDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../../hooks';
import { maintenanceService, computerService } from '../../../services';
import { StatCard } from '../../../components/dashboard';
import './IctDashboard.css';

const ICTDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [computerStatus, setComputerStatus] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadStatistics(),
      loadPendingApprovals(),
      loadRecentActivities(),
      loadComputerStatus(),
      loadNotifications()
    ]);
    setLoading(false);
  };

  const loadStatistics = async () => {
    try {
      const computers = await computerService.getAll();
      const totalComputers = computers?.data?.length || 0;

      const maintenanceStats = await maintenanceService.getStatistics();
      setStats({
        totalComputers,
        submitted: maintenanceStats?.data?.submitted || 0,
        inProgress: maintenanceStats?.data?.inProgress || 0,
        completed: maintenanceStats?.data?.completed || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalComputers: 0,
        submitted: 0,
        inProgress: 0,
        completed: 0
      });
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const result = await maintenanceService.getRequests({ status: 'submitted' });
      if (result?.success && result.data) {
        setPendingApprovals(result.data);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const result = await maintenanceService.getRequests({ limit: 5 });
      if (result?.success && result.data) {
        const activities = result.data.map(req => ({
          id: req.id,
          user: req.requester_name || 'System',
          action: `${req.status === 'completed' ? '✅ Completed' : req.status === 'in-progress' ? '🔄 Working on' : '📝 New'} : ${req.title}`,
          time: new Date(req.updated_at || req.created_at).toLocaleString(),
          type: req.status
        }));
        setRecentActivities(activities);
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
        setComputerStatus({
          total: computers.data.length,
          available,
          inUse,
          maintenance
        });
      }
    } catch (error) {
      console.error('Error loading computer status:', error);
    }
  };

  const loadNotifications = async () => {
    const pendingCount = pendingApprovals.length;
    const list = [];
    if (pendingCount > 0) {
      list.push({
        id: 1,
        message: `${pendingCount} maintenance request${pendingCount > 1 ? 's' : ''} pending approval`,
        time: 'Just now',
        read: false,
        link: '/ict/pending-approvals'
      });
    }
    setNotifications(list);
  };

  const handleApprove = async (requestId) => {
    try {
      await maintenanceService.assignTechnician(requestId, user?.id);
      addToast('Request assigned to you successfully', 'success');
      await loadPendingApprovals();
      await loadStatistics();
      await loadNotifications();
    } catch (error) {
      addToast('Failed to assign request', 'error');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await maintenanceService.cancelRequest(requestId, reason);
        addToast('Request rejected', 'warning');
        await loadPendingApprovals();
        await loadStatistics();
        await loadNotifications();
      } catch (error) {
        addToast('Failed to reject request', 'error');
      }
    }
  };

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    setSidebarOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const statItems = [
    { title: 'Total Computers', value: stats?.totalComputers || '0', icon: '🖥️', color: '#4299e1' },
    { title: 'Pending Approval', value: stats?.submitted || '0', icon: '⏳', color: '#f59e0b' },
    { title: 'In Progress', value: stats?.inProgress || '0', icon: '🔄', color: '#3b82f6' },
    { title: 'Completed', value: stats?.completed || '0', icon: '✅', color: '#10b981' }
  ];

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard/ict', color: '#f59e0b', name: 'dashboard' },
    { label: 'Pending Approvals', icon: '⏳', path: '/ict/pending-approvals', color: '#ef4444', name: 'approvals' },
    { label: 'Maintenance', icon: '🔧', path: '/maintenance', color: '#3b82f6', name: 'maintenance' },
    { label: 'Computer Status', icon: '📊', path: '/computer-status', color: '#8b5cf6', name: 'status' },
    { label: 'Reports', icon: '📊', path: '/ict/reports', color: '#ec4899', name: 'reports' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#8b5cf6', name: 'profile' }
  ];

  const quickActions = [
    { label: 'Pending Approvals', icon: '⏳', path: '/ict/pending-approvals', color: '#ef4444' },
    { label: 'View Maintenance', icon: '🔧', path: '/maintenance', color: '#3b82f6' },
    { label: 'Computer Status', icon: '📊', path: '/computer-status', color: '#8b5cf6' },
    { label: 'Generate Report', icon: '📊', path: '/ict/reports', color: '#ec4899' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#8b5cf6' }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ict-dashboard">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>☰</button>

      {/* Sidebar Menu */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">💻</span>
            <span className="logo-text">CLMS</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-large">{user?.name?.charAt(0) || 'I'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">ICT Technician</span>
            <span className="user-email">{user?.email}</span>
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
            <span className="date">{currentTime.toLocaleDateString()}</span>
            <span className="time">{currentTime.toLocaleTimeString()}</span>
          </div>
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <div className="top-header">
          <div className="header-left">
            <h1 className="dashboard-title">ICT Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {user?.name || 'ICT Technician'}! Monitor and manage computer maintenance.
            </p>
          </div>

          <div className="header-right">
            {/* Notifications Dropdown */}
            <div className="notification-dropdown">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span>Notifications ({unreadCount})</span>
                    <button className="mark-all-read" onClick={markAllAsRead}>Mark all read</button>
                  </div>
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => navigate(notif.link)}
                    >
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="user-profile">
              <div className="user-avatar">{user?.name?.charAt(0) || 'I'}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'ICT Technician'}</span>
                <span className="user-role">ICT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Pending Approvals Section */}
        {pendingApprovals.length > 0 && (
          <div className="card pending-card">
            <div className="card-header">
              <h3>🔧 Pending Maintenance Requests</h3>
              <span className="badge">{pendingApprovals.length} pending</span>
            </div>
            <div className="card-body">
              {pendingApprovals.map((request) => (
                <div key={request.id} className="approval-item">
                  <div className="approval-info">
                    <div className="approval-header">
                      <span className="approval-title">{request.title}</span>
                      <span className={`priority-badge ${request.priority === 'high' ? 'priority-high' : request.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                        {request.priority || 'medium'}
                      </span>
                    </div>
                    <div className="approval-details">
                      <span>👤 {request.requester_name || 'Unknown'}</span>
                      <span>🖥️ {request.computer_name || 'N/A'}</span>
                      <span>📅 {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="approval-description">
                      {request.description?.substring(0, 100)}...
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="reject-btn" onClick={() => handleReject(request.id)}>
                      ✗ Reject
                    </button>
                    <button className="approve-btn" onClick={() => handleApprove(request.id)}>
                      ✓ Assign to Me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Computer Status Summary */}
        <div className="computer-status-summary">
          <div className="status-card">
            <div className="status-icon">🖥️</div>
            <div className="status-info">
              <div className="status-value">{computerStatus.total}</div>
              <div className="status-label">Total Computers</div>
            </div>
          </div>
          <div className="status-card available">
            <div className="status-icon">✅</div>
            <div className="status-info">
              <div className="status-value">{computerStatus.available}</div>
              <div className="status-label">Available</div>
            </div>
          </div>
          <div className="status-card in-use">
            <div className="status-icon">🔄</div>
            <div className="status-info">
              <div className="status-value">{computerStatus.inUse}</div>
              <div className="status-label">In Use</div>
            </div>
          </div>
          <div className="status-card maintenance">
            <div className="status-icon">🔧</div>
            <div className="status-info">
              <div className="status-value">{computerStatus.maintenance}</div>
              <div className="status-label">Maintenance</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-columns">
          <div className="card">
            <div className="card-header">
              <h3>📋 Recent Maintenance Activities</h3>
              <button className="view-all-btn" onClick={() => navigate('/maintenance')}>View All →</button>
            </div>
            <div className="card-body">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'completed' ? '✅' : activity.type === 'in-progress' ? '🔄' : '📝'}
                  </div>
                  <div className="activity-content">
                    <p><strong>{activity.user}</strong> {activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>💚 System Health</h3>
              <span className="status-badge online">All Systems Operational</span>
            </div>
            <div className="card-body">
              <div className="health-grid">
                <div className="health-item">
                  <div className="health-icon">🗄️</div>
                  <div className="health-info">
                    <div className="health-label">Database</div>
                    <div className="health-status online">🟢 Operational</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">💾</div>
                  <div className="health-info">
                    <div className="health-label">Storage</div>
                    <div className="health-status warning">⚠️ 78% Used</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">📦</div>
                  <div className="health-info">
                    <div className="health-label">Backup</div>
                    <div className="health-status online">🟢 Running</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">🌐</div>
                  <div className="health-info">
                    <div className="health-label">Network</div>
                    <div className="health-status online">🟢 Connected</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">🔒</div>
                  <div className="health-info">
                    <div className="health-label">Security</div>
                    <div className="health-status online">🟢 No Alerts</div>
                  </div>
                </div>
              </div>
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

        {/* Role Information Card */}
        <div className="role-info-card">
          <div className="role-icon">🔧</div>
          <div className="role-info">
            <h4>ICT Technician Responsibilities</h4>
            <div className="role-grid">
              <div className="role-section">
                <h5>✅ Handles:</h5>
                <ul>
                  <li>🔧 Computer hardware issues</li>
                  <li>💻 Software installation & updates</li>
                  <li>🌐 Network connectivity problems</li>
                  <li>💾 System backup & storage</li>
                </ul>
              </div>
              <div className="role-section">
                <h5>❌ Does NOT Handle:</h5>
                <ul>
                  <li>📅 Lab schedule bookings</li>
                  <li>📦 Equipment asset management</li>
                  <li>👥 User management</li>
                  <li>✓ Schedule approvals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="modal-close" onClick={() => setShowLogoutModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="logout-icon-large">🚪</div>
              <p>Are you sure you want to logout?</p>
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

export default ICTDashboard;