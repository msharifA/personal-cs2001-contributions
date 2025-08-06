import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const ScheduleCollection = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [itemName, setItemName] = useState('');
  const [isBook, setIsBook] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();
  const { itemId } = useParams();
  const location = useLocation();

  const currentUserId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    // Determine if it's a book from route or fallback to URL check
    const routeStateBookFlag = location.state?.isBook;
    const pathIncludesBook = window.location.pathname.includes('/book/');
    setIsBook(routeStateBookFlag || pathIncludesBook);

    if (!itemId || !authToken) {
      setError('Missing item or authentication info');
      return;
    }

    const fetchItemDetails = async () => {
      try {
        const endpoint = isBook
          ? `http://localhost:8080/api/books/${itemId}`
          : `http://localhost:8080/api/items/${itemId}`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const name = isBook ? response.data.title : response.data.itemName;
        setItemName(name || 'Item');
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to fetch item details.');
      }
    };

    fetchItemDetails();
  }, [itemId, authToken, location.state, isBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate selectedDate
    if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
      setError('Please select a valid date and time.');
      return;
    }

    const selectedDateTime = new Date(selectedDate);
    const oneHourFromNow = new Date(new Date().getTime() + 60 * 60 * 1000);

    // Ensure the selected time is at least 1 hour from now
    if (selectedDateTime <= oneHourFromNow) {
      setError('Select a time at least 1 hour from now.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isBook
        ? `http://localhost:8080/api/books/${itemId}`
        : `http://localhost:8080/api/items/${itemId}`;

      const itemRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const donorId = itemRes.data.userId;
      const receiverId = Number(currentUserId);

      if (!donorId || !receiverId || donorId === receiverId) {
        throw new Error('Invalid sender/receiver relationship.');
      }

      const payload = {
        donorId,
        receiverId,
        location: selectedLocation,
        time: selectedDateTime.toISOString(), // Ensure this is valid
        itemName: itemName,
        status: 'PENDING',
        itemType: isBook ? 'BOOK' : 'ITEM',
        itemId: Number(itemId),
      };

      const scheduleRes = await axios.post(
        'http://localhost:8080/api/collections',
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const message = `📦 Collection scheduled for "${payload.itemName}" on ${selectedDateTime.toLocaleDateString()} at ${selectedDateTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} at ${payload.location}.`;

      await axios.post(
        'http://localhost:8080/api/chat/messages',
        {
          senderId: receiverId,
          receiverId: donorId,
          message,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setOpenSnackbar(true);

      setTimeout(() => {
        navigate(`/chat/${donorId}`, {
          state: {
            collectionId: scheduleRes.data.id,
            scheduledMessage: message,
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Scheduling Error:', err);
      const msg = err.response?.data?.message || 'Could not schedule. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Schedule Collection for: {itemName}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Date and Time"
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Pickup Location"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 2, position: 'relative' }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Pickup'}
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: 'primary.main',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Pickup Scheduled!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleCollection;
