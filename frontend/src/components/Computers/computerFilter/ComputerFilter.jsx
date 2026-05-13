import React, { useState } from 'react';
import './ComputerFilter.css';

const ComputerFilter = ({ onSearch, onFilter, onSort, laboratories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLab, setFilterLab] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const statuses = ['all', 'available', 'in-use', 'maintenance', 'damaged', 'retired'];

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = () => {
    onFilter({ lab: filterLab, status: filterStatus });
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterLab('all');
    setFilterStatus('all');
    onSearch('');
    onFilter({ lab: 'all', status: 'all' });
  };

  return (
    <div className="computer-filter">
      <div className="filter-header">
        <h3>🔍 Filter Computers</h3>
        <button className="reset-btn" onClick={handleReset}>Reset All</button>
      </div>
      
      <div className="filter-controls">
        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="🔎 Search by name, asset tag, or model..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Laboratory</label>
          <select 
            value={filterLab} 
            onChange={(e) => { 
              setFilterLab(e.target.value); 
              handleFilterChange(); 
            }}
          >
            <option value="all">All Laboratories</option>
            {laboratories && laboratories.map(lab => (
              <option key={lab.id} value={lab.id}>
                {lab.name} ({lab.code})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select 
            value={filterStatus} 
            onChange={(e) => { 
              setFilterStatus(e.target.value); 
              handleFilterChange(); 
            }}
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters display */}
      {(filterLab !== 'all' || filterStatus !== 'all' || searchTerm) && (
        <div className="active-filters">
          <div className="filter-tags">
            <span className="filter-label">Active Filters:</span>
            {filterLab !== 'all' && (
              <span className="filter-tag">
                Lab: {laboratories.find(l => l.id == filterLab)?.name || filterLab}
                <button onClick={() => { setFilterLab('all'); handleFilterChange(); }}>×</button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="filter-tag">
                Status: {filterStatus}
                <button onClick={() => { setFilterStatus('all'); handleFilterChange(); }}>×</button>
              </span>
            )}
            {searchTerm && (
              <span className="filter-tag">
                Search: {searchTerm}
                <button onClick={() => handleSearch('')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerFilter;