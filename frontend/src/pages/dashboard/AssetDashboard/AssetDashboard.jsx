// frontend/src/pages/asset/AssetDashboard/AssetDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../../hooks';
import { assetService } from '../../../services';
import StatCard from '../../../pages/asset/StatCard/StatCard';
import StatusBadge from '../../../pages/asset/StatusBadge/StatusBadge';
import './AssetDashboard.css';

const AssetDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  
  const [stats, setStats] = useState({
    totalEquipment: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    damaged: 0,
    retired: 0,
    pendingRequests: 0,
    pendingAudits: 0,
    totalValue: 0,
    categoriesCount: 0,
    labsCount: 0,
    warrantiesExpiring: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [recentEquipment, setRecentEquipment] = useState([]);
  const [pendingMaterialRequests, setPendingMaterialRequests] = useState([]);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [expiringWarranties, setExpiringWarranties] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadRecentEquipment(),
        loadPendingMaterialRequests(),
        loadUpcomingAudits(),
        loadExpiringWarranties(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      addToast('Failed to load dashboard data', 'error');
    }
    setLoading(false);
  };

  const loadDashboardStats = async () => {
    try {
      const equipData = await assetService.getEquipment();
      const equipment = equipData.success ? equipData.data : [];
      
      // Calculate statistics (remove API calls that don't exist yet)
      const totalEquipment = equipment.length;
      const available = equipment.filter(e => e.status === 'available').length;
      const inUse = equipment.filter(e => e.status === 'in-use' || e.status === 'borrowed').length;
      const maintenance = equipment.filter(e => e.status === 'maintenance').length;
      const damaged = equipment.filter(e => e.status === 'damaged').length;
      const retired = equipment.filter(e => e.status === 'retired').length;
      
      // Calculate total value
      const totalValue = equipment.reduce((sum, e) => sum + (parseFloat(e.purchase_cost) || 0), 0);
      
      // Get unique categories
      const categories = [...new Set(equipment.map(e => e.category).filter(Boolean))];
      
      // Get unique labs
      const labs = [...new Set(equipment.map(e => e.laboratory).filter(Boolean))];
      
      // Count expiring warranties (within 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      const expiringCount = equipment.filter(e => {
        if (!e.warranty_expiry) return false;
        const expiryDate = new Date(e.warranty_expiry);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      }).length;
      
      setStats({
        totalEquipment,
        available,
        inUse,
        maintenance,
        damaged,
        retired,
        pendingRequests: 0,  // Set to 0 since API not ready
        pendingAudits: 0,    // Set to 0 since API not ready
        totalValue,
        categoriesCount: categories.length,
        labsCount: labs.length,
        warrantiesExpiring: expiringCount
      });
      
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentEquipment = async () => {
    try {
      const data = await assetService.getEquipment({ limit: 5 });
      if (data.success) {
        setRecentEquipment(data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent equipment:', error);
    }
  };

  const loadPendingMaterialRequests = async () => {
    // This API doesn't exist yet - return empty array
    setPendingMaterialRequests([]);
  };

  const loadUpcomingAudits = async () => {
    // This API doesn't exist yet - return empty array
    setUpcomingAudits([]);
  };

  const loadExpiringWarranties = async () => {
    try {
      const data = await assetService.getEquipment();
      
      if (data.success) {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        const expiring = data.data
          .filter(e => {
            if (!e.warranty_expiry) return false;
            const expiryDate = new Date(e.warranty_expiry);
            return expiryDate <= thirtyDaysFromNow;
          })
          .map(e => ({
            id: e.id,
            name: e.name,
            code: e.code,
            daysLeft: Math.ceil((new Date(e.warranty_expiry) - today) / (1000 * 60 * 60 * 24)),
            expiryDate: e.warranty_expiry
          }))
          .slice(0, 5);
        
        setExpiringWarranties(expiring);
      }
    } catch (error) {
      console.error('Error loading warranties:', error);
    }
  };

  const loadNotifications = async () => {
    const newNotifications = [];
    
    if (stats.warrantiesExpiring > 0) {
      newNotifications.push({
        id: 1,
        message: `${stats.warrantiesExpiring} equipment item(s) have warranties expiring soon`,
        time: 'Now',
        read: false,
        type: 'urgent',
        link: '/asset/equipment'
      });
    }
    
    setNotifications(newNotifications);
  };

  const handleApproveRequest = async (requestId) => {
    // Placeholder function - API not ready
    addToast('Material request approval will be available soon', 'info');
  };

  const handleRejectRequest = async (requestId) => {
    // Placeholder function - API not ready
    addToast('Material request rejection will be available soon', 'info');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/asset', color: '#f59e0b', name: 'dashboard' },
    { label: 'Equipment Status', icon: 'inventory_2', path: '/asset/equipment', color: '#10b981', name: 'equipment' },
    { label: 'Register Equipment', icon: 'add_box', path: '/asset/register-equipment', color: '#3b82f6', name: 'register' },
    { label: 'Audit Equipment', icon: 'fact_check', path: '/asset/audits', color: '#8b5cf6', name: 'audit' },
    { label: 'Borrow Equipment', icon: 'handshake', path: '/asset/borrow', color: '#f97316', name: 'borrow' },
    { label: 'Material Requests', icon: 'request_quote', path: '/asset/material-requests', color: '#ec4899', name: 'requests' },
    { label: 'Reports', icon: 'assessment', path: '/asset/reports', color: '#06b6d4', name: 'reports' },
    { label: 'Profile', icon: 'person', path: '/asset/profile', color: '#8b5cf6', name: 'profile' }
  ];

  const statItems = [
    { title: 'Total Equipment', value: stats.totalEquipment, icon: 'inventory_2', color: '#667eea', trend: '' },
    { title: 'Available', value: stats.available, icon: 'check_circle', color: '#10b981', trend: '' },
    { title: 'In Use', value: stats.inUse, icon: 'play_circle', color: '#3b82f6', trend: '' },
    { title: 'Maintenance', value: stats.maintenance, icon: 'build', color: '#f59e0b', trend: '' },
    { title: 'Categories', value: stats.categoriesCount, icon: 'category', color: '#8b5cf6', trend: '' },
    { title: 'Total Value', value: formatCurrency(stats.totalValue), icon: 'attach_money', color: '#10b981', trend: '' }
  ];

  if (loading && stats.totalEquipment === 0) {
    return (
      <div className="asset-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Asset Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="asset-dashboard">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>☰</button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="material-icons logo-icon">inventory_2</span>
            <span className="logo-text">CLMS Asset</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-large">
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.name} />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Asset Manager'}</span>
            <span className="user-role">Asset / Property Division</span>
            <span className="user-email">{user?.email || 'asset@clms.com'}</span>
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
                <span className="material-icons menu-icon">{item.icon}</span>
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
            <span className="material-icons">logout</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="top-header">
          <div className="header-left">
            <h1 className="dashboard-title">Asset Management Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {user?.name || 'Asset Manager'}! Track and manage university computer lab equipment.
            </p>
          </div>
          <div className="header-right">
            <div className="notification-dropdown">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <span className="material-icons">notifications</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span>Notifications ({unreadCount})</span>
                    <button className="mark-all-read" onClick={markAllAsRead}>Mark all read</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No new notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.type}`} 
                        onClick={() => {
                          markAllAsRead();
                          navigate(notif.link);
                          setShowNotifications(false);
                        }}
                      >
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-profile" onClick={() => navigate('/asset/profile')}>
              <div className="user-avatar">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt={user.name} />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Asset Manager'}</span>
                <span className="user-role">Asset Division</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Two Columns Section */}
        <div className="dashboard-grid">
          {/* Pending Material Requests */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <span className="material-icons">request_quote</span>
                Pending Material Requests
              </h3>
              <button className="view-all" onClick={() => navigate('/asset/material-requests')}>
                View All →
              </button>
            </div>
            <div className="card-body">
              {pendingMaterialRequests.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✅</span>
                  <p>No pending requests</p>
                </div>
              ) : (
                pendingMaterialRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <div className="request-title">{request.equipment_name}</div>
                      <div className="request-details">
                        <span>Quantity: {request.quantity}</span>
                        <span>From: {request.requester_name}</span>
                        <span>Lab: {request.laboratory}</span>
                      </div>
                      <div className="request-purpose">{request.purpose}</div>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expiring Warranties */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <span className="material-icons">verified</span>
                Expiring Warranties
              </h3>
              <button className="view-all" onClick={() => navigate('/asset/equipment')}>
                View All →
              </button>
            </div>
            <div className="card-body">
              {expiringWarranties.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✅</span>
                  <p>No warranties expiring soon</p>
                </div>
              ) : (
                expiringWarranties.map(warranty => (
                  <div key={warranty.id} className="warranty-item">
                    <div className="warranty-info">
                      <div className="warranty-name">{warranty.name}</div>
                      <div className="warranty-code">{warranty.code}</div>
                      <div className={`warranty-days ${warranty.daysLeft <= 7 ? 'urgent' : 'warning'}`}>
                        {warranty.daysLeft <= 0 ? 'EXPIRED' : `${warranty.daysLeft} days left`}
                      </div>
                    </div>
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/asset/equipment/${warranty.id}`)}
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Audits */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <span className="material-icons">fact_check</span>
                Upcoming Audits
              </h3>
              <button className="view-all" onClick={() => navigate('/asset/audits')}>
                Schedule New →
              </button>
            </div>
            <div className="card-body">
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No upcoming audits scheduled</p>
                <button 
                  className="schedule-btn"
                  onClick={() => navigate('/asset/audits/schedule')}
                >
                  + Schedule Audit
                </button>
              </div>
            </div>
          </div>

          {/* Recent Equipment */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <span className="material-icons">inventory_2</span>
                Recently Added Equipment
              </h3>
              <button className="view-all" onClick={() => navigate('/asset/equipment')}>
                View All →
              </button>
            </div>
            <div className="card-body">
              {recentEquipment.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>No equipment registered yet</p>
                  <button 
                    className="add-equipment-btn"
                    onClick={() => navigate('/asset/register-equipment')}
                  >
                    + Register Equipment
                  </button>
                </div>
              ) : (
                <div className="recent-equipment-list">
                  {recentEquipment.map(item => (
                    <div key={item.id} className="equipment-item">
                      <div className="equipment-code">{item.code}</div>
                      <div className="equipment-name">{item.name}</div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/asset/register-equipment')}>
              <span className="material-icons">add_box</span>
              <span>Register Equipment</span>
            </button>
            <button className="action-card" onClick={() => navigate('/asset/audits')}>
              <span className="material-icons">fact_check</span>
              <span>Schedule Audit</span>
            </button>
            <button className="action-card" onClick={() => navigate('/asset/borrow')}>
              <span className="material-icons">handshake</span>
              <span>Borrow Equipment</span>
            </button>
            <button className="action-card" onClick={() => navigate('/asset/reports')}>
              <span className="material-icons">assessment</span>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content small">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="modal-close" onClick={() => setShowLogoutModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="logout-icon">🚪</div>
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

export default AssetDashboard;