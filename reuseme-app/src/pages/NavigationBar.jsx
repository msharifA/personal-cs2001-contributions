import React, { useState, useContext, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../css/NavigationBar.css';

const NavigationBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);
  const userId = auth ? auth.userId : null;
  const charityId = auth ? auth.charityId : null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8080/api/notifications/user/${userId}/count-unread`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        );
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
    
    if (userId) {
      fetchUnreadCount();
      // Poll for new notifications every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar-container">
      <AppBar position="static" className={`appbar ${userId || charityId ? 'solid-appbar' : ''}`}>
        <Toolbar className="toolbar">
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              className="menu-button"
              sx={{
                '&:focus': { outline: 'none' },
                '&:active': { backgroundColor: 'transparent' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" className={`title ${isMobile ? 'mobile-title' : ''}`}>
            ReuseMe App
          </Typography>

          {/* Desktop Links */}
          {!isMobile && (
            <>
              <div className="nav-links">
                {userId || charityId ? (
                  <>
                    <Button color="inherit" onClick={() => handleNavigation('/dashboard')}>Dashboard</Button>
                    <Button color="inherit" onClick={() => handleNavigation('/book-form')}>Books</Button>
                    <Button color="inherit" onClick={() => handleNavigation('/messages')}>Messages</Button>
                    <Button color="inherit" onClick={() => handleNavigation('/marketplace')}>Marketplace</Button>
                    <Button color="inherit" onClick={() => handleNavigation('/charities')}>Charities</Button> {/* Add link to CharityList page */}
                  </>
                ) : (
                  <>
                    <Button color="inherit" onClick={() => handleNavigation('/')}>Home</Button>
                  </>
                )}
              </div>

              {/* Login or Logout/Profile */}
              <div className="auth-buttons">
                {userId || charityId ? (
                  <>
                    {userId && (
                      <IconButton 
                        color="inherit" 
                        onClick={() => handleNavigation('/notifications')}
                        sx={{ mr: 1 }}
                      >
                        <Badge badgeContent={unreadCount} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    )}
                    <Button
                      color="inherit"
                      onClick={() => {
                        if (charityId) {
                          handleNavigation(`/charity-profile/${charityId}`); // Navigate to charity profile if charityId exists
                        } else if (userId) {
                          handleNavigation(`/profile/${userId}`); // Navigate to user profile if userId exists
                        }
                      }}
                    >
                      Profile
                    </Button>
                    {userId && (
                      <Button
                        color="inherit"
                        onClick={() => handleNavigation(`/public-profile/${userId}`)}
                      >
                        Public Profile
                      </Button>
                    )}
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <Button color="inherit" onClick={() => handleNavigation('/login')}>
                    Login
                  </Button>
                )}
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <List className="drawer-list">
          {userId || charityId ? (
            <>
              <ListItem button onClick={() => handleNavigation('/dashboard')}>
                <ListItemText primary="Dashboard" />
              </ListItem>
              {userId && (
                <ListItem button onClick={() => handleNavigation('/notifications')}>
                  <ListItemText 
                    primary={
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Notifications
                        {unreadCount > 0 && (
                          <Badge 
                            badgeContent={unreadCount} 
                            color="error" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </span>
                    } 
                  />
                </ListItem>
              )}
              <ListItem button onClick={() => handleNavigation('/book-form')}>
                <ListItemText primary="Books" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/messages')}>
                <ListItemText primary="Messages" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/marketplace')}>
                <ListItemText primary="Marketplace" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/charities')}>
                <ListItemText primary="Charities" /> {/* Add link to CharityList page */}
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  if (charityId) {
                    handleNavigation(`/charity-profile/${charityId}`); // Navigate to charity profile if charityId exists
                  } else if (userId) {
                    handleNavigation(`/profile/${userId}`); // Navigate to user profile if userId exists
                  }
                }}
              >
                <ListItemText primary="Profile" />
              </ListItem>
              {userId && (
                <ListItem button onClick={() => handleNavigation(`/public-profile/${userId}`)}>
                  <ListItemText primary="Public Profile" />
                </ListItem>
              )}
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => handleNavigation('/')}>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/login')}>
                <ListItemText primary="Login" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </div>
  );
}

export default NavigationBar;
