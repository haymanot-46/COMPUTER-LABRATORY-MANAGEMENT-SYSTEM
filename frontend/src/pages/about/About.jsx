// frontend/src/pages/about/About.jsx
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
  Avatar,
  IconButton,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Computer as ComputerIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  RocketLaunch as RocketLaunchIcon,
  Security as SecurityIcon,
  Handshake as HandshakeIcon,
  Speed as SpeedIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

// Import team member images
import abebechImg from '../../../assets/roles-image/photo_2025-12-01_08-30-15.jpg';
import birukImg from '../../../assets/roles-image/photo_2025-12-01_08-31-10.jpg';
import chaltuImg from '../../../assets/roles-image/photo_2025-12-01_08-31-30.jpg';
import dawitImg from '../../../assets/roles-image/photo_2026-05-07_11-42-55.jpg';
import eleniImg from '../../../assets/roles-image/photo_2026-05-07_11-43-11.jpg';
import fikruImg from '../../../assets/roles-image/photo_2026-05-07_11-46-37.jpg';

import './About.css';

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '2024', label: 'Founded', icon: <RocketLaunchIcon />, color: '#10b981' },
    { value: '5+', label: 'Laboratories', icon: <ComputerIcon />, color: '#3b82f6' },
    { value: '150+', label: 'Computers', icon: <InventoryIcon />, color: '#f59e0b' },
    { value: '8', label: 'User Roles', icon: <PeopleIcon />, color: '#8b5cf6' },
    { value: '1000+', label: 'Students Served', icon: <SchoolIcon />, color: '#ec4899' },
    { value: '98%', label: "User Satisfaction", icon: <StarIcon />, color: '#06b6d4' }
  ];

  const values = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Reliability',
      description: 'We build systems that universities can depend on, 24/7.',
      color: '#10b981'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Efficiency',
      description: 'Streamlining laboratory operations for maximum productivity.',
      color: '#3b82f6'
    },
    {
      icon: <HandshakeIcon sx={{ fontSize: 40 }} />,
      title: 'Collaboration',
      description: 'Working closely with stakeholders to meet every need.',
      color: '#f59e0b'
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality solutions.',
      color: '#8b5cf6'
    }
  ];

  // Team members with real images
  const teamMembers = [
    {
      name: 'esimale geremew',
      role: 'Project Manager',
      department: 'Computer Science',
      image: abebechImg,
      bio: 'Leading the CLMS project with 10+ years of experience in educational technology.',
      email: 'esimal@clms.com',
      linkedin: 'https://linkedin.com/in/abebech-alemu'
    },
    {
      name: 'temare gadie',
      role: 'web Developer',
      department: 'Software Engineering',
      image: birukImg,
      bio: 'Full-stack developer specializing in React and Node.js applications.',
      email: 'temare@clms.com',
      github: 'https://github.com/birukt'
    },
    {
      name: 'melat nigusu',
      role: 'UI/UX Designer',
      department: 'Information Technology',
      image: chaltuImg,
      bio: 'Creating intuitive and accessible user interfaces for all stakeholders.',
      email: 'melat@clms.com',
      portfolio: 'https://chaltu.design'
    },
    {
      name: 'yikeber biresaw',
      role: 'Database Administrator',
      department: 'Computer Engineering',
      image: dawitImg,
      bio: 'Ensuring data integrity, security, and optimal database performance.',
      email: 'yikeber@clms.com'
    },
    {
      name: 'haymanot ebabu',
      role: 'requirement manager',
      department: 'Software Engineering',
      image: eleniImg,
      bio: 'Rigorous testing to ensure system reliability and user satisfaction.',
      email: 'haymanotebabu2@gmail.com.com'
    },
    {
      name: 'tesifahun',
      role: 'Technical support',
      department: 'ICT',
      image: fikruImg,
      bio: 'Managing technical support and maintenance operations.',
      email: 'tesifahun@clms.com'
    }
  ];

  const features = [
    { icon: <ScheduleIcon />, title: 'Smart Scheduling', description: 'Automated conflict detection and approval workflows' },
    { icon: <ComputerIcon />, title: 'Computer Tracking', description: 'Complete inventory management with status tracking' },
    { icon: <AssessmentIcon />, title: 'Attendance Management', description: 'Digital attendance with offline support' },
    { icon: <InventoryIcon />, title: 'Asset Management', description: 'Full equipment lifecycle management' }
  ];

  const achievements = [
    { year: '2024', title: 'System Launch', description: 'CLMS officially launched at Injibara University' },
    { year: '2024', title: 'First 1,000 Users', description: 'Reached milestone of 1,000 active users' },
    { year: '2025', title: 'Mobile Support', description: 'Added responsive design for mobile access' }
  ];

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="about-page">
      {/* Header */}
      <div className="about-header">
        <Container maxWidth="xl">
          <div className="header-content">
            <IconButton onClick={handleBack} className="back-button">
              <ArrowBackIcon /> back to home
            </IconButton>
            <div className="header-text">
              <Typography variant="h4" className="header-title">
                About CLMS
              </Typography>
              <Typography variant="body1" className="header-subtitle">
                Learn more about our mission, team, and technology
              </Typography>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="about-hero">
        <Container maxWidth="md">
          <div className="hero-content">
            <SchoolIcon sx={{ fontSize: 56, color: '#10b981', mb: 2 }} />
            <Typography variant="h2" className="hero-title">
              MIND GARDEN
            </Typography>
            <Typography variant="h5" className="hero-subtitle">
              Computer Laboratory Management System
            </Typography>
            <Typography variant="body1" className="hero-description">
              CLMS is a comprehensive solution developed by MIND GARDEN for Injibara University
              to digitize and streamline all computer laboratory operations.
            </Typography>
            <div className="hero-badge">
              <Chip label="Version 2.0.0" icon={<RocketLaunchIcon />} className="version-chip" />
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-icon" style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                    <Typography variant="h3" className="stat-value">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" className="stat-label">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className="mission-card">
                <CardContent>
                  <div className="mission-icon">🎯</div>
                  <Typography variant="h4" className="mission-title">
                    Our Mission
                  </Typography>
                  <Typography variant="body1" className="mission-text">
                    To provide Injibara University with a robust, efficient, and user-friendly
                    laboratory management system that enhances the learning experience,
                    optimizes resource utilization, and simplifies administrative tasks.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="vision-card">
                <CardContent>
                  <div className="vision-icon">👁️</div>
                  <Typography variant="h4" className="vision-title">
                    Our Vision
                  </Typography>
                  <Typography variant="body1" className="vision-text">
                    To be the leading laboratory management solution for educational institutions
                    across Ethiopia, setting the standard for digital transformation in
                    academic resource management.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Core Values */}
      <section className="values-section">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Core Values</span>
            <Typography variant="h3" className="section-title">
              What Drives Us
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Our principles guide every decision we make
            </Typography>
          </div>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className="value-card">
                  <CardContent>
                    <div className="value-icon" style={{ backgroundColor: `${value.color}15`, color: value.color }}>
                      {value.icon}
                    </div>
                    <Typography variant="h6" className="value-title">
                      {value.title}
                    </Typography>
                    <Typography variant="body2" className="value-description">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Key Features */}
      <section className="features-showcase">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Key Features</span>
            <Typography variant="h3" className="section-title">
              What CLMS Offers
            </Typography>
          </div>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper className="feature-showcase-card">
                  <div className="feature-showcase-icon">{feature.icon}</div>
                  <Typography variant="h6" className="feature-showcase-title">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className="feature-showcase-desc">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Technology Stack</span>
            <Typography variant="h3" className="section-title">
              Built with Modern Technologies
            </Typography>
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper className="tech-card">
                <Typography variant="h6" className="tech-category">
                  🖥️ Backend
                </Typography>
                <div className="tech-items">
                  <Chip label="Node.js" className="tech-chip" />
                  <Chip label="Express.js" className="tech-chip" />
                  <Chip label="MySQL" className="tech-chip" />
                  <Chip label="JWT" className="tech-chip" />
                  <Chip label="Socket.IO" className="tech-chip" />
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="tech-card">
                <Typography variant="h6" className="tech-category">
                  🎨 Frontend
                </Typography>
                <div className="tech-items">
                  <Chip label="React.js" className="tech-chip" />
                  <Chip label="Material-UI" className="tech-chip" />
                  <Chip label="Axios" className="tech-chip" />
                  <Chip label="React Router" className="tech-chip" />
                  <Chip label="Framer Motion" className="tech-chip" />
                </div>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Team Section with Real Images */}
      <section className="team-section">
        <Container maxWidth="xl">
          <div className="section-header">
            <span className="section-badge">Meet the Team</span>
            <Typography variant="h3" className="section-title">
              MIND GARDEN Development Team
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Dedicated professionals committed to excellence
            </Typography>
          </div>

          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="team-card">
                  <CardContent>
                    <div className="team-avatar-container">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="team-avatar-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff&size=120&rounded=true&bold=true`;
                        }}
                      />
                    </div>
                    <Typography variant="h6" className="team-name">
                      {member.name}
                    </Typography>
                    <Typography variant="caption" className="team-role">
                      {member.role}
                    </Typography>
                    <Typography variant="caption" className="team-dept" display="block">
                      {member.department}
                    </Typography>
                    <Typography variant="body2" className="team-bio">
                      {member.bio}
                    </Typography>
                    {member.email && (
                      <div className="team-contact">
                        <EmailIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{member.email}</Typography>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Achievements Timeline */}
      <section className="achievements-section">
        <Container maxWidth="lg">
          <div className="section-header">
            <span className="section-badge">Milestones</span>
            <Typography variant="h3" className="section-title">
              Our Journey
            </Typography>
          </div>

          <div className="timeline">
            {achievements.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot">
                  <CheckCircleIcon />
                </div>
                <div className="timeline-content">
                  <div className="timeline-year">{item.year}</div>
                  <Typography variant="h6" className="timeline-title">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" className="timeline-description">
                    {item.description}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <Container maxWidth="md">
          <div className="cta-box">
            <Typography variant="h4" className="cta-title">
              Want to Learn More?
            </Typography>
            <Typography variant="body1" className="cta-text">
              Have questions about CLMS? We're here to help.
            </Typography>
            <div className="cta-buttons">
              <Button variant="contained" className="cta-primary" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
              <Button variant="outlined" className="cta-secondary" onClick={() => navigate('/features')}>
                Explore Features
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer Note */}
      <div className="about-footer">
        <Container maxWidth="xl">
          <Divider />

        </Container>
      </div>
    </div>
  );
};

export default AboutPage;