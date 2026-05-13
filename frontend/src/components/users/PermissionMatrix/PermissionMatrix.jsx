import React, { useState } from 'react';
import './PermissionMatrix.css';

const PermissionMatrix = ({ permissions = {}, onSave, onCancel }) => {
  const [localPermissions, setLocalPermissions] = useState(permissions);

  const modules = ['dashboard', 'users', 'computers', 'schedules', 'maintenance', 'attendance', 'assets', 'reports', 'settings'];
  const actions = ['view', 'create', 'edit', 'delete', 'approve'];
  const roles = ['admin', 'teacher', 'student', 'lab-manager', 'dean', 'lab-assistant', 'ict', 'asset'];

  const getPermission = (role, module, action) => {
    return localPermissions[role]?.[module]?.[action] || false;
  };

  const togglePermission = (role, module, action) => {
    setLocalPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role]?.[module],
          [action]: !getPermission(role, module, action)
        }
      }
    }));
  };

  const handleSave = () => {
    onSave(localPermissions);
  };

  return (
    <div className="permission-matrix-modal">
      <div className="matrix-overlay" onClick={onCancel}></div>
      <div className="matrix-content">
        <div className="matrix-header">
          <h2>Permission Matrix</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        <div className="matrix-body">
          <div className="matrix-scroll">
            <table className="permission-table">
              <thead>
                <tr>
                  <th>Role / Module</th>
                  {modules.map(m => <th key={m} colSpan={actions.length}>{m}</th>)}
                </tr>
                <tr>
                  <th></th>
                  {modules.map(m => actions.map(a => (
                    <th key={`${m}-${a}`} className="action-cell">{a}</th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role}>
                    <td className="role-cell">{role}</td>
                    {modules.map(module => actions.map(action => (
                      <td key={`${role}-${module}-${action}`} className="permission-cell">
                        <label className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={getPermission(role, module, action)}
                            onChange={() => togglePermission(role, module, action)}
                            disabled={role === 'admin'}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                    )))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="matrix-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;