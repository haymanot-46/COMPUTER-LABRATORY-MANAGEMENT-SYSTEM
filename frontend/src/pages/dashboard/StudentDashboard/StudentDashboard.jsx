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
  ListItemText
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Cancel,
  TrendingUp,
  Computer,
  Assignment,
  CalendarToday,
  Notifications
} from '@mui/icons-material';

const StudentDashboard = () => {
  const stats = [
    { title: 'Attendance', value: '85%', icon: <TrendingUp />, color: '#48bb78', progress: 85 },
    { title: 'Lab Sessions', value: '12', icon: <Schedule />, color: '#667eea', progress: 0 },
    { title: 'Completed Labs', value: '10', icon: <CheckCircle />, color: '#4299e1', progress: 0 },
    { title: 'Absences', value: '2', icon: <Cancel />, color: '#e53e3e', progress: 0 },
  ];

  const upcomingSessions = [
    { date: 'Apr 15, 2026', time: '10:00 AM - 12:00 PM', course: 'Database Systems', lab: 'Lab 101', status: 'upcoming' },
    { date: 'Apr 16, 2026', time: '2:00 PM - 4:00 PM', course: 'Computer Networks', lab: 'Lab 102', status: 'upcoming' },
    { date: 'Apr 18, 2026', time: '9:00 AM - 11:00 AM', course: 'Software Engineering', lab: 'Lab 103', status: 'upcoming' },
  ];

  const recentAttendance = [
    { date: 'Apr 10, 2026', course: 'Database Systems', status: 'Present', time: '10:05 AM' },
    { date: 'Apr 9, 2026', course: 'Computer Networks', status: 'Present', time: '2:10 PM' },
    { date: 'Apr 8, 2026', course: 'Software Engineering', status: 'Absent', time: '-' },
    { date: 'Apr 7, 2026', course: 'Database Systems', status: 'Late', time: '10:20 AM' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Student Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Welcome back, Abebe Kebede!
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h3" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
                {stat.progress > 0 && (
                  <Box mt={1}>
                    <LinearProgress variant="determinate" value={stat.progress} color="success" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Lab Sessions */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📅 Upcoming Lab Sessions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Lab</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingSessions.map((session, index) => (
                    <TableRow key={index}>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.time}</TableCell>
                      <TableCell>{session.course}</TableCell>
                      <TableCell>{session.lab}</TableCell>
                      <TableCell>
                        <Chip label={session.status} size="small" color="info" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Attendance */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📊 Recent Attendance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAttendance.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.course}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status} 
                          size="small" 
                          color={getStatusColor(record.status)}
                          icon={record.status === 'Present' ? <CheckCircle /> : record.status === 'Absent' ? <Cancel /> : <Schedule />}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button size="small" sx={{ mt: 1 }}>
              View Full Attendance Report
            </Button>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button variant="outlined" startIcon={<Schedule />}>
                  View Schedule
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<Assignment />}>
                  My Attendance
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<Computer />}>
                  Report Issue
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<CalendarToday />}>
                  Calendar
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;