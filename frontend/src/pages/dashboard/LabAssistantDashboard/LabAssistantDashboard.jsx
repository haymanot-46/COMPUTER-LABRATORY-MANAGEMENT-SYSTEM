// frontend/src/pages/dashboard/LabAssistantDashboard/LabAssistantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { computerService, equipmentService, scheduleService, attendanceService } from '../../../services';
import { StatCard } from '../../../components/dashboard';
import './LabAssistantDashboard.css';

const LabAssistantDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [computerStatus, setComputerStatus] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 });
  const [notifications, setNotifications] = useState([]);
  const [laboratories, setLaboratories] = useState([]);

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadComputerStatus(),
      loadTodaySchedule(),
      loadEquipmentStatus(),
      loadRecentActivities(),
      loadLaboratories(),
      loadNotifications()
    ]);
    setLoading(false);
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

  const loadTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const schedules = await scheduleService.getAll({ startDate: today, endDate: today });
      if (schedules?.success && schedules.data) {
        const tasks = schedules.data.map(s => ({
          id: s.id,
          lab: s.lab,
          time: `${s.startTime} - ${s.endTime}`,
          course: s.title,
          task: `Prepare ${s.lab} for ${s.title} class`,
          status: 'pending',
          priority: 'medium'
        }));
        setTodayTasks(tasks);
      }
    } catch (error) {
      console.error('Error loading today schedule:', error);
      setTodayTasks([]);
    }
  };

  const loadEquipmentStatus = async () => {
    try {
      const equipment = await equipmentService.getAll();
      if (equipment?.success && equipment.data) {
        const stats = equipment.data.reduce((acc, item) => {
          if (!acc[item.laboratory]) {
            acc[item.laboratory] = { total: 0, working: 0, issues: 0 };
          }
          acc[item.laboratory].total++;
          if (item.status === 'available') acc[item.laboratory].working++;
          if (item.status === 'maintenance' || item.status === 'damaged') acc[item.laboratory].issues++;
          return acc;
        }, {});
        
        const statusList = Object.entries(stats).map(([lab, data]) => ({
          id: lab,
          lab,
          computers: data.total,
          working: data.working,
          issues: data.issues,
          status: data.issues === 0 ? 'good' : data.issues > 5 ? 'critical' : 'warning'
        }));
        setEquipmentStatus(statusList);
      }
    } catch (error) {
      console.error('Error loading equipment status:', error);
      setEquipmentStatus([]);
    }
  };

  const loadLaboratories = async () => {
    try {
      const result = await fetch('/api/laboratories').then(r => r.json());
      if (result?.success) {
        setLaboratories(result.data);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const result = await attendanceService.getMyAttendance();
      if (result?.success && result.data?.records) {
        const activities = result.data.records.slice(0, 5).map(record => ({
          id: record.id,
          user: record.course || 'Student',
          action: `Attendance marked for ${record.course}`,
          time: new Date(record.marked_at).toLocaleString(),
          type: 'attendance'
        }));
        setRecentActivities(activities);
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setRecentActivities([]);
    }
  };

  const loadNotifications = () => {
    const list = [];
    const pendingTasks = todayTasks.filter(t => t.status === 'pending').length;
    const equipmentIssues = equipmentStatus.filter(e => e.status !== 'good').length;
    
    if (pendingTasks > 0) {
      list.push({ id: 1, message: `${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''} for today`, time: 'Just now', read: false, link: '/tasks' });
    }
    if (equipmentIssues > 0) {
      list.push({ id: 2, message: `${equipmentIssues} lab${equipmentIssues > 1 ? 's have' : ' has'} equipment issues`, time: '1 hour ago', read: false, link: '/equipment' });
    }
    setNotifications(list);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => { logout(); navigate('/login'); };
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    setSidebarOpen(false);
    navigate(path);
  };

  const markNotificationAsRead = (id, link) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    navigate(link);
    setShowNotifications(false);
  };

  const handleStartTask = (taskId) => {
    addToast('Task started successfully', 'success');
    setTodayTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'in-progress' } : task));
  };

  const handleCompleteTask = (taskId) => {
    addToast('Task completed successfully', 'success');
    setTodayTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'completed' } : task));
  };

  const statItems = [
    { title: "Today's Labs", value: todayTasks.length.toString(), icon: 'science', color: '#667eea' },
    { title: 'Computers', value: computerStatus.total.toString(), icon: 'computer', color: '#4299e1' },
    { title: 'Available', value: computerStatus.available.toString(), icon: 'check_circle', color: '#10b981' },
    { title: 'Equipment Issues', value: equipmentStatus.filter(e => e.status !== 'good').length.toString(), icon: 'warning', color: '#ef4444' },
    { title: 'Pending Tasks', value: todayTasks.filter(t => t.status === 'pending').length.toString(), icon: 'pending', color: '#f59e0b' },
    { title: 'Labs', value: laboratories.length.toString(), icon: 'science', color: '#8b5cf6' }
  ];

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/lab-assistant', color: '#f59e0b', name: 'dashboard' },
    { label: 'Today\'s Tasks', icon: 'assignment', path: '/tasks', color: '#10b981', name: 'tasks' },
    { label: 'Equipment Status', icon: 'inventory_2', path: '/equipment', color: '#3b82f6', name: 'equipment' },
    { label: 'Take Attendance', icon: 'edit_note', path: '/attendance', color: '#8b5cf6', name: 'attendance' },
    { label: 'Report Issue', icon: 'bug_report', path: '/create-request', color: '#ef4444', name: 'report' },
    { label: 'Borrow Equipment', icon: 'handshake', path: '/lab-assistant/equipment-borrowing', color: '#ec4899', name: 'borrow' },
    { label: 'Lab Schedule', icon: 'calendar_month', path: '/schedule-calendar', color: '#06b6d4', name: 'schedule' },
    { label: 'My Profile', icon: 'person', path: '/profile', color: '#8b5cf6', name: 'profile' }
  ];

 const quickActions = [
    { label: 'Take Attendance', icon: 'edit_note', path: '/attendance', color: '#8b5cf6' },
    { label: 'Check Equipment', icon: 'inventory_2', path: '/equipment', color: '#3b82f6' },
    { label: 'Report Issue', icon: 'bug_report', path: '/create-request', color: '#ef4444' },
    { label: 'Borrow Equipment', icon: 'handshake', path: '/lab-assistant/equipment-borrowing', color: '#ec4899' }, // CHANGE THIS
    { label: 'View Schedule', icon: 'calendar_month', path: '/schedule-calendar', color: '#06b6d4' },
    { label: 'Equipment Report', icon: 'assessment', path: '/reports', color: '#f59e0b' }
];

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTaskStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="task-status pending">⏳ Pending</span>;
      case 'in-progress': return <span className="task-status progress">🔄 In Progress</span>;
      case 'completed': return <span className="task-status completed">✅ Completed</span>;
      default: return <span className="task-status pending">⏳ Pending</span>;
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
    <div className="lab-assistant-dashboard">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>☰</button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo"><span className="material-icons logo-icon">handyman</span><span className="logo-text">CLMS</span><span className="logo-sub">Injibara University</span></div>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar-large">{user?.name?.charAt(0) || 'L'}</div>
          <div className="user-details"><span className="user-name">{user?.name || 'Lab Assistant'}</span><span className="user-role">Lab Assistant</span><span className="user-email">{user?.email || 'labassistant@clms.com'}</span></div>
        </div>
        <div className="sidebar-menu"><h3>Main Menu</h3><div className="menu-items">{menuItems.map((item, index) => (<button key={index} className={`menu-item ${activeMenu === item.name ? 'active' : ''}`} onClick={() => handleNavigation(item.path, item.name)} style={{ borderLeftColor: item.color }}><span className="material-icons menu-icon">{item.icon}</span><span className="menu-label">{item.label}</span><span className="menu-arrow">→</span></button>))}</div></div>
        <div className="sidebar-footer"><div className="date-time"><span className="date">{currentTime.toLocaleDateString()}</span><span className="time">{currentTime.toLocaleTimeString()}</span></div><button className="logout-btn" onClick={() => setShowLogoutModal(true)}><span className="material-icons">logout</span> Logout</button></div>
      </aside>

      <main className="dashboard-main">
        <div className="top-header">
          <div className="header-left"><h1 className="dashboard-title">Lab Assistant Dashboard</h1><p className="dashboard-subtitle">Welcome back, {user?.name || 'Lab Assistant'}! Manage lab equipment and assist faculty.</p></div>
          <div className="header-right">
            <div className="notification-dropdown"><button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}><span className="material-icons">notifications</span>{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}</button>
            {showNotifications && (<div className="dropdown-menu"><div className="dropdown-header"><span>Notifications ({unreadCount})</span><button onClick={markAllAsRead}>Mark all read</button></div>{notifications.map(notif => (<div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => markNotificationAsRead(notif.id, notif.link)}><p>{notif.message}</p><span className="notification-time">{notif.time}</span></div>))}</div>)}</div>
            <div className="user-profile"><div className="user-avatar">{user?.name?.charAt(0) || 'L'}</div><div className="user-info"><span className="user-name">{user?.name || 'Lab Assistant'}</span><span className="user-role">Lab Assistant</span></div></div>
          </div>
        </div>

        <div className="stats-grid">{statItems.map((stat, index) => (<StatCard key={index} {...stat} />))}</div>

        <div className="two-columns">
          <div className="card"><div className="card-header"><h3><span className="material-icons">assignment</span> Today's Assigned Labs</h3><button className="view-all-btn" onClick={() => navigate('/tasks')}>View All →</button></div><div className="card-body">{todayTasks.length === 0 ? (<div className="no-data"><div className="no-data-icon">✅</div><p>No labs assigned for today</p></div>) : (<div className="tasks-list">{todayTasks.map((task) => (<div key={task.id} className="task-item"><div className="task-header"><div className="task-lab"><span className="material-icons">science</span><strong>{task.lab}</strong></div>{getTaskStatusBadge(task.status)}</div><div className="task-details"><div className="task-time">⏰ {task.time}</div><div className="task-course">📚 {task.course}</div><div className="task-description">📝 {task.task}</div></div><div className="task-actions">{task.status === 'pending' && (<button className="start-task-btn" onClick={() => handleStartTask(task.id)}>▶ Start</button>)}{task.status === 'in-progress' && (<button className="complete-task-btn" onClick={() => handleCompleteTask(task.id)}>✓ Complete</button>)}{task.status === 'completed' && (<span className="completed-badge">✓ Completed</span>)}</div></div>))}</div>)}</div></div>

          <div className="card"><div className="card-header"><h3><span className="material-icons">inventory_2</span> Equipment Status</h3><button className="view-all-btn" onClick={() => navigate('/equipment')}>View Details →</button></div><div className="card-body"><div className="equipment-list">{equipmentStatus.map((eq) => (<div key={eq.id} className="equipment-item"><div className="equipment-header"><span className="equipment-lab">{eq.lab}</span><span className={`equipment-status-badge ${eq.status}`}>{eq.status === 'good' && '✅ Good'}{eq.status === 'warning' && '⚠️ Warning'}{eq.status === 'critical' && '🔴 Critical'}</span></div><div className="equipment-stats"><span>🖥️ Total: {eq.computers}</span><span>✅ Working: {eq.working}</span><span>🔧 Issues: {eq.issues}</span></div><div className="equipment-progress"><div className="progress-fill" style={{ width: `${(eq.working / eq.computers) * 100}%`, backgroundColor: getStatusColor(eq.status) }}></div></div></div>))}</div></div></div>
        </div>

        <div className="quick-actions-container"><h3>⚡ Quick Actions</h3><div className="quick-actions-grid">{quickActions.map((action, index) => (<button key={index} className="quick-action-card" onClick={() => navigate(action.path)}><span className="material-icons quick-action-icon">{action.icon}</span><span className="quick-action-label">{action.label}</span></button>))}</div></div>

        <div className="role-info-card"><div className="role-icon"><span className="material-icons">handyman</span></div><div className="role-info"><h4>Lab Assistant Responsibilities</h4><div className="role-grid"><div className="role-section"><h5>✅ Handles:</h5><ul><li>🔬 Prepare labs for classes</li><li>📊 Check equipment status</li><li>📝 Take attendance</li><li>🔧 Report technical issues</li><li>📦 Borrow equipment</li></ul></div><div className="role-section"><h5>❌ Does NOT Handle:</h5><ul><li>👥 User management</li><li>📅 Schedule approvals</li><li>🔧 Complex repairs (ICT)</li><li>💰 Financial reports</li></ul></div></div></div></div>
      </main>

      {showLogoutModal && (<div className="modal-overlay" onClick={() => setShowLogoutModal(false)}><div className="modal-content"><div className="modal-header"><h3>Confirm Logout</h3><button className="modal-close" onClick={() => setShowLogoutModal(false)}>×</button></div><div className="modal-body"><div className="logout-icon-large">🚪</div><p>Are you sure you want to logout?</p></div><div className="modal-footer"><button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button><button className="confirm-btn" onClick={handleLogout}>Logout</button></div></div></div>)}
    </div>
  );
};

export default LabAssistantDashboard;