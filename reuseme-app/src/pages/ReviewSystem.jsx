import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Rating, 
  List, 
  ListItem, 
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ReviewSystem = () => {
  const { itemId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [itemType, setItemType] = useState('ITEM');

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/reviews/${itemType.toLowerCase()}/${itemId}`
      );
      setReviews(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!itemId) {
      setError('No item ID provided.');
      setLoading(false);
      return;
    }
    fetchReviews();
  }, [itemId, itemType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('You must be logged in to submit a review.');
        return;
      }
      const body = {
        rating: newReview.rating,
        comment: newReview.comment,
        userId: parseInt(userId),
        itemId: parseInt(itemId),
        itemType: itemType
      };
      const response = await axios.post('http://localhost:8080/api/reviews', body);
      setReviews([...reviews, response.data]);
      await fetchReviews();
      setNewReview({ rating: 0, comment: '' });
    } catch (err) {
      console.error('Error submitting review:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // show backend error message
      } else {
        setError('Failed to submit review.');
      }
      
    }
  };

  if (loading) {
    return <Typography>Loading reviews...</Typography>;
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Reviews for {itemType === 'ITEM' ? 'Item' : 'Book'} #{itemId}
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Item Type</InputLabel>
        <Select
          value={itemType}
          label="Item Type"
          onChange={(e) => setItemType(e.target.value)}
        >
          <MenuItem value="ITEM">Item</MenuItem>
          <MenuItem value="BOOK">Book</MenuItem>
        </Select>
      </FormControl>

      {error && <Typography color="error">{error}</Typography>}

      <List>
        {reviews.map((review, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  {/*
                    Force numeric value here to ensure MUI Rating is colored.
                  */}
                  <Rating 
                    value={Number(review.rating)} 
                    precision={0.5} 
                    readOnly 
                  />
                  <Typography sx={{ ml: 1 }}>
                    ({review.rating} stars)
                  </Typography>
                </Box>
              }
              secondary={review.comment}
            />
          </ListItem>
        ))}
      </List>

      <form onSubmit={handleSubmit}>
        <Box mb={2} mt={2}>
          <Typography component="legend">Your Rating</Typography>
          <Rating
            name="rating"
            value={newReview.rating}
            onChange={(e, newValue) =>
              setNewReview((prev) => ({ ...prev, rating: newValue }))
            }
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Comment"
            fullWidth
            multiline
            rows={3}
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Submit Review
        </Button>
      </form>
    </Box>
  );
};

export default ReviewSystem;
