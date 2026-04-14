import React from 'react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const stats = [
    { title: 'Attendance', value: '85%', icon: '📊', color: '#48bb78' },
    { title: 'Lab Sessions', value: '12', icon: '🔬', color: '#667eea' },
    { title: 'Completed Labs', value: '10', icon: '✅', color: '#4299e1' },
    { title: 'Absences', value: '2', icon: '❌', color: '#e53e3e' },
  ];

  const upcomingSessions = [
    { date: 'Apr 15, 2026', time: '10:00 AM - 12:00 PM', course: 'Database Systems', lab: 'Lab 101' },
    { date: 'Apr 16, 2026', time: '2:00 PM - 4:00 PM', course: 'Computer Networks', lab: 'Lab 102' },
    { date: 'Apr 18, 2026', time: '9:00 AM - 11:00 AM', course: 'Software Engineering', lab: 'Lab 103' },
  ];

  const recentAttendance = [
    { date: 'Apr 10, 2026', course: 'Database Systems', status: 'Present' },
    { date: 'Apr 9, 2026', course: 'Computer Networks', status: 'Present' },
    { date: 'Apr 8, 2026', course: 'Software Engineering', status: 'Absent' },
    { date: 'Apr 7, 2026', course: 'Database Systems', status: 'Late' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Present': return 'status-present';
      case 'Absent': return 'status-absent';
      case 'Late': return 'status-late';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🖥️</span>
          <span className="logo-text">CLMS</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/student/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>My Schedule</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>My Attendance</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔧</span>
            <span>Report Issue</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
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
            <h1>Student Dashboard</h1>
            <p>Welcome back, Abebe Kebede!</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">👨‍🎓</span>
            <span>Abebe Kebede</span>
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
              <h3>📅 Upcoming Lab Sessions</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Time</th><th>Course</th><th>Lab</th></tr>
                </thead>
                <tbody>
                  {upcomingSessions.map((session, index) => (
                    <tr key={index}>
                      <td>{session.date}</td>
                      <td>{session.time}</td>
                      <td><strong>{session.course}</strong></td>
                      <td>{session.lab}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>📊 Recent Attendance</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Course</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentAttendance.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.course}</td>
                      <td>
                        <span className={`attendance-status ${getStatusClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="card-btn">View Full Attendance Report →</button>
            </div>
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="actions-grid">
              <button className="action-btn primary">📅 View Schedule</button>
              <button className="action-btn primary">📝 My Attendance</button>
              <button className="action-btn primary">🔧 Report Issue</button>
              <button className="action-btn primary">👤 View Profile</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;