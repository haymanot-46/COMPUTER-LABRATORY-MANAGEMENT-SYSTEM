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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Build,
  CheckCircle,
  Pending,
  Computer,
  NetworkCheck,
  Security,
  Update,
  Warning,
  Assignment
} from '@mui/icons-material';

const ICTDashboard = () => {
  const stats = [
    { title: 'Active Computers', value: '98', icon: <Computer />, color: '#48bb78' },
    { title: 'In Maintenance', value: '12', icon: <Build />, color: '#ed8936' },
    { title: 'Pending Requests', value: '5', icon: <Assignment />, color: '#e53e3e' },
    { title: 'Completed (This Week)', value: '23', icon: <CheckCircle />, color: '#4299e1' },
  ];

  const assignedRequests = [
    { id: 1, computer: 'COMP-045', lab: 'Lab 101', issue: 'Power supply failure', priority: 'Critical', status: 'assigned' },
    { id: 2, computer: 'COMP-089', lab: 'Lab 102', issue: 'Slow performance', priority: 'High', status: 'in-progress' },
    { id: 3, computer: 'COMP-023', lab: 'Lab 101', issue: 'Network not connecting', priority: 'Medium', status: 'assigned' },
    { id: 4, computer: 'COMP-067', lab: 'Lab 103', issue: 'OS update required', priority: 'Low', status: 'pending' },
  ];

  const systemHealth = [
    { component: 'Network', status: 'Healthy', uptime: '99.9%', latency: '5ms' },
    { component: 'Database', status: 'Healthy', uptime: '99.95%', latency: '10ms' },
    { component: 'Storage', status: 'Warning', usage: '78%', latency: '25ms' },
    { component: 'Security', status: 'Healthy', threats: '0', latency: 'N/A' },
  ];

  const softwareUpdates = [
    { id: 1, name: 'Windows Security Update', computers: 45, status: 'pending', priority: 'high' },
    { id: 2, name: 'VS Code Update', computers: 98, status: 'in-progress', priority: 'medium' },
    { id: 3, name: 'Antivirus Definition', computers: 120, status: 'completed', priority: 'high' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            ICT Team Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Technical Support & System Maintenance
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Update />}>
          System Update
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
        {/* Assigned Maintenance Requests */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🔧 My Assigned Requests
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Computer</TableCell>
                    <TableCell>Lab</TableCell>
                    <TableCell>Issue</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.computer}</TableCell>
                      <TableCell>{request.lab}</TableCell>
                      <TableCell>{request.issue}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.priority} 
                          size="small" 
                          color={request.priority === 'Critical' ? 'error' : request.priority === 'High' ? 'warning' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          size="small" 
                          color={request.status === 'completed' ? 'success' : request.status === 'in-progress' ? 'info' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          {request.status === 'assigned' ? 'Start' : 'Update'}
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
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              System Health
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {systemHealth.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.component}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status} 
                          size="small" 
                          color={item.status === 'Healthy' ? 'success' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {item.uptime || item.usage || item.threats}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Software Updates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Software Updates
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Update Name</TableCell>
                    <TableCell>Computers</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {softwareUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>{update.name}</TableCell>
                      <TableCell>{update.computers}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box flexGrow={1} mr={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={update.status === 'completed' ? 100 : update.status === 'in-progress' ? 60 : 0} 
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography variant="caption">
                            {update.status === 'completed' ? '100%' : update.status === 'in-progress' ? '60%' : '0%'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={update.status} 
                          size="small" 
                          color={update.status === 'completed' ? 'success' : update.status === 'in-progress' ? 'info' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Deploy
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

export default ICTDashboard;