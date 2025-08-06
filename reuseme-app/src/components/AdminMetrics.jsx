import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';

const formatDatabaseSize = (sizeInBytes) => {
  if (sizeInBytes >= 1e9) {
    return `${(sizeInBytes / 1e9).toFixed(2)} GB`;
  } else if (sizeInBytes >= 1e6) {
    return `${(sizeInBytes / 1e6).toFixed(2)} MB`;
  } else if (sizeInBytes >= 1e3) {
    return `${(sizeInBytes / 1e3).toFixed(2)} KB`;
  } else {
    return `${sizeInBytes} Bytes`;
  }
};

const AdminMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleRefreshMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/admin/metrics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setMetrics(response.data);
    } catch {
      setError('Failed to refresh metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/metrics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics({
          totalItems: 0,
          activeExchanges: 0,
          totalUsers: 0,
          pendingApprovals: 0,
          serverUptime: 0,
          databaseSize: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography mt={2}>Loading metrics...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" textAlign="center" mb={3} sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
        Admin Metrics Dashboard
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom>
          Metrics Overview
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshMetrics}
        >
          Refresh
        </Button>
      </Box>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" color="textSecondary">Total Items</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {metrics?.totalItems || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" color="textSecondary">Active Exchanges</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {metrics?.activeExchanges || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" color="textSecondary">Total Users</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {metrics?.totalUsers || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" color="textSecondary">Pending Approvals</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {metrics?.pendingApprovals || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" color="textSecondary">Server Uptime</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {metrics?.serverUptime || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" color="textSecondary">Database Size</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {metrics?.databaseSize ? formatDatabaseSize(metrics.databaseSize) : '0 Bytes'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminMetrics;
