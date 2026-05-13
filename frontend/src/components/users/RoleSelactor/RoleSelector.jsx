import React from 'react';
import './RoleSelector.css';

const RoleSelector = ({ selectedRole, onRoleChange, disabled = false }) => {
  const roles = [
    { value: 'admin', label: 'Admin', icon: '👑', description: 'Full system access', color: '#e53e3e' },
    { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', description: 'Manage classes and attendance', color: '#4299e1' },
    { value: 'student', label: 'Student', icon: '👨‍🎓', description: 'View schedules and attendance', color: '#48bb78' },
    { value: 'lab_manager', label: 'Lab Manager', icon: '🔬', description: 'Manage laboratories', color: '#ed8936' },
    { value: 'dean', label: 'Dean', icon: '📚', description: 'Department oversight', color: '#9f7aea' },
    { value: 'lab_assistant', label: 'Lab Assistant', icon: '🛠️', description: 'Assist in labs', color: '#38b2ac' },
    { value: 'ict', label: 'ICT', icon: '🔧', description: 'Technical support', color: '#319795' },
    { value: 'asset', label: 'Asset', icon: '📦', description: 'Equipment management', color: '#d69e2e' }
  ];

  return (
    <div className="role-selector">
      {roles.map(role => (
        <div 
          key={role.value} 
          className={`role-option ${selectedRole === role.value ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} 
          onClick={() => !disabled && onRoleChange(role.value)}
        >
          <div className="role-icon" style={{ background: role.color }}>{role.icon}</div>
          <div className="role-info">
            <div className="role-label">{role.label}</div>
            <div className="role-description">{role.description}</div>
          </div>
          {selectedRole === role.value && <div className="role-check">✓</div>}
        </div>
      ))}
    </div>
  );
};

export default RoleSelector;