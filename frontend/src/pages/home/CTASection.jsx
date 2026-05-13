import React from 'react';
import './HomePage.css';

/**
 * CTASection Component
 * Call to Action section
 * 
 * Traceability: UI-CTA-001
 */

const CTASection = ({ onGetStarted }) => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Laboratory Management?</h2>
          <p className="cta-description">
            Join Injibara University's Computer Laboratory Management System today
            and experience efficient, digital laboratory operations.
          </p>
          <button className="btn btn-cta" onClick={onGetStarted}>
            Get Started for Free →
          </button>
          <p className="cta-note">No credit card required. Free for Injibara University students and staff.</p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;