import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Chat = () => {
  const { userId } = useParams();
  const location = useLocation();
  const collectionId = location.state?.collectionId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partner, setPartner] = useState(null);
  const [collectionDetails, setCollectionDetails] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    reason: '',
    category: 'FAKE_PROFILE'
  });
  const [reportError, setReportError] = useState('');

  const messagesEndRef = useRef(null);
  const { auth } = useContext(AuthContext);
  const currentUserId = auth ? auth.userId : localStorage.getItem('userId');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPartner(response.data);
      } catch (err) {
        setError('Could not fetch user details');
      }
    };
    fetchPartner();
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:8080/api/chat/conversations/${currentUserId}/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
        setLoading(false);
      } catch (err) {
        setError('Failed to load messages');
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentUserId, userId]);

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      if (!collectionId) return;
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8080/api/collections/${collectionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCollectionDetails(response.data);
      } catch (err) {
        console.error('Error fetching collection details');
      }
    };
    fetchCollectionDetails();
  }, [collectionId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setSnackbarMessage('Message cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        senderId: Number(currentUserId),
        receiverId: Number(userId),
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      const response = await axios.post('http://localhost:8080/api/chat/messages', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || 'Failed to send message');
      setSnackbarOpen(true);
    }
  };

  const handleConfirmPickup = async (itemId) => {
    const authToken = localStorage.getItem("authToken");
    const currentUserId = localStorage.getItem("userId");

    if (!itemId || !currentUserId || !partner?.id) {
      alert("Missing required data to confirm pickup.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/chat/conversation/confirmtransaction/${currentUserId}/${partner.id}`,
        { itemId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Pickup confirmed successfully!");
      }
    } catch (error) {
      console.error("Error confirming pickup:", error);
      alert("Failed to confirm pickup. Please try again.");
    }
  };

  const handleConfirmTransaction = async (itemId) => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      console.error("User ID is missing.");
      alert("User ID is missing. Please log in again.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:8080/api/chat/conversation/confirmtransaction/${userId}/${partner.id}`,
        { itemId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        alert("Transaction confirmed successfully!");
      }
    } catch (error) {
      console.error("Error confirming transaction:", error);
      alert("Failed to confirm transaction. Please try again.");
    }
  };

  const renderCollectionBanner = () => {
    if (!collectionDetails) return null;

    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="h6">Collection Scheduled</Typography>
        <Typography variant="body2"><strong>Item:</strong> {collectionDetails.itemName}</Typography>
        <Typography variant="body2"><strong>Location:</strong> {collectionDetails.location}</Typography>
        <Typography variant="body2"><strong>Time:</strong> {new Date(collectionDetails.time).toLocaleString()}</Typography>
        <Typography variant="body2"><strong>Status:</strong> {collectionDetails.status}</Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleConfirmPickup(collectionDetails?.itemId)}
            sx={{ mr: 2 }}
          >
            Confirm Pickup
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleConfirmTransaction(collectionDetails?.itemId)}
          >
            Confirm Transaction
          </Button>
        </Box>
      </Alert>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Chat with {partner?.name || `User ${userId}`}
      </Typography>

      <Button
        variant="outlined"
        color="error"
        onClick={() => setOpenReportDialog(true)}
        sx={{ mb: 2 }}
      >
        Report User
      </Button>

      {renderCollectionBanner()}

      {/* Always Visible Confirm Pickup Button */}
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleConfirmPickup(collectionDetails?.itemId || 123)} // Replace 123 with a default or dynamic itemId
        >
          Confirm Pickup
        </Button>
      </Box>

      <Paper elevation={3} sx={{ height: '60vh', overflowY: 'auto', p: 2, mb: 2 }}>
        <List>
          {messages.map((msg, index) => {
            const isMe = String(msg.senderId) === String(currentUserId);
            const sender = isMe ? `You to ${partner?.name || 'User'}` : `${partner?.name || 'User'} to You`;
            return (
              <ListItem key={index} sx={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: isMe ? '#e3f2fd' : '#f1f8e9', maxWidth: '70%' }}>
                  <Typography variant="subtitle2" fontWeight="bold">{sender}</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(msg.timestamp).toLocaleString()}</Typography>

                  {/* Render Confirm Pickup Button if itemId exists */}
                  {msg.itemId && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleConfirmPickup(msg.itemId)}
                    >
                      Confirm Pickup
                    </Button>
                  )}
                </Paper>
              </ListItem>
            );
          })}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>Send</Button>
      </Box>

      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)}>
        <DialogTitle>Report User</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth margin="dense" value={reportData.title} onChange={e => setReportData({ ...reportData, title: e.target.value })} />
          <TextField label="Reason" fullWidth margin="dense" multiline rows={3} value={reportData.reason} onChange={e => setReportData({ ...reportData, reason: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select value={reportData.category} label="Category" onChange={e => setReportData({ ...reportData, category: e.target.value })}>
              <MenuItem value="FAKE_PROFILE">Fake Profile</MenuItem>
              <MenuItem value="FAKE_PRODUCTS">Fake Products</MenuItem>
              <MenuItem value="HARASSMENT">Harassment</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          {reportError && <Typography color="error">{reportError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={async () => {
            if (!reportData.title || !reportData.reason) {
              setReportError('Title and reason are required.');
              return;
            }
            try {
              const token = localStorage.getItem('authToken');
              await axios.post('http://localhost:8080/api/reports', {
                ...reportData,
                reporterId: currentUserId,
                reportedId: userId
              }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
              });
              setSnackbarMessage('Report submitted');
              setSnackbarOpen(true);
              setOpenReportDialog(false);
            } catch (e) {
              setReportError('Failed to submit report');
            }
          }}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />
    </Box>
  );
};

export default Chat;