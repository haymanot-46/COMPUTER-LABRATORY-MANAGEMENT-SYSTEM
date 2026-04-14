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
  School,
  Schedule,
  People,
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  BatchPrediction
} from '@mui/icons-material';

const DeanDashboard = () => {
  const stats = [
    { title: 'Departments', value: '4', icon: <School />, color: '#667eea' },
    { title: 'Students', value: '1,245', icon: <People />, color: '#48bb78' },
    { title: 'Lab Utilization', value: '72%', icon: <TrendingUp />, color: '#ed8936', progress: 72 },
    { title: 'Active Courses', value: '28', icon: <Assessment />, color: '#4299e1' },
  ];

  const batchSchedules = [
    { id: 1, batch: 'CS 3rd Year - Batch A', semester: '2nd Semester', courses: 6, labs: 4, status: 'active' },
    { id: 2, batch: 'CS 3rd Year - Batch B', semester: '2nd Semester', courses: 6, labs: 4, status: 'active' },
    { id: 3, batch: 'IT 3rd Year - Batch A', semester: '2nd Semester', courses: 5, labs: 3, status: 'pending' },
    { id: 4, batch: 'SE 3rd Year - Batch A', semester: '2nd Semester', courses: 6, labs: 4, status: 'active' },
  ];

  const departmentPerformance = [
    { department: 'Computer Science', utilization: 85, students: 450, labs: 2, performance: 'Excellent' },
    { department: 'Information Technology', utilization: 72, students: 380, labs: 1, performance: 'Good' },
    { department: 'Software Engineering', utilization: 78, students: 320, labs: 1, performance: 'Good' },
    { department: 'Information Systems', utilization: 65, students: 295, labs: 1, performance: 'Satisfactory' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Department Dean Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Faculty of Computing - Overview
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<BatchPrediction />}>
          Batch Schedule
        </Button>
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
                {stat.progress && (
                  <Box mt={1}>
                    <LinearProgress variant="determinate" value={stat.progress} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Batch Schedules */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Batch Schedules
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Batch</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Courses</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batchSchedules.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batch}</TableCell>
                      <TableCell>{batch.semester}</TableCell>
                      <TableCell>{batch.courses}</TableCell>
                      <TableCell>
                        <Chip 
                          label={batch.status} 
                          size="small" 
                          color={batch.status === 'active' ? 'success' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button size="small" sx={{ mt: 1 }}>
              Create New Batch Schedule
            </Button>
          </Paper>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Department Performance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Utilization</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentPerformance.map((dept, index) => (
                    <TableRow key={index}>
                      <TableCell>{dept.department}</TableCell>
                      <TableCell>{dept.students}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box flexGrow={1} mr={1}>
                            <LinearProgress variant="determinate" value={dept.utilization} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                          <Typography variant="caption">{dept.utilization}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={dept.performance} 
                          size="small" 
                          color={dept.performance === 'Excellent' ? 'success' : dept.performance === 'Good' ? 'info' : 'warning'} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
                <Button variant="contained" startIcon={<Schedule />}>
                  Create Batch Schedule
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" startIcon={<Assessment />}>
                  Department Report
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" startIcon={<People />}>
                  Manage Courses
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeanDashboard;