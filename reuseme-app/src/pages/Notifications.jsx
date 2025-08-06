import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, Button, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationList from '../components/NotificationList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Notifications = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedUserId || !authToken) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    setUserId(storedUserId);
    setLoading(false);
  }, [navigate]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            All Notifications
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {userId ? (
              <NotificationList userId={userId} />
            ) : (
              <Typography>Please log in to view your notifications.</Typography>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Notifications; 