import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Avatar, MenuItem, Select } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import axios from 'axios';
import AdminMetrics from '../components/AdminMetrics';
import AdminHeader from '../components/AdminHeader';
import AdminListings from '../components/AdminListings'; // Import AdminListings component
import AdminUsers from '../components/AdminUsers'; // Import AdminUsers component
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [userError, setUserError] = useState('');
  const [listingError, setListingError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortField, setSortField] = useState('');
  const [metricsTab, setMetricsTab] = useState('overview');
  const [showMetrics, setShowMetrics] = useState(false);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  useEffect(() => {
    if (activeTab === 0) {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        setUserError('');
        try {
          const response = await axios.get('http://localhost:8080/api/admin/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          setUsers(response.data);
        } catch (err) {
          setUserError('Failed to fetch users.');
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }

    if (activeTab === 1) {
      const fetchListings = async () => {
        setLoadingListings(true);
        setListingError('');
        try {
          const response = await axios.get('http://localhost:8080/api/items/active', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          setListings(response.data);
        } catch (err) {
          setListingError('Failed to fetch listings.');
        } finally {
          setLoadingListings(false);
        }
      };
      fetchListings();
    }
  }, [activeTab]);

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterRole ? user.role === filterRole : true)
    )
    .sort((a, b) => (sortField ? a[sortField].localeCompare(b[sortField]) : 0));

  const filteredListings = listings
    .filter((listing) =>
      listing.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (sortField ? a[sortField].localeCompare(b[sortField]) : 0));

  return (
    <Box>
      <AdminHeader />
      <Box p={4} style={{ marginTop: '-16px' }}>
        <Box textAlign="center" mt={4}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
            Welcome to the Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#757575', mt: 2 }}>
            Manage users, listings, and view system metrics and reports seamlessly.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
