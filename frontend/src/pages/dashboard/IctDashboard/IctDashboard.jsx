import React from 'react';
import './IctDashboard.css';

const ICTDashboard = () => {
  const stats = [
    { title: 'Active Computers', value: '98', icon: '🖥️', color: '#48bb78' },
    { title: 'In Maintenance', value: '12', icon: '🔧', color: '#ed8936' },
    { title: 'Pending Requests', value: '5', icon: '⏰', color: '#e53e3e' },
    { title: 'Completed', value: '23', icon: '✅', color: '#4299e1' },
  ];

  const assignedRequests = [
    { id: 1, computer: 'COMP-045', lab: 'Lab 101', issue: 'Power supply failure', priority: 'Critical', status: 'assigned' },
    { id: 2, computer: 'COMP-089', lab: 'Lab 102', issue: 'Slow performance', priority: 'High', status: 'in-progress' },
    { id: 3, computer: 'COMP-023', lab: 'Lab 101', issue: 'Network not connecting', priority: 'Medium', status: 'assigned' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🖥️</span>
          <span className="logo-text">CLMS</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/ict/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔧</span>
            <span>Requests</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🖥️</span>
            <span>Computers</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Reports</span>
          </a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>ICT Team Dashboard</h1>
            <p>Technical Support & System Maintenance</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">💻</span>
            <span>ICT Team</span>
          </div>
        </header>

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

        <div className="card full-width">
          <div className="card-header">
            <h3>🔧 My Assigned Requests</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th>Computer</th><th>Lab</th><th>Issue</th><th>Priority</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {assignedRequests.map((request) => (
                  <tr key={request.id}>
                    <td><strong>{request.computer}</strong></td>
                    <td>{request.lab}</td>
                    <td>{request.issue}</td>
                    <td>
                      <span className={`priority-badge priority-${request.priority.toLowerCase()}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn primary">
                        {request.status === 'assigned' ? 'Start' : 'Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="two-columns">
          <div className="card">
            <div className="card-header">
              <h3>💚 System Health</h3>
            </div>
            <div className="card-body">
              <div className="health-item">
                <span>Network</span>
                <span className="status-online">🟢 Healthy (99.9%)</span>
              </div>
              <div className="health-item">
                <span>Database</span>
                <span className="status-online">🟢 Healthy (99.95%)</span>
              </div>
              <div className="health-item">
                <span>Storage</span>
                <span className="status-warning">🟠 78% Used</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>🔄 Software Updates</h3>
            </div>
            <div className="card-body">
              <div className="update-item">
                <div><strong>Windows Security Update</strong></div>
                <div>45 computers pending</div>
                <button className="action-btn">Deploy</button>
              </div>
              <div className="update-item">
                <div><strong>VS Code Update</strong></div>
                <div>98 computers</div>
                <button className="action-btn">Deploy</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ICTDashboard;