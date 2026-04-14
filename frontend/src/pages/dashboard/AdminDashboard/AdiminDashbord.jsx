import React from 'react';
import './AdminDashebord.css';

const AdminDashboard = () => {
  // Mock data
  const stats = [
    { title: 'Total Users', value: '1,245', icon: '👥', color: '#667eea' },
    { title: 'Computers', value: '120', icon: '🖥️', color: '#48bb78' },
    { title: 'Active Labs', value: '5', icon: '🔬', color: '#ed8936' },
    { title: 'Maintenance', value: '8', icon: '🔧', color: '#e53e3e' },
    { title: 'Reports', value: '45', icon: '📊', color: '#4299e1' },
    { title: 'Storage Used', value: '78%', icon: '💾', color: '#9f7aea' },
  ];

  const recentActivities = [
    { id: 1, action: 'User John Doe registered', time: '2 minutes ago' },
    { id: 2, action: 'New computer added to Lab 101', time: '15 minutes ago' },
    { id: 3, action: 'Maintenance request #123 completed', time: '1 hour ago' },
    { id: 4, action: 'Schedule approved for Database Systems', time: '3 hours ago' },
    { id: 5, action: 'System backup completed', time: '5 hours ago' },
  ];

  const pendingRequests = [
    { id: 1, type: 'User Approval', requester: 'New Teacher', priority: 'high' },
    { id: 2, type: 'Lab Schedule', requester: 'Dr. Abebe', priority: 'medium' },
    { id: 3, type: 'Equipment Request', requester: 'Lab 101', priority: 'low' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🖥️</span>
          <span className="logo-text">CLMS</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔬</span>
            <span>Labs</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🖥️</span>
            <span>Computers</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Schedules</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔧</span>
            <span>Maintenance</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📦</span>
            <span>Assets</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Reports</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-title">
            <h1>Admin Dashboard</h1>
            <p>System Overview & Management</p>
          </div>
          <div className="header-actions">
            <button className="settings-btn">⚙️ System Settings</button>
            <div className="user-info">
              <span className="user-avatar">👑</span>
              <span>Admin User</span>
            </div>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
              <div className="stat-header">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-icon">{stat.icon}</div>
              </div>
              <div className="stat-title">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="two-columns">
          {/* Recent Activities */}
          <div className="card">
            <div className="card-header">
              <h3>📋 Recent Activities</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <tbody>
                  {recentActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <div className="activity-action">{activity.action}</div>
                        <div className="activity-time">{activity.time}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="card-btn">View All Activities →</button>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="card">
            <div className="card-header">
              <h3>⏳ Pending Requests</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>Requester</th><th>Priority</th><th></th></tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.type}</td>
                      <td>{request.requester}</td>
                      <td>
                        <span className={`priority-badge priority-${request.priority}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="card-btn">View All Requests →</button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card full-width">
          <div className="card-header">
            <h3>💚 System Health</h3>
          </div>
          <div className="card-body">
            <div className="health-grid">
              <div className="health-item">
                <div className="health-label">Database</div>
                <span className="health-status status-online">🟢 Online</span>
              </div>
              <div className="health-item">
                <div className="health-label">Redis</div>
                <span className="health-status status-online">🟢 Online</span>
              </div>
              <div className="health-item">
                <div className="health-label">Storage</div>
                <span className="health-status status-warning">🟠 78% Used</span>
              </div>
              <div className="health-item">
                <div className="health-label">Last Backup</div>
                <span className="health-status status-online">✅ Today 2:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card full-width">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="actions-grid">
              <button className="action-btn primary">➕ Add User</button>
              <button className="action-btn primary">🖥️ Add Computer</button>
              <button className="action-btn primary">💾 System Backup</button>
              <button className="action-btn primary">📊 Generate Report</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;