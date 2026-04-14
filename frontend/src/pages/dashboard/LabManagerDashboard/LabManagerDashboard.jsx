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
  LinearProgress
} from '@mui/material';
import {
  Science,
  Computer,
  Schedule,
  Build,
  CheckCircle,
  Pending,
  Warning,
  Today
} from '@mui/icons-material';

const LabManagerDashboard = () => {
  const stats = [
    { title: 'Laboratories', value: '5', icon: <Science />, color: '#667eea' },
    { title: 'Computers', value: '120', icon: <Computer />, color: '#48bb78' },
    { title: 'Active Sessions', value: '8', icon: <Schedule />, color: '#ed8936' },
    { title: 'Maintenance', value: '3', icon: <Build />, color: '#e53e3e' },
  ];

  const pendingApprovals = [
    { id: 1, lab: 'Lab 101', course: 'Database Systems', instructor: 'Dr. Abebe', time: '10:00 AM', date: '2026-04-15' },
    { id: 2, lab: 'Lab 102', course: 'Computer Networks', instructor: 'Dr. Almaz', time: '2:00 PM', date: '2026-04-15' },
    { id: 3, lab: 'Lab 103', course: 'Software Engineering', instructor: 'Dr. Biruk', time: '11:00 AM', date: '2026-04-16' },
  ];

  const labUtilization = [
    { name: 'Lab 101', utilization: 85, status: 'High' },
    { name: 'Lab 102', utilization: 62, status: 'Medium' },
    { name: 'Lab 103', utilization: 45, status: 'Low' },
    { name: 'Lab 104', utilization: 78, status: 'High' },
    { name: 'Lab 105', utilization: 30, status: 'Low' },
  ];

  const todaySchedules = [
    { time: '8:00 AM - 10:00 AM', lab: 'Lab 101', course: 'Advanced Databases', instructor: 'Dr. Abebe' },
    { time: '10:00 AM - 12:00 PM', lab: 'Lab 102', course: 'Web Development', instructor: 'Dr. Almaz' },
    { time: '1:00 PM - 3:00 PM', lab: 'Lab 101', course: 'Data Structures', instructor: 'Dr. Chaltu' },
    { time: '3:00 PM - 5:00 PM', lab: 'Lab 103', course: 'Network Security', instructor: 'Dr. Desta' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Laboratory Manager Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage Laboratories & Resources
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Today />}>
          View Schedule
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
        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Pending Approvals
              </Typography>
              <Chip label="3 pending" color="warning" size="small" />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Lab/Course</TableCell>
                    <TableCell>Instructor</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApprovals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{item.lab}</Typography>
                        <Typography variant="caption">{item.course}</Typography>
                      </TableCell>
                      <TableCell>{item.instructor}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{item.date}</Typography>
                        <Typography variant="caption" display="block">{item.time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" color="success" variant="outlined" sx={{ mr: 1 }}>
                          Approve
                        </Button>
                        <Button size="small" color="error" variant="outlined">
                          Reject
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

        {/* Lab Utilization */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Laboratory Utilization
            </Typography>
            {labUtilization.map((lab, index) => (
              <Box key={index} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{lab.name}</Typography>
                  <Typography variant="body2" fontWeight="bold">{lab.utilization}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={lab.utilization}
                  color={lab.utilization > 70 ? 'error' : lab.utilization > 50 ? 'warning' : 'success'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Today's Schedule */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📅 Today's Schedule
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Laboratory</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Instructor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todaySchedules.map((schedule, index) => (
                    <TableRow key={index}>
                      <TableCell>{schedule.time}</TableCell>
                      <TableCell>{schedule.lab}</TableCell>
                      <TableCell>{schedule.course}</TableCell>
                      <TableCell>{schedule.instructor}</TableCell>
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

export default LabManagerDashboard;