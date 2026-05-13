import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search...', delay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-btn" onClick={handleClear}>×</button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;