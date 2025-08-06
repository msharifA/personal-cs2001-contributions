import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid
} from '@mui/material';
import axios from 'axios';
import categories from '../data/categories.json';
import debounce from 'lodash.debounce';

const BookForm = () => {
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', publishedYear: '', publisher: '',
    price: '0.0', stock: '', donatedBy: '',
    itemName: '', description: '', category: 'books',
    subCategory: '', availability: 'AVAILABLE', dropOffLocation: '',
    address: '', longitude: null, latitude: null
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [geocodingMessage, setGeocodingMessage] = useState('');
  const [geocodingMessageColor, setGeocodingMessageColor] = useState('#000');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [genre, setGenre] = useState('');

  const authToken = localStorage.getItem('authToken');
  const bookGenres = categories.find(cat => cat.id === 'books')?.genres || [];

  const debouncedGeocode = useCallback(
    debounce(async (location) => {
      if (!location || location.trim().length < 3) {
        setGeocodingMessage('');
        return;
      }

      setIsGeocodingLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/geocoding/search`, {
          params: { query: location },
          headers: { Authorization: `Bearer ${authToken}` }
        });

        const { address, longitude, latitude, message, messageColor } = response.data;
        setFormData(prev => ({ ...prev, address, longitude, latitude }));
        setGeocodingMessage(message || '');
        setGeocodingMessageColor(messageColor || '#000');
      } catch {
        setGeocodingMessage('Could not find location');
        setGeocodingMessageColor('#F00');
      } finally {
        setIsGeocodingLoading(false);
      }
    }, 800), [authToken]
  );

  useEffect(() => {
    if (formData.dropOffLocation) debouncedGeocode(formData.dropOffLocation);
    return () => debouncedGeocode.cancel();
  }, [formData.dropOffLocation, debouncedGeocode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData(prev => ({ ...prev, [name]: value, itemName: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    const requiredBookFields = ['title', 'author', 'isbn', 'publishedYear', 'publisher', 'stock'];
    for (const field of requiredBookFields) {
      if (!formData[field]) return setErrorMessage(`Please fill in the ${field} field.`);
    }

    const requiredItemFields = ['itemName', 'dropOffLocation'];
    for (const field of requiredItemFields) {
      if (!formData[field]) return setErrorMessage(`Please fill in the ${field} field.`);
    }

    if (!formData.longitude || !formData.latitude)
      return setErrorMessage('Please enter a valid drop-off location.');

    if (!authToken || !userId)
      return setErrorMessage('You must be logged in to post a book.');

    try {
      const generatedDescription = `Title: ${formData.title} | Author: ${formData.author} | ISBN: ${formData.isbn} | Publisher: ${formData.publisher}`;
      const payload = {
        book: {
          title: formData.title, author: formData.author, isbn: formData.isbn,
          publishedYear: parseInt(formData.publishedYear.split('-')[0], 10),
          publisher: formData.publisher, stock: parseInt(formData.stock),
          donatedBy: formData.donatedBy || null, userId: parseInt(userId)
        },
        item: {
          itemName: formData.itemName, description: generatedDescription,
          imageUrl: null, category: formData.category,
          subCategory: genre || null, availability: formData.availability,
          price: parseFloat(formData.price || '0.0'),
          address: formData.address, longitude: formData.longitude, latitude: formData.latitude,
          userId: parseInt(userId)
        },
        userId: parseInt(userId)
      };

      await axios.post('http://localhost:8080/api/books', payload, {
        params: { userId },
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      setOpenSnackbar(true);
      setFormData({
        title: '', author: '', isbn: '', publishedYear: '', publisher: '',
        price: '0.0', stock: '', donatedBy: '', itemName: '', description: '',
        category: 'books', subCategory: '', availability: 'AVAILABLE',
        dropOffLocation: '', address: '', longitude: null, latitude: null
      });
      setGenre('');
      setGeocodingMessage('');
      setErrorMessage('');
    } catch (err) {
      console.error('Error posting book:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to post book.');
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        List a Book
      </Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>Book Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Author" name="author" value={formData.author} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField label="ISBN" name="isbn" value={formData.isbn} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Publication Date"
              name="publishedYear"
              type="date"
              value={formData.publishedYear}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}><TextField label="Publisher" name="publisher" value={formData.publisher} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Genre (Optional)</InputLabel>
              <Select value={genre} onChange={(e) => setGenre(e.target.value)} label="Genre (Optional)">
                <MenuItem value=""><em>None</em></MenuItem>
                {bookGenres.map((genre) => (
                  <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}><TextField label="Price (Optional)" name="price" type="number" value={formData.price} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Available Copies" name="stock" type="number" value={formData.stock} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12}><TextField label="Donated By (Optional)" name="donatedBy" value={formData.donatedBy} onChange={handleChange} fullWidth /></Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 3 }}>Listing Info</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ position: 'relative' }}>
              <TextField label="Drop Off Location" name="dropOffLocation" value={formData.dropOffLocation} onChange={handleChange} fullWidth required />
              {isGeocodingLoading && (
                <CircularProgress size={20} sx={{ position: 'absolute', right: 10, top: '50%', mt: '-10px' }} />
              )}
            </Box>
            {geocodingMessage && (
              <Typography variant="caption" sx={{ color: geocodingMessageColor }}>
                {geocodingMessage}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Availability</InputLabel>
              <Select name="availability" value={formData.availability} onChange={handleChange} label="Availability">
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="EXCHANGING">Exchanging</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Submit Book
        </Button>
      </form>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Book listed successfully!
        </Alert>
      </Snackbar>

      {errorMessage && (
        <Snackbar open={!!errorMessage} autoHideDuration={4000} onClose={() => setErrorMessage('')}>
          <Alert onClose={() => setErrorMessage('')} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default BookForm;
