import React from 'react';
import CarouselEffect from '../CarouselEffect/CarouselEffect';
import './HeroSection.css';

const HeroSection = ({ onGetStarted, onLearnMore, isAuthenticated }) => {
  return (
    <section className="hero-section">
      {/* Carousel Background - Images fully visible */}
      <div className="carousel-wrapper">
        <CarouselEffect />
      </div>

      {/* Hero Content - No overlay, just text on top */}
      <div className="hero-content">
        
        <h1 className="hero-title">
          Computer Laboratory
          <span className="hero-highlight"> Management System</span>
        </h1>
        <p className="hero-subtitle">
          Streamline your laboratory operations, manage computer assets, 
          track attendance, and optimize resource utilization - all in one place.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={onGetStarted}>
            {isAuthenticated ? 'Go to Dashboard →' : 'Get Started →'}
          </button>
          <button className="btn btn-secondary" onClick={onLearnMore}>
            Learn More
          </button>
        </div>
        <div className="hero-stats-preview">
          <div className="stat-preview">
            <span className="stat-number">5+</span>
            <span className="stat-label">Laboratories</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-preview">
            <span className="stat-number">150+</span>
            <span className="stat-label">Computers</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-preview">
            <span className="stat-number">8</span>
            <span className="stat-label">User Roles</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-preview">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 32L48 37.3C96 42.7 192 53.3 288 58.7C384 64 480 64 576 58.7C672 53.3 768 42.7 864 42.7C960 42.7 1056 53.3 1152 58.7C1248 64 1344 64 1392 64L1440 64V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V32Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;