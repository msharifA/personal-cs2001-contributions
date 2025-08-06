import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const CollectionTracking = () => {
  const { itemId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/collections/${itemId}/tracking`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setTrackingData(response.data);
      } catch (error) {
        setError('Error fetching tracking data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [itemId]);

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box textAlign="center" p={4}>
      <Typography variant="h4" component="h1">
        Collection Tracking
      </Typography>
      <Typography variant="body1">
        Donor: {trackingData.donor.name} ({trackingData.donor.email})
      </Typography>
      <Typography variant="body1">
        Receiver: {trackingData.receiver.name} ({trackingData.receiver.email})
      </Typography>
      <Typography variant="body1">
        Item: {trackingData.itemName}
      </Typography>
      <Typography variant="body1">
        Status: {trackingData.status}
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/receiver-dashboard")}>
        Back to Available Items
      </Button>
    </Box>
  );
};

export default CollectionTracking;