import React from 'react';
import './LabAssistantDashboard.css';

const LabAssistantDashboard = () => {
  const stats = [
    { title: 'Today\'s Labs', value: '4', icon: '🔬', color: '#667eea' },
    { title: 'Equipment Status', value: '98%', icon: '📦', color: '#48bb78' },
    { title: 'Pending Tasks', value: '3', icon: '⏰', color: '#ed8936' },
    { title: 'Issues Reported', value: '2', icon: '⚠️', color: '#e53e3e' },
  ];

  const assignedLabs = [
    { id: 1, lab: 'Lab 101', time: '8:30 AM - 10:30 AM', course: 'Database Systems', task: 'Setup computers' },
    { id: 2, lab: 'Lab 102', time: '11:00 AM - 1:00 PM', course: 'Computer Networks', task: 'Check network' },
    { id: 3, lab: 'Lab 103', time: '2:00 PM - 4:00 PM', course: 'Software Engineering', task: 'Install updates' },
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
          <a href="/lab-assistant/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔧</span>
            <span>My Tasks</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📦</span>
            <span>Equipment</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>Attendance</span>
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
            <h1>Lab Assistant Dashboard</h1>
            <p>Laboratory Support & Equipment Management</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">🛠️</span>
            <span>Lab Assistant</span>
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
            <h3>🔧 Today's Assigned Labs</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th>Lab</th><th>Time</th><th>Course</th><th>Tasks</th><th></th></tr>
              </thead>
              <tbody>
                {assignedLabs.map((lab) => (
                  <tr key={lab.id}>
                    <td><strong>{lab.lab}</strong></td>
                    <td>{lab.time}</td>
                    <td>{lab.course}</td>
                    <td>{lab.task}</td>
                    <td><button className="action-btn primary">Start</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="two-columns">
          <div className="card">
            <div className="card-header">
              <h3>⚠️ Equipment Issues</h3>
            </div>
            <div className="card-body">
              <div className="issue-item">
                <div><strong>COMP-045</strong> - Slow performance</div>
                <div className="issue-time">Reported: 2 hours ago</div>
                <button className="action-btn">View</button>
              </div>
              <div className="issue-item">
                <div><strong>COMP-089</strong> - Network not connecting</div>
                <div className="issue-time">Reported: 1 day ago</div>
                <button className="action-btn">View</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>📦 Material Requests</h3>
            </div>
            <div className="card-body">
              <div className="request-item">
                <div><strong>HDMI Cables</strong> x5 - Lab 101</div>
                <span className="priority-badge priority-high">high</span>
                <button className="action-btn">Fulfill</button>
              </div>
              <div className="request-item">
                <div><strong>Keyboards</strong> x3 - Lab 102</div>
                <span className="priority-badge priority-medium">medium</span>
                <button className="action-btn">Fulfill</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LabAssistantDashboard;