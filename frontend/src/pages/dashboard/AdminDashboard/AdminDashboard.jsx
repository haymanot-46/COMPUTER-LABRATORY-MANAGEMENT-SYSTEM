// frontend/src/pages/dashboard/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../../hooks';
import { dashboardService } from '../../../services';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const fileInputRef = useRef(null);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);
  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadProfileImage();
    loadContactMessages();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const messageTimer = setInterval(() => loadContactMessages(), 30000); // Refresh every 30 seconds
    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const result = await dashboardService.getAdminStats();
    if (result && result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  const loadProfileImage = () => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  };

  const loadContactMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/contact/messages?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setContactMessages(data.data);
        const unread = data.data.filter(msg => msg.status === 'pending').length;
        setUnreadContactCount(unread);
      }
    } catch (error) {
      console.error('Error loading contact messages:', error);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowContactModal(true);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      addToast('Please enter a reply message', 'error');
      return;
    }
    
    setSendingReply(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/contact/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      
      const data = await response.json();
      if (data.success) {
        addToast('Reply sent successfully!', 'success');
        setShowContactModal(false);
        loadContactMessages();
      } else {
        addToast(data.message || 'Failed to send reply', 'error');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      addToast('Error sending reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error');
      return;
    }
    
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem('profileImage', reader.result);
      addToast('Profile photo updated successfully!', 'success');
      setUploading(false);
    };
    reader.onerror = () => {
      addToast('Failed to upload image', 'error');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem('profileImage');
    addToast('Profile photo removed', 'info');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => { logout(); navigate('/login'); };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'normal': return '🟡';
      default: return '⚪';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'normal': return 'priority-normal';
      default: return 'priority-low';
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || '1,245', icon: '👥', color: '#f59e0b', bgColor: '#fef3c7' },
    { title: 'Computers', value: stats?.totalComputers || '156', icon: '🖥️', color: '#10b981', bgColor: '#d1fae5' },
    { title: 'Active Labs', value: stats?.activeLabs || '5', icon: '🔬', color: '#3b82f6', bgColor: '#dbeafe' },
    { title: 'Maintenance', value: stats?.maintenanceRequests || '12', icon: '🔧', color: '#ef4444', bgColor: '#fee2e2' },
    { title: 'Contact Messages', value: unreadContactCount, icon: '📧', color: '#8b5cf6', bgColor: '#ede9fe' }
  ];

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin/dashboard', active: true },
    { label: 'Users', icon: '👥', path: '/users' },
    { label: 'Computers', icon: '🖥️', path: '/computers' },
    { label: 'Laboratories', icon: '🔬', path: '/laboratories' },
    { label: 'Schedules', icon: '📅', path: '/schedule-calendar' },
    { label: 'Maintenance', icon: '🔧', path: '/maintenance' },
    { label: 'Equipment', icon: '📦', path: '/equipment' },
    { label: 'Contact Messages', icon: '📧', path: '/contact-messages', badge: unreadContactCount > 0 ? unreadContactCount : null },
    { label: 'Reports', icon: '📊', path: '/reports' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
    { label: 'My Profile', icon: '👤', path: '/profile' }
  ];

  const quickActions = [
    { label: 'Add User', icon: '👥', action: () => navigate('/users'), color: '#f59e0b', desc: 'Create new user' },
    { label: 'Add Computer', icon: '🖥️', action: () => navigate('/add-computer'), color: '#10b981', desc: 'Register computer' },
    { label: 'Schedule Lab', icon: '📅', action: () => navigate('/book-lab'), color: '#3b82f6', desc: 'Book lab session' },
    { label: 'View Reports', icon: '📊', action: () => navigate('/reports'), color: '#8b5cf6', desc: 'Generate reports' },
    { label: 'Contact Messages', icon: '📧', action: () => navigate('/contact-messages'), color: '#ec4899', desc: 'View messages' }
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
    <div className="admin-dashboard">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>☰</button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🖥️</span>
            <span className="logo-text">CLMS</span>
            <span className="logo-sub">Injibara University</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div 
            className="user-avatar-large" 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              cursor: 'pointer',
              backgroundImage: profileImage ? `url(${profileImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!profileImage && (user?.name?.charAt(0) || 'A')}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          <div className="user-details">
            <span className="user-name">{user?.name || 'Admin User'}</span>
            <span className="user-role">System Administrator</span>
          </div>
          {profileImage && (
            <button onClick={removeProfileImage} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', marginTop: '8px' }}>
              Remove Photo
            </button>
          )}
          {uploading && <span style={{ fontSize: '11px', color: '#f59e0b' }}>Uploading...</span>}
        </div>

        <div className="sidebar-nav">
          {navItems.map((item, index) => (
            <button 
              key={index} 
              className={`nav-item ${item.active ? 'active' : ''}`} 
              onClick={() => navigate(item.path)}
              style={{ position: 'relative' }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          {quickActions.map((action, index) => (
            <button key={index} className="quick-action-btn" onClick={action.action} style={{ borderLeftColor: action.color }}>
              <span className="action-icon">{action.icon}</span>
              <div className="action-content">
                <span className="action-label">{action.label}</span>
                <span className="action-desc">{action.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="date-time">
            <span>{currentTime.toLocaleDateString()}</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="top-header">
          <div className="header-left">
            <h1 className="dashboard-title">Computer Laboratory Management System</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Admin'}!</p>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderBottomColor: stat.color }}>
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Recent Contact Messages Section */}
        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3>📧 Recent Contact Messages</h3>
            <button className="view-all-btn" onClick={() => navigate('/contact-messages')}>
              View All →
            </button>
          </div>
          <div className="card-body">
            {contactMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No pending contact messages</p>
              </div>
            ) : (
              <div className="contact-messages-list">
                {contactMessages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className={`contact-message-item ${getPriorityClass(msg.priority)}`} onClick={() => handleViewMessage(msg)}>
                    <div className="message-priority">{getPriorityIcon(msg.priority)}</div>
                    <div className="message-content">
                      <div className="message-header">
                        <strong>{msg.name}</strong>
                        <span className="message-date">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="message-subject">{msg.subject}</div>
                      <div className="message-preview">{msg.message.substring(0, 80)}...</div>
                    </div>
                    <button className="reply-btn">Reply</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="dashboard-card">
            <div className="card-header"><h3>📋 Recent Activities</h3></div>
            <div className="card-body">
              <p>System is running normally. No recent activities.</p>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-header"><h3>⚙️ System Status</h3></div>
            <div className="card-body">
              <p>✅ All systems operational</p>
              <p>🟢 Database: Connected</p>
              <p>🟢 API: Running</p>
            </div>
          </div>
        </div>
      </main>

      {/* Contact Message Reply Modal */}
      {showContactModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply to Contact Message</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="message-details">
                <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                <p><strong>Subject:</strong> {selectedMessage.subject}</p>
                <p><strong>Priority:</strong> <span className={`priority-badge ${getPriorityClass(selectedMessage.priority)}`}>{selectedMessage.priority}</span></p>
                <p><strong>Message:</strong></p>
                <div className="original-message">{selectedMessage.message}</div>
              </div>
              <div className="reply-section">
                <label>Your Reply:</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="6"
                  placeholder="Type your response here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowContactModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleSendReply} disabled={sendingReply}>
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminDashboard;