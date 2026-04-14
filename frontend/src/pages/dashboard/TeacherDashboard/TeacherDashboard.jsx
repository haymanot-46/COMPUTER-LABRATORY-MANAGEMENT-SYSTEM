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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  Today,
  Schedule,
  CheckCircle,
  Pending,
  Warning,
  Message
} from '@mui/icons-material';

const TeacherDashboard = () => {
  const stats = [
    { title: 'My Classes', value: '4', icon: <School />, color: '#667eea' },
    { title: 'Total Students', value: '120', icon: <People />, color: '#48bb78' },
    { title: 'Pending Attendance', value: '2', icon: <Assignment />, color: '#ed8936' },
    { title: 'Lab Sessions', value: '6', icon: <Schedule />, color: '#4299e1' },
  ];

  const todayClasses = [
    { time: '8:30 AM - 10:30 AM', course: 'Database Systems', lab: 'Lab 101', students: 35, status: 'upcoming' },
    { time: '11:00 AM - 1:00 PM', course: 'Computer Networks', lab: 'Lab 102', students: 30, status: 'upcoming' },
    { time: '2:00 PM - 4:00 PM', course: 'Software Engineering', lab: 'Lab 103', students: 28, status: 'upcoming' },
  ];

  const recentAnnouncements = [
    { id: 1, title: 'Lab Schedule Change', message: 'Lab 101 will be closed for maintenance on Friday', time: '2 hours ago', type: 'info' },
    { id: 2, title: 'New Software Available', message: 'VS Code 2025 is now installed in all labs', time: '1 day ago', type: 'success' },
    { id: 3, title: 'Exam Schedule', message: 'Final practical exams start next week', time: '2 days ago', type: 'warning' },
  ];

  const pendingTasks = [
    { id: 1, task: 'Mark attendance for Database Systems', due: 'Today, 5:00 PM', priority: 'high' },
    { id: 2, task: 'Submit grades for Computer Networks', due: 'Tomorrow', priority: 'medium' },
    { id: 3, task: 'Review lab equipment request', due: 'This week', priority: 'low' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Teacher Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome back, Dr. Abebe!
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Today />}>
          My Schedule
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
        {/* Today's Classes */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📚 Today's Classes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Lab</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayClasses.map((class_, index) => (
                    <TableRow key={index}>
                      <TableCell>{class_.time}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{class_.course}</Typography>
                      </TableCell>
                      <TableCell>{class_.lab}</TableCell>
                      <TableCell>{class_.students}</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" color="primary">
                          Take Attendance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Pending Tasks */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              ⏰ Pending Tasks
            </Typography>
            <List>
              {pendingTasks.map((task) => (
                <ListItem key={task.id} sx={{ borderBottom: '1px solid #eee' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: task.priority === 'high' ? '#e53e3e' : task.priority === 'medium' ? '#ed8936' : '#48bb78' }}>
                      {task.priority === 'high' ? <Warning /> : task.priority === 'medium' ? <Pending /> : <CheckCircle />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.task}
                    secondary={`Due: ${task.due}`}
                  />
                  <Button size="small" variant="outlined">
                    Complete
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📢 Recent Announcements
            </Typography>
            <List>
              {recentAnnouncements.map((announcement) => (
                <ListItem key={announcement.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <Message />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={announcement.title}
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {announcement.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {announcement.time}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;