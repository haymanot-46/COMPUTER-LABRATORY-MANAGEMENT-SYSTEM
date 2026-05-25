import React from 'react';

const AssignedSessionsPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
        <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '16px' }}>
          Assigned Sessions
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          View your assigned lab sessions here.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default AssignedSessionsPage;