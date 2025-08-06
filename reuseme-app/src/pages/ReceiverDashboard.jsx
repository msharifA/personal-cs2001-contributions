import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReceiverDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/collections");
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setError("Error fetching items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h4">No items available at the moment 😔</Typography>
        <Typography variant="body1">Looks like everything is taken! Check back later or set an alert for new arrivals.</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          🔔 Notify Me
        </Button>
        <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
          📨 Request Item
        </Button>
        <Button variant="contained" color="default" sx={{ mt: 2 }}>
          🔄 Refresh / Try Again
        </Button>
        <Button variant="contained" color="default" sx={{ mt: 2 }}>
          🛍️ Browse Other Categories
        </Button>
      </Box>
    );
  }

  return (
    <Box textAlign="center" p={4}>
      <Typography variant="h4" component="h1">
        Available Items
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ mt: 3 }}>
        {items.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {item.itemName}
              </Typography>
              <Typography variant="body1">
                {item.description}
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate(`/collection-tracking/${item.id}`)}>
                Arrange Collection
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReceiverDashboard;