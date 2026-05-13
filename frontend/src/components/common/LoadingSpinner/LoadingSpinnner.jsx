import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullPage = false }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizes[size] || sizes.medium;

  const spinner = (
    <div className="spinner-container">
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }}>
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="full-page-spinner">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;