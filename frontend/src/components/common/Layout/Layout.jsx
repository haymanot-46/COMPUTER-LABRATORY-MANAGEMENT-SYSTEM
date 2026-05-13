import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Auth pages should NOT show header/footer (clean login page)
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  const isAuthPage = authPages.includes(location.pathname);
  
  // Home page styling
  const isHomePage = location.pathname === '/';

  return (
    <div className="layout">
      {!isAuthPage && <Header />}
      <main className={`layout-main ${isHomePage ? 'home-layout' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;