import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/CharityList.css';

const CharityList = () => {
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/charities');
        setCharities(response.data);
      } catch (error) {
        setError('Failed to fetch charities. Please try again later.');
      }
    };

    fetchCharities();
  }, []);

  const handleCharityClick = async (charityId) => {
    if (selectedCharity === charityId) {
      // If the same charity is clicked again, hide the items
      setSelectedCharity(null);
      setItems([]);
      return;
    }

    setSelectedCharity(charityId);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8080/api/charity-items/${charityId}`);
      setItems(response.data);
    } catch (error) {
      setError('Failed to fetch items for this charity. Please try again later.');
    }
  };

  const handleGetDirections = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="charity-list-container">
      <h2>Registered Charities</h2>
      {error && <p className="error">{error}</p>}
      <ul className="charity-list">
        {charities.map((charity) => (
          <li
            key={charity.id}
            className={`charity-item ${selectedCharity === charity.id ? 'selected' : ''}`}
            onClick={() => handleCharityClick(charity.id)}
          >
            <h3>{charity.charityName}</h3>
            <p><strong>Email:</strong> {charity.email}</p>
            <p><strong>Address:</strong> {charity.address}, {charity.postcode}</p>
            <p><strong>Phone:</strong> {charity.phone}</p>
            <button
              className="directions-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the charity click
                handleGetDirections(`${charity.address}, ${charity.postcode}`);
              }}
            >
              Get Directions
            </button>
          </li>
        ))}
      </ul>

      {selectedCharity && (
        <div className="charity-items-container">
          <h3>Available Items</h3>
          {items.length === 0 ? (
            <p>No items available for this charity.</p>
          ) : (
            <ul className="charity-items-list">
              {items.map((item) => (
                <li key={item.id} className="charity-item-card">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} width="100" />}
                  <p><strong>Price:</strong> ${item.price}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CharityList;
