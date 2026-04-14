import React from 'react';
import './TeaccherDashboard.css';

const TeacherDashboard = () => {
  const stats = [
    { title: 'My Classes', value: '4', icon: '📚', color: '#667eea' },
    { title: 'Total Students', value: '120', icon: '👨‍🎓', color: '#48bb78' },
    { title: 'Pending Attendance', value: '2', icon: '⏰', color: '#ed8936' },
    { title: 'Lab Sessions', value: '6', icon: '🔬', color: '#4299e1' },
  ];

  const todayClasses = [
    { time: '8:30 AM - 10:30 AM', course: 'Database Systems', lab: 'Lab 101', students: 35 },
    { time: '11:00 AM - 1:00 PM', course: 'Computer Networks', lab: 'Lab 102', students: 30 },
    { time: '2:00 PM - 4:00 PM', course: 'Software Engineering', lab: 'Lab 103', students: 28 },
  ];

  const pendingTasks = [
    { id: 1, task: 'Mark attendance for Database Systems', due: 'Today, 5:00 PM', priority: 'high' },
    { id: 2, task: 'Submit grades for Computer Networks', due: 'Tomorrow', priority: 'medium' },
    { id: 3, task: 'Review lab equipment request', due: 'This week', priority: 'low' },
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
          <a href="/teacher/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>My Schedule</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>Attendance</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Grades</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🔧</span>
            <span>Report Issue</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">👥</span>
            <span>My Students</span>
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
            <h1>Teacher Dashboard</h1>
            <p>Welcome back, Dr. Abebe!</p>
          </div>
          <div className="user-info">
            <span className="user-avatar">👨‍🏫</span>
            <span>Dr. Abebe Kebede</span>
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
              <h3>📅 Today's Classes</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr><th>Time</th><th>Course</th><th>Lab</th><th>Students</th><th></th></tr>
                </thead>
                <tbody>
                  {todayClasses.map((class_, index) => (
                    <tr key={index}>
                      <td>{class_.time}</td>
                      <td><strong>{class_.course}</strong></td>
                      <td>{class_.lab}</td>
                      <td>{class_.students}</td>
                      <td>
                        <button className="action-btn primary">Take Attendance</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>⏰ Pending Tasks</h3>
            </div>
            <div className="card-body">
              {pendingTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <div className="task-title">{task.task}</div>
                    <div className="task-due">Due: {task.due}</div>
                  </div>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority}
                  </span>
                  <button className="action-btn">Complete</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h3>📢 Recent Announcements</h3>
          </div>
          <div className="card-body">
            <div className="announcement-item">
              <div className="announcement-title">Lab Schedule Change</div>
              <div className="announcement-message">Lab 101 will be closed for maintenance on Friday</div>
              <div className="announcement-time">2 hours ago</div>
            </div>
            <div className="announcement-item">
              <div className="announcement-title">New Software Available</div>
              <div className="announcement-message">VS Code 2025 is now installed in all labs</div>
              <div className="announcement-time">1 day ago</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;