import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button } from '@mui/material';
import axios from 'axios';
import AdminHeader from './AdminHeader'; // Import AdminHeader component
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Refresh as RefreshIcon } from '@mui/icons-material';

const AdminListings = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:8080/api/items/active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setListings(response.data);
      } catch {
        setError('Failed to fetch listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleSuspend = async (listingId) => {
    try {
      await axios.put(`http://localhost:8080/api/items/${listingId}/suspend`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      alert('Listing suspended successfully!');
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === listingId ? { ...listing, suspended: true } : listing
        )
      );
    } catch (error) {
      console.error('Error suspending listing:', error);
      alert('Failed to suspend listing. Please try again.');
    }
  };

  const handleUnsuspend = async (listingId) => {
    try {
      await axios.put(`http://localhost:8080/api/items/${listingId}/unsuspend`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      alert('Listing unsuspended successfully!');
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === listingId ? { ...listing, suspended: false } : listing
        )
      );
    } catch (error) {
      console.error('Error unsuspending listing:', error);
      alert('Failed to unsuspend listing. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/items/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setListings(response.data);
    } catch {
      setError('Failed to refresh listings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings
    .filter((listing) =>
      listing.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category?.toLowerCase() === 'books'
    )
    .sort((a, b) => (sortField ? a[sortField].localeCompare(b[sortField]) : 0));

  return (
    <div>
      <AdminHeader /> {/* Ensure AdminHeader is displayed */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Manage Listings
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            variant="outlined"
            placeholder="Search listings..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '300px' }}
          />
          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            displayEmpty
            style={{ width: '150px' }}
          >
            <MenuItem value="">No Sorting</MenuItem>
            <MenuItem value="itemName">Item Name</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </Select>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box textAlign="center" mt={2}>
            <CircularProgress />
            <Typography>Loading listings...</Typography>
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
                  <TableCell style={{ fontWeight: 'bold' }}>Item Name</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Condition</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Owner</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Date/Time</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Views</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell> {/* New column for actions */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id} hover>
                    <TableCell>{listing.itemName}</TableCell>
                    <TableCell>{listing.category || 'Uncategorized'}</TableCell>
                    <TableCell>{listing.condition || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor:
                            listing.availability === 'Available'
                              ? '#d4edda'
                              : listing.availability === 'Pending'
                              ? '#fff3cd'
                              : '#e2e3e5',
                          color:
                            listing.availability === 'Available'
                              ? '#155724'
                              : listing.availability === 'Pending'
                              ? '#856404'
                              : '#6c757d',
                        }}
                      >
                        {listing.availability}
                      </span>
                    </TableCell>
                    <TableCell>{listing.ownerName || 'N/A'}</TableCell>
                    <TableCell>{new Date(listing.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{listing.views || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/listing-details/${listing.id}`)}
                      >
                        View Listing
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleSuspend(listing.id)}
                        disabled={listing.suspended}
                        style={{ marginLeft: '8px' }}
                      >
                        {listing.suspended ? 'Suspended' : 'Suspend'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleUnsuspend(listing.id)}
                        disabled={!listing.suspended}
                        style={{ marginLeft: '8px' }}
                      >
                        Unsuspend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </div>
  );
};

export default AdminListings;