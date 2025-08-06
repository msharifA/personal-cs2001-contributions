import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const MetricsPage = () => {
  const metrics = [
    { id: 1, name: 'Total Items', value: 0 },
    { id: 2, name: 'Active Exchanges', value: 0 },
    { id: 3, name: 'Total Users', value: 0 },
    { id: 4, name: 'Pending Approvals', value: 0 },
    { id: 5, name: 'Server Uptime', value: '0 Hours' },
    { id: 6, name: 'Database Size', value: '0.00 GB' },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" textAlign="center" mb={3}>
        Admin Metrics Dashboard
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Metric</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>{metric.name}</TableCell>
                <TableCell>{metric.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MetricsPage;
