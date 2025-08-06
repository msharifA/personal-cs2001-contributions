import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Switch,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { Search as SearchIcon, LocationOn, MyLocation } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import categories from '../data/categories.json';
 

const themeGreen = "#4caf50";
const themeGreenDark = "#388e3c"; 
 
const Marketplace = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?.userId || localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
 
  
  const [items, setItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortType, setSortType] = useState('');
 
  
  const [locationEnabled, setLocationEnabled] = useState(
    localStorage.getItem('locationEnabled') === 'true' || false
  );
  const [locationRadius, setLocationRadius] = useState(
    parseInt(localStorage.getItem('locationRadius') || '10', 10)
  );
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
 
 
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingTopSellers, setLoadingTopSellers] = useState(true);

 
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
 
 
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/items/all');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
 
    fetchAllItems();
  }, []);
 

  useEffect(() => {
    if (!userId) {
      setLoadingRecommended(false);
      return;
    }
 
    const fetchRecommendedItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/items/recommended?userId=${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setRecommendedItems(response.data);
      } catch (error) {
        console.error('Error fetching recommended items:', error);
      } finally {
        setLoadingRecommended(false);
      }
    };
 
    fetchRecommendedItems();
  }, [userId, authToken]);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users/top-rated');
        setTopSellers(response.data);
      } catch (error) {
        console.error('Error fetching top sellers:', error);
      } finally {
        setLoadingTopSellers(false);
      }
    };
 
    fetchTopSellers();
  }, []);
 
  
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category && category.subcategories) {
        setSubcategories(category.subcategories);
      } else {
        setSubcategories([]);
      }
      
      setSelectedSubcategories([]);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);
 
  const handleLocationToggle = () => {
    const newState = !locationEnabled;
    setLocationEnabled(newState);
    localStorage.setItem('locationEnabled', newState.toString());
 
    if (newState && !userLocation) {
      getCurrentLocation();
    }
  };
 
 
  const handleRadiusChange = (event, newValue) => {
    setLocationRadius(newValue);
    localStorage.setItem('locationRadius', newValue.toString());
  };
 
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
 
    setLoadingLocation(true);
    setLocationError('');
 
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const locationWKT = `POINT(${longitude} ${latitude})`;
        setUserLocation(locationWKT);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to retrieve your location. Please enable location access.');
        setLoadingLocation(false);
        setLocationEnabled(false);
        localStorage.setItem('locationEnabled', 'false');
      }
    );
  };
 
 
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
 
    try {
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategories.length > 0) params.append('subcategories', selectedSubcategories.join(','));
      params.append('minPrice', priceRange[0]);
      params.append('maxPrice', priceRange[1]);
      if (sortType) params.append('sort', sortType);
 
     
      if (locationEnabled && userLocation) {
        params.append('location', userLocation);
        params.append('radius', locationRadius);
      }
 
      
      const response = await axios.get(`http://localhost:8080/api/items/filter?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
 
      setItems(response.data);
    } catch (error) {
      console.error('Error searching items:', error);
      setError('Failed to search items');
    } finally {
      setLoading(false);
    }
  };
 
  
  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategoryId)) {
        return prev.filter(id => id !== subcategoryId);
      } else {
        return [...prev, subcategoryId];
      }
    });
  };
 
  
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
 
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategories([]);
    setPriceRange([0, 1000]);
    setSortType('');
    setLocationEnabled(false);
    localStorage.setItem('locationEnabled', 'false');
  };
 
  
  const handleContactSeller = (userId) => {
    if (!auth) {
      navigate('/login');
    } else {
      navigate(`/chat/${userId}`);
    }
  };

  const handleAddToFavourites = async (itemId) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Please log in to add items to favourites.');
      navigate('/login');
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/api/users/${auth.userId}/favourites`,
        { itemId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setSnackbarMessage('Item added to favourites!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true); 
    } catch (error) {
      console.error('Error adding to favourites:', error);
      setSnackbarMessage('Failed to add item to favourites. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true); 
    }
  };
  
 
 
  const handleScheduleCollection = (itemId, isBook = false) => {
    if (!auth) {
      navigate('/login');
    } else {
      const route = isBook
        ? `/schedule-collection/book/${itemId}`
        : `/schedule-collection/${itemId}`;
      navigate(route, { state: { isBook, itemId } });
    }
  };
 

  useEffect(() => {
    if (locationEnabled && !userLocation) {
      getCurrentLocation();
    }
  }, [locationEnabled]);
 
  
  const ItemCard = ({ item }) => {
    const isBook = item.isbn !== undefined;
  
    return (
      <div className='item-card'>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <CardMedia
            component="img"
            height="200"
            image={item.imageUrl || '/api/placeholder/400/200'}
            alt={item.itemName || item.title}
          />
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {item.itemName || item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.description}
            </Typography>
  
            {item.suspended && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                This item is suspended and cannot be interacted with.
              </Typography>
            )}
  
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <div className='green-button'>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to={`/public-profile/${item.userId}`}
                  sx={{ 
                    color: themeGreen, 
                    borderColor: themeGreen,
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      borderColor: themeGreenDark,
                      color: themeGreenDark
                    }
                  }}
                  size="small"
                  disabled={item.suspended}
                >
                  View profile
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleScheduleCollection(item.id, isBook)}
                  sx={{ 
                    color: themeGreen, 
                    borderColor: themeGreen,
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      borderColor: themeGreenDark,
                      color: themeGreenDark
                    }
                  }}
                  size="small"
                  disabled={item.suspended}
                >
                  Schedule
                </Button>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to={`/reviews/${isBook ? 'book/' : ''}${item.id}`}
                  sx={{ 
                    color: themeGreen, 
                    borderColor: themeGreen,
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      borderColor: themeGreenDark,
                      color: themeGreenDark
                    }
                  }}
                  size="small"
                  disabled={item.suspended}
                >
                  Reviews
                </Button>
              </div>
            </Box>
  
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={() => handleContactSeller(item.userId)}
                sx={{ 
                  backgroundColor: themeGreen,
                  '&:hover': {
                    backgroundColor: themeGreenDark
                  }
                }}
                disabled={item.suspended}
              >
                CONTACT SELLER
              </Button>
  
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleAddToFavourites(item.id)}
                disabled={item.suspended || userId === item.userId}
                sx={{
                  backgroundColor: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.dark'
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.300'
                  }
                }}
              >
                {item.suspended ? 'Suspended' : userId === item.userId ? 'Your Item' : 'Add to Favorites'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    );
  };
  
 
  // Top Seller Card Component
  const TopSellerCard = ({ seller }) => (
    <Box p={2} border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper" mb={2}>
      <Typography variant="subtitle1" fontWeight="medium">
        {seller.name} {seller.surname}
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="body2" color="text.secondary">
          Rating: {seller.avgRating.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="warning.main" ml={1}>
          {'★'.repeat(Math.round(seller.avgRating))}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        component={Link}
        to={`/public-profile/${seller.userId}`}
        fullWidth
        sx={{ 
          color: themeGreen, 
          borderColor: themeGreen,
          '&:hover': {
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            borderColor: themeGreenDark,
            color: themeGreenDark
          }
        }}
      >
        View Profile
      </Button>
    </Box>
  );
  
 
  return (
    <div className='marketplace-container'>
      <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Market Place
        </Typography>
 
        {/* Search, Category, Sort controls */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search Items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="price_high_low">Price: Highest to Lowest</MenuItem>
                  <MenuItem value="price_low_high">Price: Lowest to Highest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                sx={{ 
                  backgroundColor: themeGreen,
                  '&:hover': {
                    backgroundColor: themeGreenDark
                  }
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
 
        {/* Main content */}
        <Grid container spacing={3}>
          {/* Left sidebar - Filters */}
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
 
              {/* Subcategory filters */}
              {subcategories.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <FormGroup>
                    {subcategories.map((subcat) => (
                      <FormControlLabel
                        key={subcat.id}
                        control={
                          <Checkbox
                            checked={selectedSubcategories.includes(subcat.id)}
                            onChange={() => handleSubcategoryChange(subcat.id)}
                            sx={{
                              color: themeGreen,
                              '&.Mui-checked': {
                                color: themeGreen,
                              },
                            }}
                          />
                        }
                        label={subcat.name}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
 
              <Divider sx={{ my: 2 }} />
 
              {/* Location filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Location Filter
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={locationEnabled}
                        onChange={handleLocationToggle}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: themeGreen,
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.08)',
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: themeGreen,
                          },
                        }}
                      />
                    }
                    label="Your Location"
                  />
                  <LocationOn 
                    color={locationEnabled ? "primary" : "disabled"}
                    sx={{ 
                      ml: 1, 
                      color: locationEnabled ? themeGreen : 'grey.500'
                    }} 
                  />
                  {loadingLocation && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Box>
 
                {locationError && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                    {locationError}
                  </Typography>
                )}
 
                {locationEnabled && (
                  <Box sx={{ px: 1, mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Radius: {locationRadius} km
                    </Typography>
                    <Slider
                      value={locationRadius}
                      onChange={handleRadiusChange}
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={1}
                      max={50}
                      sx={{
                        color: themeGreen,
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0px 0px 0px 8px rgba(76, 175, 80, 0.16)`,
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
 
              <Divider sx={{ my: 2 }} />
 
              {/* Price range slider */}
              <Typography variant="subtitle1" gutterBottom>
                Price range
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  sx={{
                    color: themeGreen,
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px rgba(76, 175, 80, 0.16)`,
                      },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">${priceRange[0]}</Typography>
                  <Typography variant="body2">${priceRange[1]}</Typography>
                </Box>
              </Box>
 
              <Divider sx={{ my: 2 }} />
 
              {/* Clear filters button */}
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
                fullWidth
                sx={{ 
                  color: themeGreen, 
                  borderColor: themeGreen,
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    borderColor: themeGreenDark,
                    color: themeGreenDark
                  }
                }}
              >
                Clear filters
              </Button>
            </Paper>
          </Grid>
 
          {/* Main content - Items */}
          <Grid item xs={12} sm={6}>
            {/* Recommended section */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recommended
              </Typography>
 
              {loadingRecommended ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: themeGreen }} />
                </Box>
              ) : recommendedItems.length > 0 ? (
                <Grid container spacing={2}>
                  {recommendedItems.slice(0, 3).map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <ItemCard item={item} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                  {userId ? "No recommended items found. Follow more users to see their listings!" : "Login to see personalized recommendations"}
                </Typography>
              )}
            </Paper>
 
            {/* All Items section */}
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                All Items
              </Typography>
 
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: themeGreen }} />
                </Box>
              ) : items.length > 0 ? (
                <Grid container spacing={2}>
                  {items.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <ItemCard item={item} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                  No items found matching your filters
                </Typography>
              )}
            </Paper>
          </Grid>
 
          {/* Right sidebar - Top Sellers */}
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Sellers
              </Typography>
 
              {loadingTopSellers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} sx={{ color: themeGreen }} />
                </Box>
              ) : topSellers.length > 0 ? (
                <Box>
                  {topSellers.map((seller) => (
                    <TopSellerCard key={seller.userId} seller={seller} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                  No top sellers found
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Automatically hide after 3 seconds
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};
 
export default Marketplace;