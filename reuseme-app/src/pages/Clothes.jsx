import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Slider } from '@mui/material';
import axios from 'axios';

const Clothes = () => {
  const [clothes, setClothes] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/items/clothes');
        setClothes(response.data);
      } catch (error) {
        console.error('Error fetching clothes:', error);
      }
    };

    fetchClothes();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handlePriceRangeChange = (e, newValue) => {
    setPriceRange(newValue);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const filteredClothes = clothes
    .filter(cloth => 
      cloth.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === '' || cloth.category === category) &&
      (priceRange[0] <= cloth.price && cloth.price <= priceRange[1])
    )
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.date) - new Date(a.date);
      if (sort === 'lowest') return a.price - b.price;
      if (sort === 'highest') return b.price - a.price;
      return 0;
    });

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Clothes
      </Typography>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search clothes..."
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          style={{ marginRight: '16px' }}
        />
        <FormControl variant="outlined" style={{ marginRight: '16px', minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={handleCategoryChange} label="Category">
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="Men">Men</MenuItem>
            <MenuItem value="Women">Women</MenuItem>
            <MenuItem value="Kids">Kids</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sort} onChange={handleSortChange} label="Sort By">
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="lowest">Lowest Price</MenuItem>
            <MenuItem value="highest">Highest Price</MenuItem>
          </Select>
        </FormControl>
        <Box width={200} style={{ marginRight: '16px' }}>
          <Typography id="price-range-slider" gutterBottom>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            aria-labelledby="price-range-slider"
            min={0}
            max={100}
          />
        </Box>
      </Box>
      <Grid container spacing={3}>
        {filteredClothes.map((cloth) => (
          <Grid item xs={12} md={4} key={cloth.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={cloth.imageUrl || 'https://via.placeholder.com/140'}
                alt={cloth.title}
              />
              <CardContent>
                <Typography variant="h5" component="div">
                  {cloth.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {cloth.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ${cloth.price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Clothes;