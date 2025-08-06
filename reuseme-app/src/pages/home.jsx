import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';
import { CssVarsProvider } from '@mui/joy/styles';
import axios from 'axios';
import '../css/home.css';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/items/all');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllItems();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        Loading...
      </Box>
    );
  }

  return (
    <>
      <div className="home-background" />
      {/* Add margin top to push the content down */}
      <Box className="main-container" sx={{ mt: '200px' }}>
        {/* Hero Section */}
        <Box className="hero-section">
          <Container maxWidth="lg">
            <Typography
              level="h1"
              sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2, fontWeight: 'bold' }}
            >
              Welcome to ReuseMe
            </Typography>
            <Typography
              level="h2"
              sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, mb: 4, opacity: 0.9 }}
            >
              Find and share items that deserve a second life
            </Typography>
            <Box className="hero-buttons">
              <Button
                component={Link}
                to="/register"
                variant="contained"
                className="join-now-button"
                size="large"
              >
                JOIN NOW
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                className="sign-in-button"
                size="large"
              >
                SIGN IN
              </Button>
            </Box>
            <Button
              variant="contained"
              color="primary"
              className="show-items-button"
              size="large"
              onClick={() => setShowItems(!showItems)}
            >
              {showItems ? 'Hide Items' : 'Show Recently Added Items'}
            </Button>
          </Container>
        </Box>

        {/* Items Grid */}
        {showItems && (
          <CssVarsProvider>
            <Box className="items-section">
              <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography
                  level="h2"
                  sx={{ textAlign: 'center', mb: 4, fontSize: '2rem', fontWeight: 'bold' }}
                >
                  Recently Added Items
                </Typography>
                <Grid container spacing={2}>
                  {items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || index}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s',
                          },
                        }}
                      >
                        {item.imageUrl && (
                          <CardOverflow>
                            <img src={item.imageUrl} alt={item.itemName} className="card-image" />
                          </CardOverflow>
                        )}
                        <CardContent className="card-content">
                          <Typography
                            level="h3"
                            fontSize="xl"
                            fontWeight="bold"
                            className="item-title"
                          >
                            {item.itemName}
                          </Typography>
                          <Typography level="body-sm" sx={{ mt: 1, mb: 2 }} className="item-description">
                            {item.description}
                          </Typography>
                          <Box
                            sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            className="item-footer"
                          >
                            <Typography level="body-xs">
                              Posted by {item.user?.name || 'Anonymous'}
                            </Typography>
                            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                              {Math.floor(Math.random() * 10000) + 100} views
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>
          </CssVarsProvider>
        )}
      </Box>
    </>
  );
};

export default Home;