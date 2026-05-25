// frontend/src/pages/contact/Contact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  WhatsApp as WhatsAppIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  SupportAgent as SupportIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNotification } from '../../hooks';
import { contactService } from '../../services';
import './Contact.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal'
  });
  
  const [errors, setErrors] = useState({});

  const contactInfo = [
    { icon: <LocationIcon />, title: 'Visit Us', details: 'Injibara University, Injibara, Ethiopia', color: '#10b981' },
    { icon: <PhoneIcon />, title: 'Call Us', details: '+251-946-215-450', color: '#3b82f6' },
    { icon: <EmailIcon />, title: 'Email Us', details: 'haymanotebabu2@.com', color: '#f59e0b' },
    { icon: <TimeIcon />, title: 'Office Hours', details: 'Mon - Fri: 8:00 AM - 5:00 PM', color: '#8b5cf6' }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, name: 'Facebook', url: 'https://facebook.com/injibarau', color: '#1877f2' },
    { icon: <TwitterIcon />, name: 'Twitter', url: 'https://twitter.com/injibara', color: '#1da1f2' },
    { icon: <LinkedInIcon />, name: 'LinkedIn', url: 'https://linkedin.com/school/injibara', color: '#0077b5' },
    { icon: <WhatsAppIcon />, name: 'WhatsApp', url: 'https://wa.me/+251946215450', color: '#25d366' }
  ];

  const categories = [
    { value: 'general', label: 'General question' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'maintenance', label: 'Maintenance Report' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'normal', label: 'Normal', color: '#3b82f6' },
    { value: 'high', label: 'High', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    if (formData.message && formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const data = await contactService.submit(formData);
      
      if (data.success) {
        setTicketInfo(data.ticket);
        setShowTicketDialog(true);
        setFormData({ name: '', email: '', subject: '', message: '', category: 'general', priority: 'normal' });
        addToast('Your message has been sent successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      addToast('Error sending message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <Container maxWidth="xl">
          <div className="header-content">
            <IconButton onClick={() => navigate('/')} className="back-button">
              <ArrowBackIcon /> back to home
            </IconButton>
            <div className="header-text">
              <Typography variant="h4" className="header-title">
                Contact Us
              </Typography>
              <Typography variant="body1" className="header-subtitle">
                Get in touch with the CLMS team
              </Typography>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="contact-hero">
        <Container maxWidth="md">
          <div className="hero-content">
            <SupportIcon sx={{ fontSize: 56, color: '#10b981', mb: 2 }} />
            <Typography variant="h2" className="hero-title">
              We're Here to Help
            </Typography>
            <Typography variant="body1" className="hero-description">
              Have questions or need assistance? Our support team is ready to help.
              Fill out the form and we'll get back to you within 24 hours.
            </Typography>
          </div>
        </Container>
      </section>

      {/* Contact Info Cards */}
      <Container maxWidth="xl" className="contact-info-section">
        <Grid container spacing={3}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="info-card">
                <CardContent>
                  <div className="info-icon" style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                    {info.icon}
                  </div>
                  <Typography variant="h6" className="info-title">
                    {info.title}
                  </Typography>
                  <Typography variant="body2" className="info-details">
                    {info.details}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Form */}
      <Container maxWidth="xl" className="contact-form-section">
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper className="form-card">
              <Typography variant="h5" className="form-title">
                Send Us a Message
              </Typography>
              <Typography variant="body2" className="form-subtitle">
                All messages are reviewed by our Lab Manager and lab admin you'll receive a response via email.
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      SelectProps={{ native: true }}
                    >
                      {categories.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      SelectProps={{ native: true }}
                    >
                      {priorities.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                 
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message *"
                      name="message"
                      multiline
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  className="submit-button"
                  endIcon={!loading && <SendIcon />}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
                </Button>
              </form>
            </Paper>
          </Grid>

         <Grid item xs={12} md={5}>
                     <Paper className="map-card">
                       <Typography variant="h5" className="map-title">
                         Visit Our Campus
                       </Typography>
                       <div className="map-container">
                         <iframe
                           title="Injibara University Location"
                           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158311.26771043472!2d36.567543599999996!3d10.9571311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x163e7e4b7b3b3b3b%3A0x7b3b3b3b3b3b3b3b!2sInjibara%20University!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                           width="100%"
                           height="250"
                           style={{ border: 0 }}
                           allowFullScreen=""
                           loading="lazy"
                           referrerPolicy="no-referrer-when-downgrade"
                         ></iframe>
                       </div>
                     </Paper>
         
                     {/* Social Links */}
                     <Paper className="social-card">
                       <Typography variant="h5" className="social-title">
                         Connect With Us
                       </Typography>
                       <div className="social-links">
                         {socialLinks.map((social, index) => (
                           <IconButton
                             key={index}
                             className="social-icon"
                             href={social.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             sx={{ backgroundColor: `${social.color}15`, color: social.color }}
                           >
                             {social.icon}
                           </IconButton>
                         ))}
                       </div>
                     </Paper>
                   </Grid>
        </Grid>
      </Container>

      {/* Ticket Info Dialog */}
      <Dialog open={showTicketDialog} onClose={() => setShowTicketDialog(false)}>
        <DialogTitle className="ticket-dialog-title">
          <CheckCircleIcon sx={{ color: '#10b981', mr: 1 }} />
          Message Sent Successfully!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Your message has been received. Our Lab Manager will review it and respond to your email.
          </Typography>
          {ticketInfo && (
            <Box className="ticket-info">
              <Typography variant="subtitle2">Ticket Number:</Typography>
              <Chip label={ticketInfo.ticketNumber} color="primary" size="small" />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Status:</Typography>
              <Chip label={ticketInfo.status} color="warning" size="small" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTicketDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ContactPage;