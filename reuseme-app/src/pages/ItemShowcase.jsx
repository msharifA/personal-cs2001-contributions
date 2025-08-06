import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardMedia, CardContent, Avatar, TextField, Button } from '@mui/material';
import AuthContext from '../context/AuthContext';

const ItemShowcase = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [location, setLocation] = useState('');
  const { auth } = useContext(AuthContext);
  const commentsRef = useRef(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/items/${itemId}`);
        setItem(response.data);
        fetchUser(response.data.user.id);
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    };

    const fetchUser = async (userId) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/items/${itemId}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchItem();
    fetchComments();
  }, [itemId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            setLocation(response.data.address.city || response.data.address.town || response.data.address.village || 'Unknown location');
          } catch (error) {
            console.error('Error getting location:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`http://localhost:8080/api/items/${itemId}/comments`, {
        text: newComment,
        location: location,
        user: { id: auth.userId }
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setComments([...comments, response.data]);
      setNewComment('');
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!item || !user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={4} maxWidth="800px" mx="auto" height="100%">
      <Card>
        <CardMedia
          component="img"
          height="300"
          image={item.imageUrl || 'https://via.placeholder.com/300'}
          alt={item.itemName}
        />
        <CardContent>
          <Typography variant="h4" component="div">
            {item.itemName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {item.description}
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <Avatar alt={user.name} src={user.profilePicture} />
            <Box ml={2}>
              <Typography variant="body2" color="text.secondary">
                Posted by: {user.name} {user.surname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {user.email}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Box mt={4} flexGrow={1} display="flex" flexDirection="column">
        <Typography variant="h5">Comments</Typography>
        <Box
          ref={commentsRef}
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderRadius: '4px',
            p: 2,
          }}
        >
          {comments.map((comment) => (
            <Box key={comment.id} mt={2} p={2} border={1} borderRadius={4}>
              <Typography variant="body2" color="text.secondary">
                {comment.user.name} {comment.user.surname}
              </Typography>
              <Typography variant="body1">{comment.text}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {comment.location}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box mt={2} display="flex" alignItems="center">
          <TextField
            label="Add a comment"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ ml: 2 }}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ItemShowcase;
