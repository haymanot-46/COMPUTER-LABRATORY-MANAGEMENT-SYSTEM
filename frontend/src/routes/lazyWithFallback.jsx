// frontend/src/routes/lazyWithFallback.jsx
import { lazy } from 'react';

export const lazyWithFallback = (importFunc, componentName = 'Component') => {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error(`Failed to load ${componentName}:`, error);
      // Return a fallback component
      return {
        default: () => {
          const FallbackComponent = () => {
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
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
                  <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '16px' }}>
                    Coming Soon
                  </h1>
                  <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                    The <strong>{componentName}</strong> page is currently under development.
                  </p>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    We're working hard to bring you this feature.
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
                      cursor: 'pointer',
                      transition: 'transform 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    ← Go Back
                  </button>
                </div>
              </div>
            );
          };
          return <FallbackComponent />;
        }
      };
    })
  );
};

export default lazyWithFallback;