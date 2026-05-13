import React from 'react';
import './HomePage.css';

/**
 * RolesSection Component
 * Displays the 8 user roles in the system
 * 
 * Traceability: UI-ROLES-001, FR-AUTH-ROLE-REDIRECT-007
 */

const roles = [
  {
    id: 1,
    name: 'System Administrator',
    role: 'admin',
    icon: '👑',
    description: 'Full system access, user management, and system configuration.',
    color: '#e53e3e',
    permissions: ['Manage Users', 'Configure System', 'All Reports']
  },
  {
    id: 2,
    name: 'Laboratory Manager',
    role: 'lab_manager',
    icon: '🔬',
    description: 'Manage laboratory operations, approve schedules, and oversee equipment.',
    color: '#ed8936',
    permissions: ['Approve Schedules', 'Manage Computers', 'Lab Reports']
  },
  {
    id: 3,
    name: 'Teacher / Instructor',
    role: 'teacher',
    icon: '👨‍🏫',
    description: 'Book laboratories, mark attendance, and manage class sessions.',
    color: '#48bb78',
    permissions: ['Book Labs', 'Mark Attendance', 'View Schedule']
  },
  {
    id: 4,
    name: 'Department Dean',
    role: 'dean',
    icon: '📚',
    description: 'Department oversight, batch scheduling, and performance reports.',
    color: '#8b5cf6',
    permissions: ['Batch Schedule', 'Department Reports', 'Approve Requests']
  },
  {
    id: 5,
    name: 'Student',
    role: 'student',
    icon: '👨‍🎓',
    description: 'View lab schedules, track personal attendance, submit issues.',
    color: '#4299e1',
    permissions: ['View Schedule', 'View Attendance', 'Report Issues']
  },
  {
    id: 6,
    name: 'Lab Assistant',
    role: 'lab_assistant',
    icon: '🛠️',
    description: 'Assist with attendance, check equipment status, and help teachers.',
    color: '#38b2ac',
    permissions: ['Mark Attendance', 'Check Equipment', 'Assist Labs']
  },
  {
    id: 7,
    name: 'ICT Team',
    role: 'ict',
    icon: '🔧',
    description: 'Technical support, maintenance requests, and computer repairs.',
    color: '#319795',
    permissions: ['Resolve Maintenance', 'Update Computer Status', 'System Health']
  },
  {
    id: 8,
    name: 'Asset Division',
    role: 'asset',
    icon: '📦',
    description: 'Equipment inventory management, audits, and warranty tracking.',
    color: '#d69e2e',
    permissions: ['Manage Equipment', 'Conduct Audits', 'Asset Reports']
  }
];

const RolesSection = () => {
  return (
    <section className="roles-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">User Roles</span>
          <h2 className="section-title">
            Designed for <span className="title-highlight">8 Different Roles</span>
          </h2>
          <p className="section-subtitle">
            CLMS provides role-specific dashboards and permissions for every stakeholder
            in the laboratory management ecosystem.
          </p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => (
            <div key={role.id} className="role-card">
              <div className="role-icon" style={{ backgroundColor: `${role.color}15`, color: role.color }}>
                {role.icon}
              </div>
              <h3 className="role-name">{role.name}</h3>
              <p className="role-description">{role.description}</p>
              <div className="role-permissions">
                {role.permissions.map((perm, idx) => (
                  <span key={idx} className="permission-tag">✓ {perm}</span>
                ))}
              </div>
              <div className="role-trace" data-trace={`FR-AUTH-ROLE-REDIRECT-007-${role.role.toUpperCase()}`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;