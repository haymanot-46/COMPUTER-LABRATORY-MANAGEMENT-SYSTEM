import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Footer Component
 * Footer for CLMS with links and information
 * 
 * Traceability: UI-FOOTER-001
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', path: '/features' },
      { name: 'User Roles', path: '/roles' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Documentation', path: '/docs' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'System Status', path: '/status' },
      { name: 'Report Issue', path: '/create-request' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com/injibarau' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/injibarau' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com/school/injibarau' },
    { name: 'Email', icon: '📧', url: 'mailto:info@clms.com' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Description */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">🖥️</span>
            <span className="logo-text">CLMS</span>
          </div>
          <p className="footer-description">
            Computer Laboratory Management System<br />
            Injibara University - Efficient Lab Management
          </p>
          <div className="footer-trace" data-trace="UI-FOOTER-001"></div>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <div className="link-column">
            <h4>Product</h4>
            <ul>
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <ul>
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="link-column">
            <h4>Support</h4>
            <ul>
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="footer-social">
          <h4>Connect With Us</h4>
          <div className="social-icons">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
          <div className="footer-contact">
            <p>📞 +251-946-215-450</p>
            <p>✉️ haymanotebabu2@gmail.com</p>
            <p> Injibara, Ethiopia</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {currentYear} Injibara University - CLMS. All rights reserved.</p>
          <p className="footer-version">Version 2.0.0</p>
          <p className="footer-team">Developed by MIND GARDEN</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;