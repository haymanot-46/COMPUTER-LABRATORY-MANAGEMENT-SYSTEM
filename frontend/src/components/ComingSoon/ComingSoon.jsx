// frontend/src/components/ComingSoon.jsx
import React from 'react';
import './ComingSoon.css';

const ComingSoon = ({ pageName }) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h1>Coming Soon</h1>
        <p>The {pageName} page is currently under development.</p>
        <p>We're working hard to bring you this feature.</p>
        <button onClick={() => window.history.back()} className="back-button">
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;