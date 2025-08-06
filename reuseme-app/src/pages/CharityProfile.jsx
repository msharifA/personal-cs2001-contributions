import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material'; // Import Snackbar and Alert
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import '../css/CharityProfile.css';
import '../App.css';

const CharityProfile = () => {
  const { charityId } = useParams();
  const [charity, setCharity] = useState({});
  const [originalCharity, setOriginalCharity] = useState({}); // Store the original details
  const [message, setMessage] = useState('');
  const [changedFields, setChangedFields] = useState([]); // Track changed fields
  const [showSnackbar, setShowSnackbar] = useState(false); // State for Snackbar
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [success, setSuccess] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', imageUrl: '', price: '' });
  const [error, setError] = useState(''); // Declare the error state here
  const [passwordError, setPasswordError] = useState(''); // State for password validation error
  const [emailError, setEmailError] = useState(''); // State for email validation error
  const [phoneError, setPhoneError] = useState(''); // State for phone validation error
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();
  
  
  const eventListRef = useRef(null);

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/charities/${charityId}`);
        setCharity(response.data);
        setOriginalCharity(response.data); // Save the original details
      } catch (error) {
        setMessage('Failed to fetch charity details.');
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/charity-items/${charityId}`);
        setItems(response.data);
      } catch (error) {
        setError('Failed to fetch charity items.');
      }
    };

    fetchCharity();
    fetchItems();
  }, [charityId]);

  
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, eventDate, eventDescription }),
      });
  
      if (response.ok) {
        const newEvent = await response.json();
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setSuccess('Event added successfully!');
  
        
        document.activeElement.blur();
  
        
        setTimeout(() => {
          const eventList = document.getElementById("events-list");
          if (eventList) {
            eventList.scrollTo({
              top: eventList.scrollHeight - eventList.clientHeight, 
              behavior: "smooth",
            });
          }
        }, 200);
  
      
        setEventName('');
        setEventDate('');
        setEventDescription('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error adding event');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) {
      return 'Password must be at least 8 characters long.';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character.';
    }
    return ''; // No errors
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format.';
    }
    return ''; // No errors
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    if (!phoneRegex.test(phone)) {
      return 'Invalid phone number format.';
    }
    return ''; // No errors
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'password') {
      const error = validatePassword(value);
      setPasswordError(error); 
    }

    if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error);
    }

    if (name === 'phone') {
      const error = validatePhone(value);
      setPhoneError(error);
    }

    setCharity((prevCharity) => ({ ...prevCharity, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError || emailError || phoneError) {
      setMessage('Please fix the errors before submitting.');
      setShowSnackbar(true);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/api/charities/${charityId}`, charity);

      
      if (charity.password && charity.password !== originalCharity.password) {
        setMessage('Password was changed successfully.');
      } else {
        setMessage('Charity information updated successfully.');
      }

      setShowSnackbar(true); 
      setOriginalCharity(charity); 
    } catch (error) {
      setMessage('Failed to update charity information.');
      setShowSnackbar(true); 
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8080/api/charity-items', {
        ...newItem,
        charity: { id: charityId }, 
      });
      setItems([...items, response.data]);
      setNewItem({ name: '', description: '', imageUrl: '', price: '' });
      setMessage('Item added successfully!');
    } catch (error) {
      setError('Failed to add item. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/charity-items/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId)); 
      setMessage('Item removed successfully!');
    } catch (error) {
      setError('Failed to remove item. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className="charity-container">
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      {!charity ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Profile Section */}
          <div className="charity-profile-card">
            <div className="profile-banner">
              <h2>{charity.charityName}</h2>
              <p>Welcome to the charity profile page!</p>
            </div>
            <div className="profile-info">
              <p><strong>Email:</strong> {charity.email}</p>
              <p><strong>Address:</strong> {charity.address}</p>
              <p><strong>Phone:</strong> {charity.phone}</p>
            </div>
          </div>

          {/* Add Event Section */}
          <div className="event-form">
            <h3>Add Event</h3>
            <form onSubmit={handleEventSubmit}>
              <label>Event Name:</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />

              <label>Event Date:</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />

              <label>Event Description:</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
              ></textarea>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <button type="submit" className="submit-btn">Add Event</button>
            </form>
          </div>

          {/* ✅ Event List With Ref for Smooth Scrolling */}
          <div id="events-list" ref={eventListRef} className="event-list">
            <h3>Events</h3>
            <ul>
              {events.map((event, index) => (
                <li key={index} className="event-item">
                  <div className="event-card">
                    <h4>{event.eventName}</h4>
                    <p><strong>Date:</strong> {event.eventDate}</p>
                    <p><strong>Description:</strong> {event.eventDescription}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Add Item Section */}
          <div className="add-item-form">
            <h3>Add New Item</h3>
            <form onSubmit={handleAddItem}>
              <div>
                <label htmlFor="name">Item Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="imageUrl">Image URL:</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={newItem.imageUrl}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="price">Price:</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">Add Item</button>
            </form>
          </div>

          {/* Display Items Section */}
          <div id="items-list" className="items-list">
            <h3>Available Items</h3>
            <ul>
              {items.map((item, index) => (
                <li key={index} className="item-card">
                  <h4>{item.name}</h4>
                  <p><strong>Description:</strong> {item.description}</p>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} width="100" />}
                  <p><strong>Price:</strong> ${item.price}</p>
                  <button onClick={() => handleRemoveItem(item.id)}>Remove Item</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Update Charity Information Section */}
          <div className="update-charity-form">
            <h3>Update Charity Information</h3>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="charityName">Charity Name:</label>
                <input
                  type="text"
                  id="charityName"
                  name="charityName"
                  value={charity.charityName || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={charity.email || ''}
                  onChange={handleChange}
                  required
                />
                {emailError && <p className="error">{emailError}</p>}
              </div>
              <div>
                <label htmlFor="password">Password:</label>
                <TextField
                  id="password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'} // Toggle between 'text' and 'password'
                  value={charity.password || ''}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end">
                          {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                {passwordError && <p className="error">{passwordError}</p>}
              </div>
              <div>
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={charity.address || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={charity.phone || ''}
                  onChange={handleChange}
                  required
                />
                {phoneError && <p className="error">{phoneError}</p>}
              </div>
              <button type="submit">Update Charity</button>
            </form>
          </div>

          {/* Snackbar for Notifications */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={5000} // Automatically hide after 5 seconds
            onClose={() => setShowSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setShowSnackbar(false)}
              severity={message.includes('Failed') ? 'error' : 'success'}
              sx={{ width: '100%' }}
            >
              {message}
              {changedFields.length > 0 && (
                <ul>
                  {changedFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              )}
            </Alert>
          </Snackbar>
        </>
      )}
    </div>
  );
};

export default CharityProfile;