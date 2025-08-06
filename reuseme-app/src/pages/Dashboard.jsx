import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Button, TextField, Grid, Paper, Typography, CircularProgress, Modal, 
  FormControl, InputLabel, Select, MenuItem, Badge
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CATEGORIES } from '../data/categories.js';
import debounce  from 'lodash/debounce';
import NotificationList from '../components/NotificationList';
import NotificationsIcon from '@mui/icons-material/Notifications';
 
const Dashboard = () => {
  const navigate = useNavigate();
  const [isDonor, setIsDonor] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [stats, setStats] = useState({
    totalItems: 0,
    activeExchanges: 0,
    pendingApprovals: 0
  });
  
  const [unreadNotifications, setUnreadNotifications] = useState(0);
 
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    imageUrl: "",
    category: "",
    subCategory: "",
    price : "",
    availability: "AVAILABLE", // Default value
    dropOffLocation: "", // New field for address
  });
 
  // State for location validation message
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    message: "",
    messageColor: "",
    address: ""
  });
 //edit delete
 const [editingItem, setEditingItem] = useState(null); // ✨ Add this

  useEffect(() => {
    const fetchItems = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
 
      if (!userId || !authToken) {
        console.error("Authentication data missing, redirecting to login");
        navigate("/login");
        return;
      }
 
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/items`, {
          params: { userId },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log("Items fetched successfully:", response.data);
        setItems(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching items:", error);
        if (error.response) {
          console.log("Server response:", error.response.status, error.response.data);
          if (error.response.status === 401 || error.response.status === 403) {
            // Token expired or invalid
            localStorage.removeItem("userId");
            localStorage.removeItem("authToken");
            navigate("/login");
          } else {
            setError(`Failed to fetch items: ${error.response.data}`);
          }
        } else if (error.request) {
          // No response received
          setError("No response received from server. Please check your connection.");
        } else {
          // Other errors
          setError(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
 
    fetchItems();
  }, [navigate]);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  // Create a debounced version of the location validation function
  const debouncedLocationValidation = useCallback(
    debounce(async (value) => {
      if (value.trim().length > 3) {
        try {
          const authToken = localStorage.getItem("authToken");
          const response = await axios.get(`http://localhost:8080/api/geocoding/search`, {
            params: { query: value },
            headers: { Authorization: `Bearer ${authToken}` },
          });
 
          setLocationData({
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            message: response.data.message,
            messageColor: response.data.messageColor,
            address: response.data.address
          });
        } catch (error) {
          console.error("Error validating location:", error);
          setLocationData({
            latitude: null,
            longitude: null,
            message: "Unable to validate location",
            messageColor: "#ff0000"
          });
        }
      } else {
        // Clear location data if input is too short
        setLocationData({
          latitude: null,
          longitude: null,
          message: "",
          messageColor: "",
          address: ""
        });
      }
    }, 500), // 500ms debounce delay
    [] // Dependencies array
  );
 
  // Handle location validation when the dropOffLocation field changes
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
 
    // Use the debounced version for validation
    debouncedLocationValidation(value);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
 
    if (!userId || !authToken) {
      navigate("/login");
      return;
    }
 
    try {
      // Create the item data with proper structure
      const itemData = { 
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl || null, // Handle empty string
        category: formData.category,
        subCategory: formData.subCategory || "", // Include subCategory (if it's empty, send an empty string)
        availability: formData.availability,
        price : formData.price || 0.0,
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        userId: parseInt(userId)
      };
 
      const response = await axios.post(
        "http://localhost:8080/api/items", 
        itemData, 
        {
          params: { userId: parseInt(userId) },
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${authToken}` 
          },
        }
      );
 
      setItems(prevItems => [...prevItems, response.data]);
      setFormData({ 
        itemName: "", 
        description: "", 
        imageUrl: "",
        category: "",
        subCategory: "", 
        price: "",
        availability: "AVAILABLE",
        dropOffLocation: ""
      });
 
     
      setLocationData({
        latitude: null,
        longitude: null,
        message: "",
        messageColor: ""
      });
 
      setError('');
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
 
      if (error.response) {
        console.log("Response error data:", error.response.data);
        setError(`Error adding item: ${error.response.data}`);
      } else {
        setError("Error adding item. Please try again.");
      }
    }
  };
 
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };
 
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };
 
const handleSaveEdit = async () => {
  const authToken = localStorage.getItem("authToken");
  try {
    const response = await axios.put(
      `http://localhost:8080/api/items/${editingItem.id}`,
      editingItem,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const updatedItem = response.data;
    setItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
    setSelectedItem(updatedItem);
    setEditingItem(null);
    alert("Item updated successfully!");
  } catch (err) {
    console.error("Error updating item:", err);
    alert("Failed to update item.");
  }
};

const handleDeleteItem = async (itemId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this item?");
  if (!confirmDelete) return;

  const authToken = localStorage.getItem("authToken");
  try {
    await axios.delete(`http://localhost:8080/api/items/${itemId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItem(null);
    alert("Item deleted successfully!");
  } catch (err) {
    console.error("Error deleting item:", err);
    alert("Failed to delete item.");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };
 
 
  useEffect(() => {
    const fetchStats = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;
 
      try {
       
        const response = await axios.get("http://localhost:8080/api/items/stats", {
          params: { userId : localStorage.getItem("userId") },
          headers: { Authorization: `Bearer ${authToken}` },
        });
 
        setStats({
          totalItems: response.data.totalItems || 0,
          activeExchanges: response.data.activeExchanges || 0,
          pendingApprovals: response.data.pendingApprovals || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
 
    if (isDonor) {
      fetchStats();
    }
  }, [isDonor]);


  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
      
      if (!userId || !authToken) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8080/api/notifications/user/${userId}/count-unread`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };
    
    
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleConfirmPickup = async (itemId) => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId"); 
  
    if (!userId) {
      console.error("User ID is missing.");
      alert("User ID is missing. Please log in again.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:8080/api/items/pickup/confirm`,
        { itemId, requesterId: userId }, 
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
 
  return (
    <Box textAlign="center" p={2} sx={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ mr: 2 }}>Dashboard</Typography>
        {unreadNotifications > 0 && (
          <Badge badgeContent={unreadNotifications} color="error">
            <NotificationsIcon color="action" />
          </Badge>
        )}
      </Box>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 1, backgroundColor: "#2196f3", color: "#fff" }}>
            <Typography variant="subtitle1">Donor</Typography>
            <Button size="small" variant="contained" color="primary" onClick={() => setIsDonor(true)} sx={{ mt: 1 }}>
              Enter Donor Dashboard
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Button size="small" variant="outlined" color="secondary" onClick={handleLogout} sx={{ mt: 2 }}>
        Logout
      </Button>
 
      {isDonor && (
        <>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{error}</Typography>}

          {/* Statistics Section */}
          <Grid container spacing={1} justifyContent="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Paper elevation={2} sx={{ p: 1, bgcolor: "#e3f2fd" }}>
                <Typography variant="subtitle2">Total Items</Typography>
                <Typography variant="h6">{stats.totalItems}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={2} sx={{ p: 1, bgcolor: "#e8f5e9" }}>
                <Typography variant="subtitle2">Active Exchanges</Typography>
                <Typography variant="h6">{stats.activeExchanges}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={2} sx={{ p: 1, bgcolor: "#fff8e1" }}>
                <Typography variant="subtitle2">Pending</Typography>
                <Typography variant="h6">{stats.pendingApprovals}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Notifications Section */}
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
            <Grid item xs={12} sm={10} md={8}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Recent Notifications</Typography>
                <NotificationList userId={localStorage.getItem("userId")} limit={3} />
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
            <Grid item xs={12} sm={10} md={8}>
              <Paper elevation={2} sx={{ p: 1 }}>
                <Typography variant="subtitle1">Add a New Item</Typography>
                <form onSubmit={handleSubmit}>
                  <TextField 
                    label="Item Name" 
                    name="itemName" 
                    value={formData.itemName} 
                    onChange={handleInputChange} 
                    fullWidth 
                    required 
                    size="small"
                    margin="dense"
                  />
                  <TextField 
                    label="Description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    fullWidth 
                    required 
                    multiline 
                    rows={2}
                    size="small"
                    margin="dense"
                  />
                  <TextField 
                    label="Image URL (Optional)" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleInputChange} 
                    fullWidth
                    size="small"
                    margin="dense"
                  />
                  <TextField 
                    label="Price" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    fullWidth 
                    required
                    size="small"
                    margin="dense"
                  />
                  <FormControl fullWidth size="small" margin="dense">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={formData.category || ""}
                      onChange={handleInputChange}
                      label="Category"
                      required
                    >
                      <MenuItem value="">Select a category</MenuItem>
                      {Object.keys(CATEGORIES).map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
 
                  {formData.category && CATEGORIES[formData.category] && CATEGORIES[formData.category].length > 0 && (
                    <FormControl fullWidth size="small" margin="dense">
                      <InputLabel id="subCategory-label">SubCategory (Optional)</InputLabel>
                      <Select
                        labelId="subCategory-label"
                        name="subCategory"
                        value={formData.subCategory || ""}
                        onChange={handleInputChange}
                        label="SubCategory (Optional)"
                      >
                        <MenuItem value="">Select a subCategory</MenuItem>
                        {CATEGORIES[formData.category].map((subcat) => (
                          <MenuItem key={subcat} value={subcat}>{subcat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
 
                  <FormControl fullWidth size="small" margin="dense">
                    <InputLabel id="availability-label">Availability</InputLabel>
                    <Select
                      labelId="availability-label"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      label="Availability"
                      required
                    >
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="EXCHANGING">Exchanging</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                    </Select>
                  </FormControl>
 
                  <TextField 
                    label="Drop off location" 
                    name="dropOffLocation" 
                    value={formData.dropOffLocation} 
                    onChange={handleLocationChange} 
                    fullWidth 
                    required 
                    size="small"
                    margin="dense"
                    placeholder="Enter your address for drop-off"
                  />
                  {locationData.message && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        color: locationData.messageColor,
                        fontSize: '0.75rem'
                      }}
                    >
                      {locationData.message}
                    </Typography>
                  )}
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Item
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mt: 1 }}>
            {items.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mt: 1 }}>No items available. Add some items!</Typography>
              </Grid>
            ) : (
              items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Paper elevation={2} sx={{ p: 1 }}>
                    <Typography variant="subtitle2">{item.itemName}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      Status: <span style={{ 
                        color: item.availability === "AVAILABLE" ? "green" : 
                              item.availability === "PENDING" ? "orange" : 
                              item.availability === "EXCHANGING" ? "blue" : "gray"
                      }}>
                        {item.availability}
                      </span>
                    </Typography>
                    <Typography variant="body2" noWrap>{item.description}</Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      sx={{ mt: 1 }} 
                      onClick={() => handleSelectItem(item)}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleConfirmPickup(item.id)}
                      style={{
                        marginTop: "10px",
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Confirm Pickup
                    </Button>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
          <Modal open={openModal} onClose={handleCloseModal}>
  <Box sx={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    p: 2,
    borderRadius: 1,
    boxShadow: 24,
    maxWidth: 400,
    width: "90%"
  }}>
    {selectedItem && (
      <>
        {editingItem ? (
          <>
            <TextField
              label="Item Name"
              value={editingItem.itemName}
              onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Description"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              fullWidth
              margin="dense"
              multiline
              rows={2}
              size="small"
            />
            <TextField
              label="Image URL"
              value={editingItem.imageUrl}
              onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Price"
              type="number"
              value={editingItem.price}
              onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
              fullWidth
              margin="dense"
              size="small"
            />
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="contained" size="small" onClick={handleSaveEdit}>Save</Button>
              <Button variant="outlined" size="small" onClick={() => setEditingItem(null)}>Cancel</Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6">{selectedItem.itemName}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Status: <span style={{
                color: selectedItem.availability === "AVAILABLE" ? "green" :
                       selectedItem.availability === "PENDING" ? "orange" :
                       selectedItem.availability === "EXCHANGING" ? "blue" : "gray"
              }}>
                {selectedItem.availability}
              </span>
            </Typography>
            {selectedItem.imageUrl && (
              <Box sx={{ my: 1 }}>
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.itemName}
                  style={{ maxWidth: "100%", maxHeight: "150px" }}
                />
              </Box>
            )}
            <Typography>{selectedItem.description}</Typography>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="contained" size="small" onClick={() => setEditingItem({ ...selectedItem })}>Edit</Button>
              <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteItem(selectedItem.id)}>Delete</Button>
              <Button variant="text" size="small" onClick={handleCloseModal}>Close</Button>
            </Box>
          </>
        )}
      </>
    )}
  </Box>
</Modal>

        </>
      )}
    </Box>
  );
};
 
export default Dashboard;