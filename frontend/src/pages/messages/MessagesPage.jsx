// frontend/src/pages/lab-manager/Messages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Visibility,
  Reply,
  Refresh,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { contactService } from '../../services';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [tabValue]);

  const fetchMessages = async () => {
    setLoading(true);
    const status = tabValue === 0 ? 'pending' : tabValue === 1 ? 'replied' : 'resolved';
    try {
      const data = await contactService.getMessages(status);
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setOpenDialog(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    setSending(true);
    try {
      const data = await contactService.reply(selectedMessage.id, { reply: replyText });
      if (data.success) {
        setSuccessOpen(true);
        setOpenDialog(false);
        setReplyText('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'replied': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const handleBackToDashboard = () => {
    // Check user role to navigate to appropriate dashboard
    const userRole = localStorage.getItem('userRole') || 'lab_manager';
    if (userRole === 'admin') {
      navigate('/dashboard/admin');
    } else if (userRole === 'lab_manager') {
      navigate('/dashboard/lab-manager');
    }
  };

  const getDashboardPath = () => {
    const userRole = localStorage.getItem('userRole') || 'lab_manager';
    return userRole === 'admin' ? '/dashboard/admin' : '/dashboard/lab-manager';
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#064e3b', mb: 3 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToDashboard}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CLMS - Contact Messages
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleBackToDashboard}
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={handleBackToDashboard} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">
                <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Contact Messages
              </Typography>
            </Box>
            <IconButton onClick={fetchMessages}>
              <Refresh />
            </IconButton>
          </Box>

          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="Pending" />
            <Tab label="Replied" />
            <Tab label="Resolved" />
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box py={4}>
                          <Typography variant="body1" color="textSecondary">
                            No messages found
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={handleBackToDashboard}
                            sx={{ mt: 2 }}
                            startIcon={<DashboardIcon />}
                          >
                            Back to Dashboard
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    messages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell>{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{msg.name}</TableCell>
                        <TableCell>{msg.email}</TableCell>
                        <TableCell>{msg.subject}</TableCell>
                        <TableCell>
                          <Chip label={msg.category} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={msg.priority} 
                            color={getPriorityColor(msg.priority)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={msg.status} 
                            color={getStatusColor(msg.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleViewMessage(msg)}>
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* View/Reply Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <EmailIcon color="primary" />
              Message Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedMessage && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">From:</Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedMessage.name} ({selectedMessage.email})
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Subject:</Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedMessage.subject}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Message:</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                  </Typography>
                </Paper>

                {selectedMessage.reply && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, color: '#10b981' }}>
                      Previous Reply:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e8f5e9', mb: 2 }}>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedMessage.reply}
                      </Typography>
                    </Paper>
                  </>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Type your response here..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSendReply} 
              variant="contained" 
              disabled={!replyText.trim() || sending}
              startIcon={<Reply />}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
          <Alert severity="success">Reply sent successfully! Email notification has been sent.</Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default MessagesPage;