import React from 'react';
import './DeanDashboard.css';

const DeanDashboard = () => {
  const stats = [
    { title: 'Departments', value: '4', icon: '🏛️', color: '#667eea' },
    { title: 'Students', value: '1,245', icon: '👨‍🎓', color: '#48bb78' },
    { title: 'Lab Utilization', value: '72%', icon: '📊', color: '#ed8936' },
    { title: 'Active Courses', value: '28', icon: '📚', color: '#4299e1' },
  ];

  const batchSchedules = [
    { id: 1, batch: 'CS 3rd Year - Batch A', semester: '2nd Semester', courses: 6, labs: 4, status: 'active' },
    { id: 2, batch: 'CS 3rd Year - Batch B', semester: '2nd Semester', courses: 6, labs: 4, status: 'active' },
    { id: 3, batch: 'IT 3rd Year - Batch A', semester: '2nd Semester', courses: 5, labs: 3, status: 'pending' },
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
          <a href="/dean/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📦</span>
            <span>Batches</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Schedule</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📚</span>
            <span>Courses</span>
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
            <h1>Dean Dashboard</h1>
            <p>Faculty of Computing - Overview</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">📚</span>
            <span>Department Dean</span>
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
            <h3>📦 Batch Schedules</h3>
            <button className="action-btn primary">+ Create Batch Schedule</button>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th>Batch</th><th>Semester</th><th>Courses</th><th>Labs</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {batchSchedules.map((batch) => (
                  <tr key={batch.id}>
                    <td><strong>{batch.batch}</strong></td>
                    <td>{batch.semester}</td>
                    <td>{batch.courses}</td>
                    <td>{batch.labs}</td>
                    <td>
                      <span className={`status-badge status-${batch.status}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td><button className="action-btn">View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="actions-grid">
              <button className="action-btn primary">📦 Create Batch Schedule</button>
              <button className="action-btn primary">📊 Department Report</button>
              <button className="action-btn primary">📚 Manage Courses</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeanDashboard;