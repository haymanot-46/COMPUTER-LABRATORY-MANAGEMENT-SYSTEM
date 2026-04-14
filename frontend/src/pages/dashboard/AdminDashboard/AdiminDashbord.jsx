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
  Chip
} from '@mui/material';
import {
  People,
  Computer,
  Schedule,
  Build,
  Assessment,
  Security,
  Storage,
  Warning
} from '@mui/icons-material';

const AdminDashboard = () => {
  // Mock data - will be replaced with API calls
  const stats = [
    { title: 'Total Users', value: '1,245', icon: <People />, color: '#667eea' },
    { title: 'Computers', value: '120', icon: <Computer />, color: '#48bb78' },
    { title: 'Active Labs', value: '5', icon: <Schedule />, color: '#ed8936' },
    { title: 'Maintenance', value: '8', icon: <Build />, color: '#e53e3e' },
    { title: 'Reports', value: '45', icon: <Assessment />, color: '#4299e1' },
    { title: 'Storage Used', value: '78%', icon: <Storage />, color: '#9f7aea' },
  ];

  const recentActivities = [
    { id: 1, action: 'User John Doe registered', time: '2 minutes ago', type: 'user' },
    { id: 2, action: 'New computer added to Lab 101', time: '15 minutes ago', type: 'computer' },
    { id: 3, action: 'Maintenance request #123 completed', time: '1 hour ago', type: 'maintenance' },
    { id: 4, action: 'Schedule approved for Database Systems', time: '3 hours ago', type: 'schedule' },
    { id: 5, action: 'System backup completed', time: '5 hours ago', type: 'system' },
  ];

  const pendingRequests = [
    { id: 1, type: 'User Approval', requester: 'New Teacher', status: 'pending', priority: 'high' },
    { id: 2, type: 'Lab Schedule', requester: 'Dr. Abebe', status: 'pending', priority: 'medium' },
    { id: 3, type: 'Equipment Request', requester: 'Lab 101', status: 'pending', priority: 'low' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            System Overview & Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Security />}>
          System Settings
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
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
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Recent Activities
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Typography variant="body2">{activity.action}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.time}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button size="small" sx={{ mt: 1 }}>
              View All Activities
            </Button>
          </Paper>
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Pending Requests
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Requester</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.priority}
                          size="small"
                          color={request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button size="small" sx={{ mt: 1 }}>
              View All Requests
            </Button>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              System Health
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">Database</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">Redis</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">Storage</Typography>
                  <Chip label="78% Used" color="warning" size="small" />
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">Last Backup</Typography>
                  <Chip label="Today 2:00 AM" color="success" size="small" />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mt={3}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" startIcon={<People />}>
                Add User
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<Computer />}>
                Add Computer
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<Storage />}>
                System Backup
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<Assessment />}>
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;