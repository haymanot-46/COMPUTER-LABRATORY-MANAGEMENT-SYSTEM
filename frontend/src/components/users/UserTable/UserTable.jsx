import React, { useState } from 'react';
import './UserTable.css';

const UserTable = ({ users, onView, onEdit, onDelete, onStatusChange, currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const roles = ['all', 'admin', 'teacher', 'student', 'lab-manager', 'dean', 'lab-assistant', 'ict', 'asset'];
  const statuses = ['all', 'active', 'inactive', 'suspended'];

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑', teacher: '👨‍🏫', student: '👨‍🎓', 'lab-manager': '🔬',
      dean: '📚', 'lab-assistant': '🛠️', ict: '🔧', asset: '📦'
    };
    return icons[role] || '👤';
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { class: 'status-active', text: '🟢 Active' },
      inactive: { class: 'status-inactive', text: '⚪ Inactive' },
      suspended: { class: 'status-suspended', text: '🔴 Suspended' }
    };
    return configs[status] || configs.active;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Get avatar display (image or initials/icon)
  const getAvatarDisplay = (user) => {
    if (user.profile_image) {
      return (
        <img 
          src={user.profile_image} 
          alt={user.name} 
          className="user-avatar-img"
        />
      );
    }
    return (
      <div className="user-avatar-initials">
        {getInitials(user.name)}
      </div>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const canEdit = (userRole) => {
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'lab-manager' && userRole === 'student') return true;
    return false;
  };

  return (
    <div className="user-table-container">
      <div className="table-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="filter-group">
          <label>Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            {roles.map(role => <option key={role} value={role}>{role === 'all' ? 'All Roles' : role}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            {statuses.map(status => <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => {
              const statusBadge = getStatusBadge(user.status);
              return (
                <tr key={user.id}>
                  <td className="user-photo-cell">
                    {getAvatarDisplay(user)}
                   </td>
                  <td className="user-info-cell">
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-id">{user.studentId || user.employeeId || `ID: ${user.id}`}</div>
                    </div>
                   </td>
                  <td>{user.email}</td>
                  <td className="role-cell">
                    <span className="role-badge">{getRoleIcon(user.role)} {user.role}</span>
                   </td>
                  <td>{user.department || '—'}</td>
                  <td><span className={`status-badge ${statusBadge.class}`}>{statusBadge.text}</span></td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="action-buttons">
                    <button className="action-icon view" onClick={() => onView(user)} title="View">👁️</button>
                    {canEdit(user.role) && <button className="action-icon edit" onClick={() => onEdit(user)} title="Edit">✏️</button>}
                    {currentUserRole === 'admin' && <button className="action-icon delete" onClick={() => onDelete(user.id)} title="Delete">🗑️</button>}
                    {currentUserRole === 'admin' && user.status !== 'active' && (
                      <button className="action-icon activate" onClick={() => onStatusChange(user.id, 'active')} title="Activate">✅</button>
                    )}
                   </td>
                 </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
        </div>
      )}

      <div className="table-summary">Total Users: {filteredUsers.length}</div>
    </div>
  );
};

export default UserTable;