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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Inventory,
  AttachMoney,
  Warning,
  CheckCircle,
  Assignment,
  QrCodeScanner,
  Build,
  Delete,
  Add
} from '@mui/icons-material';

const AssetDashboard = () => {
  const stats = [
    { title: 'Total Equipment', value: '245', icon: <Inventory />, color: '#667eea' },
    { title: 'Active', value: '198', icon: <CheckCircle />, color: '#48bb78' },
    { title: 'Maintenance', value: '12', icon: <Build />, color: '#ed8936' },
    { title: 'Total Value', value: '2.4M ETB', icon: <AttachMoney />, color: '#4299e1' },
  ];

  const pendingAudits = [
    { id: 1, lab: 'Computer Lab 101', dueDate: 'Today', status: 'urgent', items: 35 },
    { id: 2, lab: 'Computer Lab 102', dueDate: 'Tomorrow', status: 'pending', items: 35 },
    { id: 3, lab: 'Computer Lab 103', dueDate: 'Apr 20, 2026', status: 'scheduled', items: 30 },
  ];

  const warrantyExpiring = [
    { id: 1, equipment: 'Dell Optiplex 3090', serial: 'CN-0XM9X7-001', expiryDate: '2026-05-15', daysLeft: 30 },
    { id: 2, equipment: 'HP Monitor 24"', serial: 'HP-MON-045', expiryDate: '2026-05-30', daysLeft: 45 },
    { id: 3, equipment: 'APC UPS 650VA', serial: 'APC-UPS-012', expiryDate: '2026-06-15', daysLeft: 60 },
  ];

  const recentEquipment = [
    { id: 1, name: 'Dell Optiplex 3090', code: 'COMP-120', lab: 'Lab 101', date: 'Mar 10, 2026', condition: 'Excellent' },
    { id: 2, name: 'HP Monitor 24"', code: 'MON-045', lab: 'Lab 102', date: 'Mar 8, 2026', condition: 'Good' },
    { id: 3, name: 'APC UPS', code: 'UPS-012', lab: 'Lab 101', date: 'Mar 5, 2026', condition: 'Excellent' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Asset Division Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Equipment & Inventory Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Register Equipment
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
        {/* Pending Audits */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📋 Pending Audits
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Laboratory</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAudits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>{audit.lab}</TableCell>
                      <TableCell>{audit.dueDate}</TableCell>
                      <TableCell>{audit.items}</TableCell>
                      <TableCell>
                        <Chip 
                          label={audit.status} 
                          size="small" 
                          color={audit.status === 'urgent' ? 'error' : audit.status === 'pending' ? 'warning' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<QrCodeScanner />}>
                          Start Audit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Warranty Expiring */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              ⚠️ Warranty Expiring Soon
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Days Left</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {warrantyExpiring.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.equipment}</TableCell>
                      <TableCell>{item.serial}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${item.daysLeft} days`} 
                          size="small" 
                          color={item.daysLeft < 30 ? 'error' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Renew
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recently Added Equipment */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Recently Added Equipment
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Lab</TableCell>
                    <TableCell>Date Added</TableCell>
                    <TableCell>Condition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEquipment.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell>{equipment.name}</TableCell>
                      <TableCell>{equipment.code}</TableCell>
                      <TableCell>{equipment.lab}</TableCell>
                      <TableCell>{equipment.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={equipment.condition} 
                          size="small" 
                          color={equipment.condition === 'Excellent' ? 'success' : 'info'} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button size="small" sx={{ mt: 1 }}>
              View All Equipment
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssetDashboard;