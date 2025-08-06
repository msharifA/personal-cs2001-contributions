import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdminMetrics from './AdminMetrics';
import AdminReports from '../pages/AdminReports.jsx'; 

const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Consistent green color for admin
    },
    secondary: {
      main: '#ff4081',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const AdminHeader = ({ onMetricsClick }) => {
  const navigate = useNavigate();
  const [showMetrics, setShowMetrics] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleMetricsClick = () => {
    navigate('/admin-metrics'); // Navigate to a dedicated route for metrics
  };

  const handleReportsClick = () => {
    setShowReports(true);
    setShowMetrics(false); // Ensure metrics are hidden when reports are shown
    navigate('/admin-reports'); // Navigate to the reports page to isolate the feature
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => handleNavigation('/admin-dashboard')}>Dashboard</Button>
          <Button color="inherit" onClick={() => handleNavigation('/admin-users')}>Manage Users</Button>
          <Button color="inherit" onClick={() => handleNavigation('/admin-listings')}>Manage Listings</Button>
          <Button color="inherit" onClick={handleMetricsClick}>View Metrics</Button>
          <Button color="inherit" onClick={handleReportsClick}>View Reports</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      {showMetrics && (
        <Box mt={2}>
          <AdminMetrics />
        </Box>
      )}
      {showReports && (
        <Box mt={2}>
          <AdminReports />
        </Box>
      )}
    </ThemeProvider>
  );
};

export default AdminHeader;