import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import injibaraLogo from '../../../../assets/diff-logo/Picture1.png';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Tooltip,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Computer as ComputerIcon,
  CalendarMonth as ScheduleIcon,
  Build as MaintenanceIcon,
  Inventory2 as AssetIcon,
  Assessment as ReportIcon,
  People as UsersIcon,
  Science as LabIcon,
  AccountCircle as ProfileIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:900px)');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        // Load profile image from user object or localStorage
        if (parsedUser.profile_image) {
          setProfileImage(parsedUser.profile_image);
        } else {
          const savedImage = localStorage.getItem('profileImage');
          if (savedImage) {
            setProfileImage(savedImage);
          }
        }
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for storage events to update profile image across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileImage' || e.key === 'user') {
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user:', error);
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profileImage');
    setIsAuthenticated(false);
    setUser(null);
    setProfileImage(null);
    navigate('/');
    setAnchorElUser(null);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = user.role;
    const dashboardMap = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher',
      student: '/dashboard/student',
      lab_manager: '/dashboard/lab-manager',
      dean: '/dashboard/dean',
      lab_assistant: '/dashboard/lab-assistant',
      ict: '/dashboard/ict',
      asset: '/dashboard/asset'
    };
    return dashboardMap[role] || '/dashboard';
  };

  const getRoleIcon = () => {
    const role = user?.role;
    const icons = {
      admin: '👑',
      teacher: '👨‍🏫',
      student: '👨‍🎓',
      lab_manager: '🔬',
      dean: '📚',
      lab_assistant: '🛠️',
      ict: '💻',
      asset: '📦'
    };
    return icons[role] || '👤';
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Features', path: '/features', icon: <ComputerIcon /> },
    { label: 'About', path: '/about', icon: <SchoolIcon /> },
    { label: 'Contact', path: '/contact', icon: <ScheduleIcon /> }
  ];

  const userMenuItems = [
    { label: 'Dashboard', path: getDashboardLink(), icon: <DashboardIcon /> },
    { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
    { label: 'Change Password', path: '/change-password', icon: <LockIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { label: 'Logout', action: handleLogout, icon: <LogoutIcon /> }
  ];

  // Don't show header on auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  const mobileMenuList = (
    <Box sx={{ width: 280 }} role="presentation" onClick={() => setMobileMenuOpen(false)}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={() => setMobileMenuOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.label} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <Divider />
        {isAuthenticated ? (
          <>
            <ListItem button onClick={() => navigate(getDashboardLink())}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate('/profile')}>
              <ListItemIcon><ProfileIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={() => navigate('/change-password')}>
              <ListItemIcon><LockIcon /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button onClick={() => navigate('/login')}>
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button onClick={() => navigate('/register')}>
              <ListItemIcon><RegisterIcon /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  // Determine if current link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Get avatar content (image or initials/icon)
  const getAvatarContent = () => {
    if (profileImage) {
      return (
        <Avatar 
          src={profileImage}
          sx={{ 
            width: 40,
            height: 40,
            transition: 'transform 0.3s ease',
            objectFit: 'cover'
          }}
          imgProps={{ style: { objectFit: 'cover' } }}
        />
      );
    }
    return (
      <Avatar 
        sx={{ 
          bgcolor: '#10b981',
          width: 40,
          height: 40,
          transition: 'transform 0.3s ease',
          fontSize: '1.2rem'
        }}
        className="avatar-green"
      >
        {getInitials()}
      </Avatar>
    );
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={isScrolled ? 4 : 0}
        className={isScrolled ? 'header-scrolled' : 'header-transparent'}
        sx={{
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo Section */}
            <Box 
              className="logo-container"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 }
              }} 
              onClick={() => navigate('/')}
            >
              {/* University Logo Image */}
              <Box
                component="img"
                src={injibaraLogo}
                alt="Injibara University Logo"
                className="logo-image"
                sx={{
                  width: 45,
                  height: 45,
                  mr: 1.5,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isScrolled ? '1px solid #e5e7eb' : '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'white',
                  padding: '4px'
                }}
              />
              
              {/* CLMS Text Logo */}
              <Box>
                <Typography
                  variant="caption"
                  className="logo-subtitle"
                  sx={{ 
                    display: { xs: 'none', sm: 'block' }, 
                    fontSize: '20px',
                    opacity: 0.8,
                    letterSpacing: '0.3px'
                  }}
                >
                  INJIBARA UNIVERSITY
                </Typography>
                <Typography
                  variant="h6"
                  noWrap
                  className="logo-title"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: 'inherit',
                    textDecoration: 'none',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  እንጅባራ ዩኒቨርሲቲ (CLMS)
                </Typography>
                <Typography
                  variant="caption"
                  className="logo-subtitle"
                  sx={{ 
                    display: { xs: 'none', sm: 'block' }, 
                    fontSize: '16px',
                    opacity: 0.8,
                    letterSpacing: '0.3px'
                  }}
                >
                  Explore Your Creative Potentials
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`nav-link ${isActiveLink(item.path) ? 'nav-active' : ''}`}
                    sx={{
                      color: 'inherit',
                      fontWeight: 500,
                      px: 2,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Auth Buttons - Desktop */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {isAuthenticated ? (
                  <>
                    <Tooltip title="Account settings">
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }} className="user-avatar">
                        {getAvatarContent()}
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar"
                      anchorEl={anchorElUser}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      keepMounted
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                    >
                      {userMenuItems.map((item) => (
                        <MenuItem 
                          key={item.label} 
                          className="dropdown-menu-item"
                          onClick={() => {
                            if (item.action) {
                              item.action();
                            } else {
                              navigate(item.path);
                            }
                            handleCloseUserMenu();
                          }}
                          sx={{ minWidth: 180 }}
                        >
                          <ListItemIcon sx={{ minWidth: 35, color: '#10b981' }}>
                            {item.icon}
                          </ListItemIcon>
                          <Typography textAlign="center">{item.label}</Typography>
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      variant="text"
                      onClick={() => navigate('/login')}
                      startIcon={<LoginIcon />}
                      className="login-btn"
                      sx={{ 
                        color: 'inherit',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                      startIcon={<RegisterIcon />}
                      className="register-btn"
                      sx={{
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {mobileMenuList}
      </Drawer>

      {/* Spacer to prevent content hiding under AppBar */}
      <Toolbar />
    </>
  );
};

export default Header;