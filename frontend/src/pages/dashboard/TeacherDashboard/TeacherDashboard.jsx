// frontend/src/pages/dashboard/TeacherDashboard/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { dashboardService } from '../../../services';
import { StatCard } from '../../../components/dashboard';
import './TeaccherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isTeacher } = useRole();
  const { addToast } = useNotification();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New lab schedule request approved', time: '5 min ago', read: false, link: '/schedule-calendar' },
    { id: 2, message: 'Attendance report for Database Systems is ready', time: '1 hour ago', read: false, link: '/attendance-report' },
    { id: 3, message: 'Lab 101 maintenance scheduled', time: '2 hours ago', read: true, link: '/maintenance' },
    { id: 4, message: 'New software update available', time: '1 day ago', read: true, link: '/computers' }
  ]);

  useEffect(() => {
    loadDashboardData();
    loadTodayClasses();
    loadUpcomingClasses();
    loadRecentActivities();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    // Mock data for demonstration
    setStats({
      myClasses: 4,
      totalStudents: 120,
      pendingAttendance: 2,
      labSessions: 6,
      completedLabs: 45,
      attendanceRate: '92%'
    });
    setLoading(false);
  };

  const loadTodayClasses = () => {
    setTodayClasses([
      { id: 1, time: '8:30 AM - 10:30 AM', course: 'Database Systems', code: 'CS311', lab: 'Lab 101', students: 35, status: 'upcoming' },
      { id: 2, time: '11:00 AM - 1:00 PM', course: 'Computer Networks', code: 'CS312', lab: 'Lab 102', students: 30, status: 'upcoming' },
      { id: 3, time: '2:00 PM - 4:00 PM', course: 'Software Engineering', code: 'CS313', lab: 'Lab 103', students: 28, status: 'upcoming' },
    ]);
  };

  const loadUpcomingClasses = () => {
    setUpcomingClasses([
      { id: 4, date: 'Apr 22, 2026', time: '9:00 AM - 11:00 AM', course: 'Web Development', lab: 'Lab 104', students: 32 },
      { id: 5, date: 'Apr 23, 2026', time: '1:00 PM - 3:00 PM', course: 'Data Structures', lab: 'Lab 101', students: 35 },
      { id: 6, date: 'Apr 24, 2026', time: '10:00 AM - 12:00 PM', course: 'Operating Systems', lab: 'Lab 102', students: 30 },
    ]);
  };

  const loadRecentActivities = () => {
    setRecentActivities([
      { id: 1, user: 'Dr. Abebe', action: 'marked attendance for Database Systems lab', time: '2 hours ago', type: 'attendance' },
      { id: 2, user: 'Student', action: 'submitted maintenance request for Computer #45', time: '3 hours ago', type: 'maintenance' },
      { id: 3, user: 'Lab Manager', action: 'approved lab schedule for next week', time: '5 hours ago', type: 'approval' },
      { id: 4, user: 'System', action: 'generated weekly attendance report', time: '1 day ago', type: 'system' },
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

  const statItems = [
    { title: 'My Classes', value: stats?.myClasses || '4', icon: '📚', color: '#667eea', trend: 0, changeType: 'neutral' },
    { title: 'Total Students', value: stats?.totalStudents || '120', icon: '👨‍🎓', color: '#48bb78', trend: 8, changeType: 'up' },
    { title: 'Pending Attendance', value: stats?.pendingAttendance || '2', icon: '⏰', color: '#ed8936', trend: -1, changeType: 'down' },
    { title: 'Lab Sessions', value: stats?.labSessions || '6', icon: '🔬', color: '#4299e1', trend: 2, changeType: 'up' },
    { title: 'Completed Labs', value: stats?.completedLabs || '45', icon: '✅', color: '#10b981', trend: 5, changeType: 'up' },
    { title: 'Attendance Rate', value: stats?.attendanceRate || '92%', icon: '📊', color: '#f59e0b', trend: 3, changeType: 'up' },
  ];

  // Sidebar Menu Items for Teacher Role
  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/teacher/dashboard', color: '#f59e0b', name: 'dashboard' },
    { label: 'My Schedule', icon: '📅', path: '/my-schedules', color: '#10b981', name: 'schedule' },
    { label: 'Book Lab', icon: '🔬', path: '/book-lab', color: '#3b82f6', name: 'booklab' },
    { label: 'Take Attendance', icon: '📋', path: '/attendance', color: '#8b5cf6', name: 'attendance' },
    { label: 'Attendance Report', icon: '📊', path: '/attendance-report', color: '#ec4899', name: 'report' },
    { label: 'Schedule Calendar', icon: '📆', path: '/schedule-calendar', color: '#06b6d4', name: 'calendar' },
    { label: 'Report Issue', icon: '🔧', path: '/create-request', color: '#ef4444', name: 'issue' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#6b7280', name: 'profile' },
  ];

  // Quick Actions
  const quickActions = [
    { label: 'Take Attendance', icon: '📋', path: '/attendance', color: '#8b5cf6' },
    { label: 'Book Lab', icon: '🔬', path: '/book-lab', color: '#3b82f6' },
    { label: 'View Schedule', icon: '📅', path: '/schedule-calendar', color: '#10b981' },
    { label: 'Report Issue', icon: '🔧', path: '/create-request', color: '#ef4444' },
    { label: 'Attendance Report', icon: '📊', path: '/attendance-report', color: '#ec4899' },
    { label: 'My Classes', icon: '📚', path: '/my-schedules', color: '#f59e0b' },
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
    <div className="teacher-dashboard">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar Menu */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">👨‍🏫</span>
            <span className="logo-text">CLMS</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        {/* User Info in Sidebar */}
        <div className="sidebar-user">
          <div className="user-avatar-large">{user?.name?.charAt(0) || 'T'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Teacher User'}</span>
            <span className="user-role">Faculty Member</span>
            <span className="user-email">{user?.email || 'teacher@clms.com'}</span>
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
            <h1 className="dashboard-title">Teacher Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Teacher'}! Manage your classes and lab sessions.</p>
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
              <div className="user-avatar">{user?.name?.charAt(0) || 'T'}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Teacher User'}</span>
                <span className="user-role">Teacher</span>
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
          {/* Today's Classes */}
          <div className="card">
            <div className="card-header">
              <h3>📅 Today's Classes</h3>
              <button className="view-all-btn" onClick={() => navigate('/my-schedules')}>View All →</button>
            </div>
            <div className="card-body">
              {todayClasses.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-icon">📅</div>
                  <p>No classes scheduled for today</p>
                </div>
              ) : (
                <div className="classes-list">
                  {todayClasses.map((class_) => (
                    <div key={class_.id} className="class-item">
                      <div className="class-time">{class_.time}</div>
                      <div className="class-info">
                        <div className="class-header">
                          <span className="class-course">{class_.course}</span>
                          <span className="class-code">{class_.code}</span>
                        </div>
                        <div className="class-details">
                          <span> {class_.lab}</span>
                          <span> {class_.students} students</span>
                        </div>
                      </div>
                      <button 
                           className="attendance-btn"
                           onClick={() => {
                            window.location.href = `/attendance/${class_.id}`;
                           }}
                         >
                           📋 Take Attendance
                         </button>                         
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="card">
            <div className="card-header">
              <h3>📆 Upcoming Classes</h3>
              <button className="view-all-btn" onClick={() => navigate('/schedule-calendar')}>View Calendar →</button>
            </div>
            <div className="card-body">
              <div className="upcoming-list">
                {upcomingClasses.map((class_) => (
                  <div key={class_.id} className="upcoming-item">
                    <div className="upcoming-date">
                      <span className="date-day">{class_.date.split(',')[0]}</span>
                    </div>
                    <div className="upcoming-info">
                      <div className="upcoming-course">{class_.course}</div>
                      <div className="upcoming-details">
                        <span>⏰ {class_.time}</span>
                        <span>🔬 {class_.lab}</span>
                        <span>👥 {class_.students} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    {activity.type === 'attendance' && '📋'}
                    {activity.type === 'maintenance' && '🔧'}
                    {activity.type === 'approval' && '✓'}
                    {activity.type === 'system' && '⚙️'}
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

export default TeacherDashboard;