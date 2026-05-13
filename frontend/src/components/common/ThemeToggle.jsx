import React from 'react';
import { useLocalStorage } from '../../hooks';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.body.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
};

export default ThemeToggle;