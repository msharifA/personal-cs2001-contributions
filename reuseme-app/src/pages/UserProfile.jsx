import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, TextField, Typography, Grid, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Avatar, Card, CardMedia, CardContent, Snackbar, Alert } from '@mui/material';
import EditModal from './EditModal';
import EditIcon from '@mui/icons-material/Edit';
import '../css/UserProfile.css';
import Questionnaire from '../components/Questionnaire';
import BadgeDisplay from '../components/BadgeDisplay';
import NotificationList from '../components/NotificationList';
import { CATEGORIES } from '../data/categories.js'; 



const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', surname: '', email: '', profilePicture: '', address: '', itemsTransferred: 0, co2Savings: 0 });
  const [donatedItems, setDonatedItems] = useState([]); // Items donated by the user
  const [receivedItems, setReceivedItems] = useState([]); // Items received by the user
  const [favourites, setFavourites] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [co2Savings, setCo2Savings] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    surname: '',
    profilePicture: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [error, setError] = useState('');
  const [isFirstItemAdded, setIsFirstItemAdded] = useState(false); // Track if the first item is added
  const [showSnackbar, setShowSnackbar] = useState(false); // State for success Snackbar
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false); // State for error Snackbar
  const [showWholeNumberErrorSnackbar, setShowWholeNumberErrorSnackbar] = useState(false); // State for whole number error Snackbar
  const [showRemoveSnackbar, setShowRemoveSnackbar] = useState(false); // State for remove notification
  const [removeMessage, setRemoveMessage] = useState(''); // Message for the Snackbar
  const [questionnaireCO2Savings, setQuestionnaireCO2Savings] = useState(0); // CO2 savings from the questionnaire
  const [itemCO2Savings, setItemCO2Savings] = useState(0); // CO2 savings from items added by the user

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        
        const userResponse = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

      
        const donatedItemsResponse = await axios.get(`http://localhost:8080/api/items?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDonatedItems(donatedItemsResponse.data);

    
        let totalCO2Savings = 0;
        donatedItemsResponse.data.forEach((item) => {
          const category = item.category;
          const co2Value = CATEGORIES[category]?.co2Value || 0; 
          totalCO2Savings += co2Value;
        });

        setItemCO2Savings(totalCO2Savings); 

        
        setQuestionnaireCO2Savings(userResponse.data.co2Savings || 0); 
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserFavourites = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8080/api/users/${userId}/favourites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavourites(response.data);
      } catch (error) {
        console.error('Error fetching user favourites:', error);
        alert('Failed to fetch user favourites. Please try again.');
      }
    };

    fetchUserData();
    fetchUserFavourites();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleQuestionnaireSubmitSuccess = async (newCO2Savings) => {
    try {
      const token = localStorage.getItem('authToken');

      
      await axios.post(
        `http://localhost:8080/api/users/${userId}/co2-savings`,
        { additionalSavings: newCO2Savings },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update CO2 savings in the frontend
      setQuestionnaireCO2Savings((prev) => prev + newCO2Savings);
    } catch (error) {
      console.error('Error updating CO2 savings:', error);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8 || password.length > 20) {
      setPasswordError('Password must be between 8 and 20 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one digit.');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError('Password must contain at least one special character.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Debugging: Log the formData and userId
    console.log("Submitting form data:", formData);
    console.log("User ID:", userId);

    // Validate userId
    if (!userId) {
      alert("User ID is missing. Please try again.");
      return;
    }

    axios.post(`http://localhost:8080/api/questionnaire/${userId}`, formData)
      .then((response) => {
        console.log("Response from server:", response.data);
        onSubmitSuccess(response.data.co2Savings);
        closeModal();
      })
      .catch((error) => {
        console.error("Error saving data!", error);
        if (error.response && error.response.data) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert("Failed to save data. Please try again.");
        }
      });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (!validatePassword(passwordData.newPassword)) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/users/update-password', {
        email: user.email,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.data.success) {
        alert('Password updated successfully!');
        setOpenPasswordDialog(false);
      } else {
        setPasswordError(response.data.message);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  const validateForm = () => {
    const { name, surname, email } = formData;
    if (name.length < 2 || name.length > 50) {
      setError('Name must be between 2 and 50 characters.');
      return false;
    }
    if (surname.length < 2 || surname.length > 50) {
      setError('Surname must be between 2 and 50 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return false;
    }
    return true;
  };

  const handleAddItem = () => {
    navigate('/dashboard'); // Navigate to the add item page
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleRemoveFromFavourites = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${userId}/favourites/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setFavourites(favourites.filter((item) => item.id !== itemId));
      setRemoveMessage('Item removed from favourites!'); // Set the notification message
      setShowRemoveSnackbar(true); // Show the Snackbar
    } catch (error) {
      console.error('Error removing from favourites:', error);
      setRemoveMessage('Failed to remove item from favourites. Please try again.');
      setShowRemoveSnackbar(true); // Show the Snackbar with an error message
    }
  };

  const handleContactSeller = (sellerId) => {
    if (!sellerId) {
      alert("Seller ID is missing. Cannot redirect to Contact Seller page.");
      return;
    }
    navigate(`/contact-seller/${sellerId}`);
  };

  return (
    <Box className="user-profile-container">
      <Typography variant="h4" className="user-profile-heading">
        User Profile
      </Typography>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="user-profile-form">
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            fullWidth
            margin="normal"
            required
            disabled
          />
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Surname"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Profile Picture URL"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth className="save-button" style={{ marginTop: '16px' }}>
            Save
          </Button>
        </form>
      ) : (
        <div className="user-profile-details">
          <Avatar src={user.profilePicture} alt="User" className="profile-picture" />
          <Typography variant="body1" color="textPrimary"><strong>Name:</strong> {user.name}</Typography>
          <Typography variant="body1" color="textPrimary"><strong>Surname:</strong> {user.surname}</Typography>
          <Typography variant="body1" color="textPrimary"><strong>Email:</strong> {user.email}</Typography>
          <Typography variant="body1" color="textPrimary"><strong>Address:</strong> {user.address}</Typography>
          <Button onClick={() => setIsEditing(true)} variant="outlined" color="primary" className="edit-button" style={{ marginTop: '16px' }}>
            Edit
          </Button>
          <Button onClick={() => setOpenPasswordDialog(true)} variant="outlined" color="secondary" className="edit-button" style={{ marginTop: '16px' }}>
            Reset Password
          </Button>
        </div>
      )}
      <div className="questionnaire-section">
        <Questionnaire
          userId={userId}
          closeModal={() => console.log("Modal closed")}
          onSubmitSuccess={handleQuestionnaireSubmitSuccess}
        />
      </div>
       
       {co2Savings !== null && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Environmental Impact</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2, flex: 1 }}>
              <Typography variant="subtitle1">Badge Points</Typography>
              <Typography variant="h5">{user.badgePoints || 0}</Typography>
              <Typography variant="body2" color="text.secondary">points earned</Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2, mt: 3 }}>
            <Typography variant="subtitle1">Items Obtained</Typography>
            <Typography variant="h5">{user.itemsObtained || 0}</Typography>
            <Typography variant="body2" color="text.secondary">items obtained using the app</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Environmental Impact</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Box for CO2 savings from the questionnaire */}
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2, flex: 1 }}>
            <Typography variant="subtitle1">CO2 Savings (Questionnaire)</Typography>
            <Typography variant="h5">{questionnaireCO2Savings.toFixed(2)} kg</Typography>
            <Typography variant="body2" color="text.secondary">of CO2 emissions saved</Typography>
          </Box>

          {/* Box for CO2 savings from items added by the user */}
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2, flex: 1 }}>
            <Typography variant="subtitle1">CO2 Savings (Items Added)</Typography>
            <Typography variant="h5">{itemCO2Savings.toFixed(2)} kg</Typography>
            <Typography variant="body2" color="text.secondary">of CO2 emissions saved</Typography>
          </Box>
        </Box>
      </Box>

      <div className="badges-section">
        <h2>Your Achievements</h2>
        <BadgeDisplay userId={userId} />
      </div>
      
      <div className="notifications-section">
        <h2>Your Notifications</h2>
        <NotificationList userId={userId} limit={5} />
      </div>

      <Typography variant="h6" className="user-profile-items-heading">
        Your Donated Items
      </Typography>

      <Button variant="outlined" color="secondary" onClick={handleAddItem} className="edit-button" style={{ marginTop: '20px' }}>
        Add Item
      </Button>

     

      

      <Typography variant="h6" className="user-profile-items-heading" style={{ marginTop: '40px' }}>
        Favourite Items
      </Typography>

      <div className="favorite-items-container">
        {favourites.length === 0 ? (
          <Typography className="no-items-message">No favorite items added yet.</Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {favourites.map((item) => (
              <Grid item xs={12} md={6} key={item.id} className="favorite-item">
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.imageUrl || 'https://via.placeholder.com/140'}
                    alt={item.itemName}
                  />
                  <CardContent>
                    <Typography variant="h5">{item.itemName}</Typography>
                    <Typography variant="body2">{item.description}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRemoveFromFavourites(item.id)}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Remove from Favourites
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate(`/schedule-collection/${item.id}`)} // Redirect to Schedule Collection page
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Schedule Collection
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      <Typography variant="h6" className="user-profile-items-heading">
        Your Received Items
      </Typography>
      <div className="item-list-container">
        {receivedItems.length === 0 ? (
          <Typography className="no-items-message">No items received yet.</Typography>
        ) : (
          <ItemList items={receivedItems} onEditClick={(item) => console.log('View item:', item)} />
        )}
      </div>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your old password and new password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="oldPassword"
            label="Old Password"
            type="password"
            fullWidth
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />
          {passwordError && <Typography className="validation-error">{passwordError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordSubmit} color="primary">
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Data has been saved successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowErrorSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          Questionnaire was not completed. Please provide input.
        </Alert>
      </Snackbar>

      {/* Whole Number Error Snackbar */}
      <Snackbar
        open={showWholeNumberErrorSnackbar}
        autoHideDuration={3000} 
        onClose={() => setShowWholeNumberErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowWholeNumberErrorSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          Only whole numbers are allowed. Please correct your input.
        </Alert>
      </Snackbar>

      {/* Snackbar for Remove Notification */}
      <Snackbar
        open={showRemoveSnackbar}
        autoHideDuration={3000} 
        onClose={() => setShowRemoveSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowRemoveSnackbar(false)}
          severity={removeMessage.includes('Failed') ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {removeMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;