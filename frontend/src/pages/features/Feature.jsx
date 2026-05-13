// frontend/src/pages/features/Feature.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Inventory2 as InventoryIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudOff as CloudOffIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Import role images
import adminImg from '../../../assets/roles-image/photo_2025-12-01_08-30-15.jpg';
import labManagerImg from '../../../assets/roles-image/photo_2025-12-01_08-31-10.jpg';
import teacherImg from '../../../assets/roles-image/photo_2025-12-01_08-31-30.jpg';
import studentImg from '../../../assets/roles-image/photo_2025-12-01_08-31-55.jpg';
import deanImg from '../../../assets/roles-image/photo_2026-05-07_11-42-50.jpg';
import labAssistantImg from '../../../assets/roles-image/photo_2026-05-07_11-42-55.jpg';
import ictImg from '../../../assets/roles-image/photo_2026-05-07_11-43-11.jpg';
import assetImg from '../../../assets/roles-image/photo_2026-05-07_11-46-37.jpg';

// Also import feature images
import schedulingImg from '../../../assets/screan-shoot-system/Screenshot 2026-05-07 121027.png';
import computerTrackingImg from '../../../assets/screan-shoot-system/Screenshot 2026-05-07 121227.png';
import attendanceImg from '../../../assets/screan-shoot-system/Screenshot 2026-05-07 123024.png';
import maintenanceImg from '../../../assets/screan-shoot-system/Screenshot 2026-05-07 121357.png';
import assetManagementImg from '../../../assets/screan-shoot-system/Screenshot 2026-05-07 121619.png';
import reportsImg from '../../../assets/screan-shoot-system/Screenshot 2026-05-07 121458.png';

import './Feature.css';

const FeaturesPage = () => {
  const navigate = useNavigate();

  // Map roles to images
  const roleImages = {
    'System Administrator': adminImg,
    'Laboratory Manager': labManagerImg,
    'Teacher': teacherImg,
    'Student': studentImg,
    'Department Dean': deanImg,
    'Lab Assistant': labAssistantImg,
    'ICT Team': ictImg,
    'Asset Division': assetImg
  };

  // Map feature images
  const featureImages = {
    'Laboratory Scheduling': schedulingImg,
    'Computer Tracking': computerTrackingImg,
    'Attendance Management': attendanceImg,
    'Maintenance Requests': maintenanceImg,
    'Asset Management': assetManagementImg,
    'Comprehensive Reports': reportsImg
  };

  const mainFeatures = [
    {
      icon: <ScheduleIcon sx={{ fontSize: 48 }} />,
      image: schedulingImg,
      title: 'Laboratory Scheduling',
      description: 'Easily book computer laboratories for academic sessions with real-time availability checking.',
      benefits: [
        'Automated conflict detection',
        'Email notifications for approvals',
        'Calendar view integration',
        'Batch scheduling for semesters'
      ]
    },
    {
      icon: <ComputerIcon sx={{ fontSize: 48 }} />,
      image: computerTrackingImg,
      title: 'Computer Tracking',
      description: 'Maintain a complete inventory of all computers with detailed specifications.',
      benefits: [
        'Asset tag management',
        'Real-time status tracking',
        'Maintenance history',
        'Warranty tracking'
      ]
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 48 }} />,
      image: attendanceImg,
      title: 'Attendance Management',
      description: 'Digital attendance marking with offline support for unreliable internet.',
      benefits: [
        'Offline marking with sync',
        'Bulk attendance updates',
        'Student self-service view',
        'Export reports (CSV/PDF)'
      ]
    },
    {
      icon: <BuildIcon sx={{ fontSize: 48 }} />,
      image: maintenanceImg,
      title: 'Maintenance Requests',
      description: 'Streamline issue reporting and tracking for computer hardware and software.',
      benefits: [
        'Priority-based routing',
        'Assign to technicians',
        'Resolution tracking',
        'Parts inventory tracking'
      ]
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 48 }} />,
      image: assetManagementImg,
      title: 'Asset Management',
      description: 'Track all laboratory equipment including monitors, UPS, projectors, and peripherals.',
      benefits: [
        'Equipment audit trails',
        'Warranty expiry alerts',
        'Borrow/return tracking',
        'Depreciation calculation'
      ]
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
      image: reportsImg,
      title: 'Comprehensive Reports',
      description: 'Generate detailed reports for all aspects of laboratory management.',
      benefits: [
        'Attendance analytics',
        'Utilization metrics',
        'Maintenance summaries',
        'Export in multiple formats'
      ]
    }
  ];

  const technicalFeatures = [
    { icon: <SecurityIcon />, title: 'Role-Based Access', description: '8 distinct user roles with granular permissions' },
    { icon: <SpeedIcon />, title: 'Fast Performance', description: 'Optimized queries and caching for quick responses' },
    { icon: <CloudOffIcon />, title: 'Offline Support', description: 'Mark attendance even without internet connection' },
    { icon: <PeopleIcon />, title: 'Multi-User Support', description: 'Support for up to 500 concurrent users' },
    { icon: <PrintIcon />, title: 'Print Reports', description: 'Direct printing of reports and attendance sheets' },
    { icon: <DownloadIcon />, title: 'Data Export', description: 'Export data to CSV, Excel, and PDF formats' }
  ];

  const userRoles = [
    { role: 'System Administrator', icon: '👑', description: 'Full system access and configuration', image: adminImg },
    { role: 'Laboratory Manager', icon: '🔬', description: 'Lab operations and schedule approvals', image: labManagerImg },
    { role: 'Teacher', icon: '👨‍🏫', description: 'Book labs and mark attendance', image: teacherImg },
    { role: 'Student', icon: '👨‍🎓', description: 'View schedules and attendance', image: studentImg },
    { role: 'Department Dean', icon: '📚', description: 'Department oversight and batch scheduling', image: deanImg },
    { role: 'Lab Assistant', icon: '🛠️', description: 'Assist with attendance and equipment', image: labAssistantImg },
    { role: 'ICT Team', icon: '🔧', description: 'Technical support and maintenance', image: ictImg },
    { role: 'Asset Division', icon: '📦', description: 'Equipment management and audits', image: assetImg }
  ];

  return (
    <div className="features-page">
      {/* Header */}
      <div className="features-header">
        <Container maxWidth="xl">
          <div className="header-content">
            <div className="header-left">
              <IconButton onClick={() => navigate('/')} className="back-button">
                <ArrowBackIcon /> back to home
              </IconButton>
              <div>
                <Typography variant="h4" className="header-title">
                  Features Overview
                </Typography>
                <Typography variant="body1" className="header-subtitle">
                  Discover what CLMS can do for laboratory management for the features
                </Typography>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="features-hero">
        <Container maxWidth="md">
          <div className="hero-content">
            <SchoolIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
            <Typography variant="h2" className="hero-title">
              Powerful Features for
              <span className="highlight"> Modern Labs</span>
            </Typography>
            <Typography variant="body1" className="hero-description">
              CLMS provides everything we need to manage the  computer laboratories efficiently,
              from scheduling to asset tracking and attendance management.
            </Typography>
          </div>
        </Container>
      </section>

      {/* Main Features Grid */}
      <section className="main-features">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Core Features</span>
            <Typography variant="h3" className="section-title">
              Everything You Need in One Platform
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Comprehensive tools designed specifically for university laboratory management
            </Typography>
          </div>

          <Grid container spacing={4}>
            {mainFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card className="feature-detail-card">
                  <div className="feature-image-container">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="feature-image"
                    />
                    <div className="feature-icon-overlay">{feature.icon}</div>
                  </div>
                  <CardContent>
                    <Typography variant="h5" className="feature-title">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className="feature-desc">
                      {feature.description}
                    </Typography>
                    <List className="benefits-list">
                      {feature.benefits.map((benefit, i) => (
                        <ListItem key={i} disableGutters>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Technical Features */}
      <section className="technical-features">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Technical Highlights</span>
            <Typography variant="h3" className="section-title">
              Built for Performance & Security
            </Typography>
          </div>

          <Grid container spacing={3}>
            {technicalFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper className="tech-card">
                  <div className="tech-icon">{feature.icon}</div>
                  <Typography variant="h6" className="tech-title">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className="tech-desc">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* User Roles Section with Images */}
      <section className="roles-section">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">User Roles</span>
            <Typography variant="h3" className="section-title">
              Designed for 8 Different Roles
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Role-based dashboards and permissions for every stakeholder
            </Typography>
          </div>

          <Grid container spacing={3}>
            {userRoles.map((role, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className="role-card">
                  <CardContent>
                    <div className="role-image-container">
                      <img 
                        src={role.image} 
                        alt={role.role}
                        className="role-image"
                      />
                    </div>
                    <Typography variant="h6" className="role-title">
                      {role.role}
                    </Typography>
                    <Typography variant="caption" className="role-desc">
                      {role.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="features-cta">
        <Container maxWidth="md">
          <div className="cta-box">
            <Typography variant="h4" className="cta-title">
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" className="cta-text">
              Join Injibara University's CLMS today and transform your laboratory management.
            </Typography>
            <div className="cta-buttons">
              <Button variant="contained" className="cta-primary" onClick={() => navigate('/register')}>
                Create Account
              </Button>
              <Button variant="outlined" className="cta-secondary" onClick={() => navigate('/contact')}>
                Contact Sales
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default FeaturesPage;