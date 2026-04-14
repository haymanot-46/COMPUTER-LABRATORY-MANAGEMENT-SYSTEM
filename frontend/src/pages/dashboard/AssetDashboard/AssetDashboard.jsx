import React from 'react';
import './AssetDashboard.css';

const AssetDashboard = () => {
  const stats = [
    { title: 'Total Equipment', value: '245', icon: '📦', color: '#667eea' },
    { title: 'Active', value: '198', icon: '✅', color: '#48bb78' },
    { title: 'Maintenance', value: '12', icon: '🔧', color: '#ed8936' },
    { title: 'Total Value', value: '2.4M ETB', icon: '💰', color: '#4299e1' },
  ];

  const pendingAudits = [
    { id: 1, lab: 'Computer Lab 101', dueDate: 'Today', items: 35 },
    { id: 2, lab: 'Computer Lab 102', dueDate: 'Tomorrow', items: 35 },
  ];

  const warrantyExpiring = [
    { id: 1, equipment: 'Dell Optiplex 3090', daysLeft: 30 },
    { id: 2, equipment: 'HP Monitor 24"', daysLeft: 45 },
    { id: 3, equipment: 'APC UPS 650VA', daysLeft: 60 },
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
          <a href="/asset/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📦</span>
            <span>Equipment</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📋</span>
            <span>Audits</span>
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
            <h1>Asset Division Dashboard</h1>
            <p>Equipment & Inventory Management</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">📦</span>
            <span>Asset Division</span>
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

        <div className="two-columns">
          <div className="card">
            <div className="card-header">
              <h3>📋 Pending Audits</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr><th>Laboratory</th><th>Due Date</th><th>Items</th><th></th></tr>
                </thead>
                <tbody>
                  {pendingAudits.map((audit) => (
                    <tr key={audit.id}>
                      <td>{audit.lab}</td>
                      <td>{audit.dueDate}</td>
                      <td>{audit.items}</td>
                      <td><button className="action-btn primary">Start Audit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>⚠️ Warranty Expiring Soon</h3>
            </div>
            <div className="card-body">
              {warrantyExpiring.map((item) => (
                <div key={item.id} className="warranty-item">
                  <div><strong>{item.equipment}</strong></div>
                  <div className={`days-left ${item.daysLeft < 30 ? 'urgent' : ''}`}>
                    {item.daysLeft} days left
                  </div>
                  <button className="action-btn">Renew</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h3>📦 Recently Added Equipment</h3>
            <button className="action-btn primary">+ Register Equipment</button>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th>Equipment Name</th><th>Code</th><th>Lab</th><th>Date Added</th><th>Condition</th></tr>
              </thead>
              <tbody>
                <tr><td>Dell Optiplex 3090</td><td>COMP-120</td><td>Lab 101</td><td>Mar 10, 2026</td><td><span className="condition-excellent">Excellent</span></td></tr>
                <tr><td>HP Monitor 24"</td><td>MON-045</td><td>Lab 102</td><td>Mar 8, 2026</td><td><span className="condition-good">Good</span></td></tr>
                <tr><td>APC UPS</td><td>UPS-012</td><td>Lab 101</td><td>Mar 5, 2026</td><td><span className="condition-excellent">Excellent</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetDashboard;