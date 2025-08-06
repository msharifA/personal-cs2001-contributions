import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve current user info
  const currentUserId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!currentUserId || !authToken) {
      setError('User authentication data missing.');
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        // Fetch all messages for the user
        const response = await axios.get(`http://localhost:8080/api/messages/conversations?userId=${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        // Group messages by conversation partner and keep only the latest message
        const convMap = {};
        response.data.forEach((conversation) => {
          const partnerId = conversation.senderId === Number(currentUserId)
            ? conversation.receiverId
            : conversation.senderId;
          if (
            !convMap[partnerId] ||
            new Date(conversation.timestamp) > new Date(convMap[partnerId].timestamp)
          ) {
            convMap[partnerId] = conversation;
          }
        });

        // Convert the grouped messages into an array and retrieve partner names
        const convArray = await Promise.all(
          Object.values(convMap).map(async (conversation) => {
            const partnerId = conversation.senderId === Number(currentUserId)
              ? conversation.receiverId
              : conversation.senderId;
            try {
              const userRes = await axios.get(`http://localhost:8080/api/users/${partnerId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
              });
              return {
                partnerId,
                partnerName: userRes.data.name || `User ${partnerId}`,
                lastMessage: conversation.message,
                timestamp: conversation.timestamp
              };
            } catch (err) {
              console.error(`Error fetching user ${partnerId}:`, err);
              return {
                partnerId,
                partnerName: `User ${partnerId}`,
                lastMessage: conversation.message,
                timestamp: conversation.timestamp
              };
            }
          })
        );

        // Sort conversations by most recent timestamp
        const sorted = convArray.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setConversations(sorted);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId, authToken]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body1">
        {error}
      </Typography>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Conversations
      </Typography>
      {conversations.length === 0 ? (
        <Typography>No conversations found.</Typography>
      ) : (
        <List>
          {conversations.map((conv) => (
            <ListItem
              key={conv.partnerId}
              button
              component={Link}
              to={`/chat/${conv.partnerId}`}
            >
              <ListItemText
                primary={`Conversation with ${conv.partnerName}`}
                secondary={`Last message: ${conv.lastMessage}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Messages;