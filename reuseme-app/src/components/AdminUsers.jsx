import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import AdminHeader from './AdminHeader'; // Import AdminHeader component
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminUsers = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      // Apply client-side filtering to ensure only the selected role is displayed
      const filteredUsers = filterRole
        ? response.data.filter((user) => user.role === filterRole)
        : response.data;

      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  return (
    <Box>
      <AdminHeader /> {/* Ensure AdminHeader is displayed */}
      <Typography variant="h5" gutterBottom>
        Manage Users
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          displayEmpty
          style={{ width: '150px' }}
        >
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="Charity">Charity</MenuItem>
          <MenuItem value="User">User</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper} style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Table>
            <TableHead style={{ backgroundColor: '#f9f9f9' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell> {/* New column for actions */}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.role || 'User'}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: user.status === 'Active' ? '#d4edda' : '#e2e3e5',
                        color: user.status === 'Active' ? '#155724' : '#6c757d',
                      }}
                    >
                      {user.status || 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/public-profile/${user.id}`)}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminUsers;