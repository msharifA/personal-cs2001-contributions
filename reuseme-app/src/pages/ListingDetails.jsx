import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';

const ListingDetails = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/items/${listingId}`);
        setListing(response.data);
      } catch (err) {
        setError('Failed to fetch listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [listingId]);

  if (loading) {
    return (
      <Box textAlign="center" mt={2}>
        <CircularProgress />
        <Typography>Loading listing details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center">
        {error}
      </Typography>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom>
          {listing.itemName}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Category:</strong> {listing.category || 'Uncategorized'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Condition:</strong> {listing.condition || 'N/A'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> {listing.availability}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Owner:</strong> {listing.ownerName || 'N/A'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Date/Time:</strong> {new Date(listing.dateTime).toLocaleString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Views:</strong> {listing.views || 0}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> {listing.description || 'No description provided.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ListingDetails;