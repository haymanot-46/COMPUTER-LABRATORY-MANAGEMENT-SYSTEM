import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Build,
  Inventory,
  Schedule,
  Warning,
  Computer,
  QrCodeScanner
} from '@mui/icons-material';

const LabAssistantDashboard = () => {
  const stats = [
    { title: 'Today\'s Labs', value: '4', icon: <Schedule />, color: '#667eea' },
    { title: 'Equipment Status', value: '98%', icon: <Inventory />, color: '#48bb78' },
    { title: 'Pending Tasks', value: '3', icon: <Assignment />, color: '#ed8936' },
    { title: 'Issues Reported', value: '2', icon: <Warning />, color: '#e53e3e' },
  ];

  const assignedLabs = [
    { id: 1, lab: 'Lab 101', time: '8:30 AM - 10:30 AM', course: 'Database Systems', instructor: 'Dr. Abebe', task: 'Setup computers, distribute materials' },
    { id: 2, lab: 'Lab 102', time: '11:00 AM - 1:00 PM', course: 'Computer Networks', instructor: 'Dr. Almaz', task: 'Check network equipment' },
    { id: 3, lab: 'Lab 103', time: '2:00 PM - 4:00 PM', course: 'Software Engineering', instructor: 'Dr. Biruk', task: 'Install software updates' },
  ];

  const equipmentIssues = [
    { id: 1, computer: 'COMP-045', issue: 'Slow performance', reported: '2 hours ago', status: 'pending' },
    { id: 2, computer: 'COMP-089', issue: 'Network not connecting', reported: '1 day ago', status: 'in-progress' },
  ];

  const materialRequests = [
    { id: 1, item: 'HDMI Cables', quantity: 5, lab: 'Lab 101', priority: 'high' },
    { id: 2, item: 'Keyboards', quantity: 3, lab: 'Lab 102', priority: 'medium' },
    { id: 3, item: 'USB Drives', quantity: 10, lab: 'Lab 103', priority: 'low' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Lab Assistant Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Laboratory Support & Equipment Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<QrCodeScanner />}>
          Scan Equipment
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Assigned Labs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🔧 Today's Assigned Labs
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Lab</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Tasks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedLabs.map((lab) => (
                    <TableRow key={lab.id}>
                      <TableCell>{lab.lab}</TableCell>
                      <TableCell>{lab.time}</TableCell>
                      <TableCell>{lab.course}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{lab.task}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Equipment Issues */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              ⚠️ Equipment Issues
            </Typography>
            <List>
              {equipmentIssues.map((issue) => (
                <ListItem key={issue.id} sx={{ borderBottom: '1px solid #eee' }}>
                  <ListItemIcon>
                    <Computer />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${issue.computer} - ${issue.issue}`}
                    secondary={`Reported: ${issue.reported}`}
                  />
                  <Chip 
                    label={issue.status} 
                    size="small" 
                    color={issue.status === 'pending' ? 'warning' : 'info'} 
                  />
                </ListItem>
              ))}
            </List>
            <Button size="small" sx={{ mt: 1 }}>
              Report New Issue
            </Button>
          </Paper>
        </Grid>

        {/* Material Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📦 Material Requests
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Lab</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.item}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>{request.lab}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.priority} 
                          size="small" 
                          color={request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" color="success">
                          Fulfill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LabAssistantDashboard;