import React from 'react';
import './LabMangenerDashboard.css';

const LabManagerDashboard = () => {
  const stats = [
    { title: 'Laboratories', value: '5', icon: '🔬', color: '#667eea' },
    { title: 'Computers', value: '120', icon: '🖥️', color: '#48bb78' },
    { title: 'Active Sessions', value: '8', icon: '📅', color: '#ed8936' },
    { title: 'Maintenance', value: '3', icon: '🔧', color: '#e53e3e' },
  ];

  const pendingApprovals = [
    { id: 1, lab: 'Lab 101', course: 'Database Systems', instructor: 'Dr. Abebe', time: '10:00 AM', date: 'Apr 15' },
    { id: 2, lab: 'Lab 102', course: 'Computer Networks', instructor: 'Dr. Almaz', time: '2:00 PM', date: 'Apr 15' },
    { id: 3, lab: 'Lab 103', course: 'Software Engineering', instructor: 'Dr. Biruk', time: '11:00 AM', date: 'Apr 16' },
  ];

  const labUtilization = [
    { name: 'Lab 101', utilization: 85 },
    { name: 'Lab 102', utilization: 62 },
    { name: 'Lab 103', utilization: 45 },
    { name: 'Lab 104', utilization: 78 },
    { name: 'Lab 105', utilization: 30 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const getUtilizationColor = (percent) => {
    if (percent > 70) return '#e53e3e';
    if (percent > 50) return '#ed8936';
    return '#38a169';
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🖥️</span>
          <span className="logo-text">CLMS</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/lab-manager/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔬</span>
            <span>Laboratories</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Schedules</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🖥️</span>
            <span>Computers</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔧</span>
            <span>Maintenance</span>
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
            <h1>Lab Manager Dashboard</h1>
            <p>Manage Laboratories & Resources</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">🔬</span>
            <span>Lab Manager</span>
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
              <h3>⏳ Pending Approvals</h3>
              <span className="badge">3 pending</span>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr><th>Lab/Course</th><th>Instructor</th><th>Date/Time</th><th></th></tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="lab-name">{item.lab}</div>
                        <div className="course-name">{item.course}</div>
                      </td>
                      <td>{item.instructor}</td>
                      <td>{item.date}<br/>{item.time}</td>
                      <td>
                        <button className="action-btn success">Approve</button>
                        <button className="action-btn danger">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>📊 Laboratory Utilization</h3>
            </div>
            <div className="card-body">
              {labUtilization.map((lab, index) => (
                <div key={index} className="utilization-item">
                  <div className="utilization-header">
                    <span>{lab.name}</span>
                    <span>{lab.utilization}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${lab.utilization}%`, backgroundColor: getUtilizationColor(lab.utilization) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h3>📅 Today's Schedule</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th>Time</th><th>Laboratory</th><th>Course</th><th>Instructor</th></tr>
              </thead>
              <tbody>
                <tr><td>8:00 AM - 10:00 AM</td><td>Lab 101</td><td>Advanced Databases</td><td>Dr. Abebe</td></tr>
                <tr><td>10:00 AM - 12:00 PM</td><td>Lab 102</td><td>Web Development</td><td>Dr. Almaz</td></tr>
                <tr><td>1:00 PM - 3:00 PM</td><td>Lab 101</td><td>Data Structures</td><td>Dr. Chaltu</td></tr>
                <tr><td>3:00 PM - 5:00 PM</td><td>Lab 103</td><td>Network Security</td><td>Dr. Desta</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LabManagerDashboard;