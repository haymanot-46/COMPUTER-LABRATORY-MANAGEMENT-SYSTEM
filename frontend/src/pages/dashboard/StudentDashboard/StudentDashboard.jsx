// frontend/src/pages/dashboard/StudentDashboard/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { StatCard } from '../../../components/dashboard';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isStudent } = useRole();
  const { addToast } = useNotification();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [profileImage, setProfileImage] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your attendance for Database Systems has been recorded', time: '5 min ago', read: false, link: '/my-attendance' },
    { id: 2, message: 'New lab schedule available for Computer Networks', time: '1 hour ago', read: false, link: '/my-schedules' },
    { id: 3, message: 'Maintenance request #123 has been resolved', time: '2 hours ago', read: true, link: '/maintenance' },
    { id: 4, message: 'Lab 101 will be closed for maintenance', time: '1 day ago', read: true, link: '/schedule-calendar' }
  ]);

  useEffect(() => {
    // Load profile image from user object or localStorage
    if (user?.profile_image) {
      setProfileImage(user.profile_image);
    } else {
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
    
    setStats({
      attendance: '85%',
      labSessions: '12',
      completedLabs: '10',
      absences: '2'
    });
    loadUpcomingSessions();
    loadRecentAttendance();
    setLoading(false);
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [user]);

  const loadUpcomingSessions = () => {
    setUpcomingSessions([
      { id: 1, date: 'Apr 15, 2026', time: '10:00 AM - 12:00 PM', course: 'Database Systems', lab: 'Lab 101' },
      { id: 2, date: 'Apr 16, 2026', time: '2:00 PM - 4:00 PM', course: 'Computer Networks', lab: 'Lab 102' },
      { id: 3, date: 'Apr 18, 2026', time: '9:00 AM - 11:00 AM', course: 'Software Engineering', lab: 'Lab 103' },
    ]);
  };

  const loadRecentAttendance = () => {
    setRecentAttendance([
      { id: 1, date: 'Apr 10, 2026', course: 'Database Systems', status: 'Present' },
      { id: 2, date: 'Apr 9, 2026', course: 'Computer Networks', status: 'Present' },
      { id: 3, date: 'Apr 8, 2026', course: 'Software Engineering', status: 'Absent' },
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

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    setSidebarOpen(false);
    navigate(path);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  // Function to get avatar display (image or initials)
  const getAvatarDisplay = () => {
    if (profileImage) {
      return (
        <img 
          src={profileImage} 
          alt={user?.name || 'Student'} 
          className="user-avatar-img"
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      );
    }
    return user?.name?.charAt(0) || 'S';
  };

  // Function to get sidebar avatar
  const getSidebarAvatar = () => {
    if (profileImage) {
      return (
        <img 
          src={profileImage} 
          alt={user?.name || 'Student'} 
          className="user-avatar-large-img"
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
        />
      );
    }
    return user?.name?.charAt(0) || 'S';
  };

  const statItems = [
    { title: 'Attendance', value: stats?.attendance || '85%', icon: '📊', color: '#48bb78', trend: 2, changeType: 'up' },
    { title: 'Lab Sessions', value: stats?.labSessions || '12', icon: '🔬', color: '#667eea', trend: 0, changeType: 'neutral' },
    { title: 'Completed Labs', value: stats?.completedLabs || '10', icon: '✅', color: '#4299e1', trend: 1, changeType: 'up' },
    { title: 'Absences', value: stats?.absences || '2', icon: '❌', color: '#e53e3e', trend: -1, changeType: 'down' },
  ];

  // Sidebar Menu Items
  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard/student', color: '#f59e0b', name: 'dashboard' },
    { label: 'My Schedule', icon: '📅', path: '/my-schedules', color: '#10b981', name: 'schedule' },
    { label: 'My Attendance', icon: '📋', path: '/my-attendance', color: '#3b82f6', name: 'attendance' },
    { label: 'Schedule Calendar', icon: '📆', path: '/schedule-calendar', color: '#ec4899', name: 'calendar' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#8b5cf6', name: 'profile' }
  ];

  // Quick Actions
  const quickActions = [
    { label: 'View Schedule', icon: '📅', path: '/my-schedules', color: '#10b981' },
    { label: 'Check Attendance', icon: '📋', path: '/my-attendance', color: '#3b82f6' },
    { label: 'View Calendar', icon: '📆', path: '/schedule-calendar', color: '#ec4899' },
    { label: 'View Profile', icon: '👤', path: '/profile', color: '#8b5cf6' }
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Present': return 'status-present';
      case 'Absent': return 'status-absent';
      case 'Late': return 'status-late';
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
    <div className="student-dashboard">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar Menu */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">CLMS</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        {/* User Info in Sidebar with Profile Photo */}
        <div className="sidebar-user">
          <div className="user-avatar-large">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={user?.name || 'Student'} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              user?.name?.charAt(0) || 'S'
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Student User'}</span>
            <span className="user-role">Student</span>
            <span className="user-email">{user?.email || 'student@clms.com'}</span>
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
        {/* Top Header with Profile Photo */}
        <div className="top-header">
          <div className="header-left">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Student'}! Here's your academic overview.</p>
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

            {/* User Profile with Photo */}
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="user-avatar">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={user?.name || 'Student'} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.name?.charAt(0) || 'S'
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Student User'}</span>
                <span className="user-role">Student</span>
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

        {/* Two Column Layout */}
        <div className="two-columns">
          <div className="card">
            <div className="card-header">
              <h3>📅 Upcoming Lab Sessions</h3>
              <button className="view-all-btn" onClick={() => navigate('/my-schedules')}>View All →</button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Course</th>
                      <th>Lab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingSessions.map((session) => (
                      <tr key={session.id} onClick={() => navigate('/my-schedules')} style={{ cursor: 'pointer' }}>
                        <td>{session.date}</td>
                        <td>{session.time}</td>
                        <td><strong>{session.course}</strong></td>
                        <td>{session.lab}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>📊 Recent Attendance</h3>
              <button className="view-all-btn" onClick={() => navigate('/my-attendance')}>View Full Report →</button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((record) => (
                      <tr key={record.id} onClick={() => navigate('/my-attendance')} style={{ cursor: 'pointer' }}>
                        <td>{record.date}</td>
                        <td>{record.course}</td>
                        <td className={getStatusClass(record.status)}>{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default StudentDashboard;