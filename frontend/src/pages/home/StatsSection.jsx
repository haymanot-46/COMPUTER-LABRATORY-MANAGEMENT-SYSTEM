import React, { useState, useEffect } from 'react';
import './HomePage.css';

/**
 * StatsSection Component
 * Animated statistics counter
 * 
 * Traceability: UI-STATS-001
 */

const statsData = [
  { id: 1, label: 'Laboratories', value: 5, suffix: '+', icon: '🔬' },
  { id: 2, label: 'Computers', value: 150, suffix: '+', icon: '🖥️' },
  { id: 3, label: 'Daily Users', value: 200, suffix: '+', icon: '👥' },
  { id: 4, label: 'Satisfaction Rate', value: 98, suffix: '%', icon: '⭐' }
];

const Counter = ({ target, suffix, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span className="stat-number-value">{count}{suffix}</span>;
};

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="container">
        <div className="stats-grid">
          {statsData.map((stat) => (
            <div key={stat.id} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">
                {isVisible ? <Counter target={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;