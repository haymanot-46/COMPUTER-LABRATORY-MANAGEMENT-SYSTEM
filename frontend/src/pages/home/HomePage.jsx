import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Inventory2 as InventoryIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudOff as CloudOffIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import HeroSection from '../../components/common/HeroSection/HeroSection';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const features = [
    {
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      title: 'Laboratory Scheduling',
      description: 'Book computer laboratories for academic sessions with automated conflict detection and approval workflows.',
      color: '#10b981',
      delay: 0.1
    },
    {
      icon: <ComputerIcon sx={{ fontSize: 40 }} />,
      title: 'Computer Tracking',
      description: 'Maintain an up-to-date inventory of all computers including specifications, status, and maintenance history.',
      color: '#3b82f6',
      delay: 0.2
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      title: 'Attendance Management',
      description: 'Digital attendance marking with offline support and automatic sync when internet is restored.',
      color: '#f59e0b',
      delay: 0.3
    },
    {
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      title: 'Maintenance Requests',
      description: 'Streamline the process of reporting, tracking, and resolving computer hardware/software issues.',
      color: '#ef4444',
      delay: 0.4
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      title: 'Asset Management',
      description: 'Track all laboratory equipment including monitors, UPS, projectors, and peripherals with audit trails.',
      color: '#8b5cf6',
      delay: 0.5
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      title: 'Comprehensive Reports',
      description: 'Generate attendance, utilization, inventory, and maintenance reports in multiple formats.',
      color: '#06b6d4',
      delay: 0.6
    }
  ];

  const stats = [
    { value: '5+', label: 'Laboratories', icon: <SchoolIcon /> },
    { value: '150+', label: 'Computers', icon: <ComputerIcon /> },
    { value: '8', label: 'User Roles', icon: <PeopleIcon /> },
    { value: '98%', label: 'Satisfaction', icon: <SecurityIcon /> }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const dashboardRoutes = {
            admin: '/dashboard/admin',
            teacher: '/dashboard/teacher',
            student: '/dashboard/student',
            lab_manager: '/dashboard/lab-manager',
            dean: '/dashboard/dean',
            lab_assistant: '/dashboard/lab-assistant',
            ict: '/dashboard/ict',
            asset: '/dashboard/asset'
          };
          navigate(dashboardRoutes[user.role] || '/dashboard');
        } catch (error) {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section with Carousel */}
      <HeroSection 
        onGetStarted={handleGetStarted}
        onLearnMore={scrollToFeatures}
        isAuthenticated={isAuthenticated}
      />

      {/* Features Section */}
      <section id="features" className="features-section">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">
              Everything You Need to Manage
              <span className="title-highlight"> Computer Labs</span>
            </h2>
            <p className="section-subtitle">
              CLMS provides a complete solution for laboratory management with
              role-based access for all stakeholders.
            </p>
          </div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  viewport={{ once: true }}
                >
                  <Card className="feature-card" sx={{ borderTop: `4px solid ${feature.color}` }}>
                    <CardContent>
                      <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                        {feature.icon}
                      </div>
                      <Typography variant="h5" className="feature-title">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" className="feature-description">
                        {feature.description}
                      </Typography>
                      <Link to="/features" className="feature-link">
                        Learn More <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container maxWidth="md">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Ready to Transform Your Laboratory Management?
            </h2>
            <p className="cta-description">
              Join Injibara University's Computer Laboratory Management System today
              and experience efficient, digital laboratory operations.
            </p>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              className="btn-cta"
              endIcon={<ArrowForwardIcon />}
            >
              Get Started
            </Button>
            <p className="cta-note">
              Free for Injibara University students and staff.
            </p>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;