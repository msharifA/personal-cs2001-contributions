import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CharityStore = ({ charityId }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', imageUrl: '', price: '' });

  useEffect(() => {
    const fetchItems = async () => {
      const response = await axios.get(`http://localhost:8080/api/charity-items/${charityId}`);
      setItems(response.data);
    };
    fetchItems();
  }, [charityId]);

  const handleAddItem = async () => {
    const response = await axios.post('http://localhost:8080/api/charity-items', {
      ...newItem,
      charity: { id: charityId },
    });
    setItems([...items, response.data]);
    setNewItem({ name: '', description: '', imageUrl: '', price: '' });
  };

  const handleDeleteItem = async (itemId) => {
    await axios.delete(`http://localhost:8080/api/charity-items/${itemId}`);
    setItems(items.filter((item) => item.id !== itemId));
  };

  return (
    <div>
      <h2>Charity Store</h2>
      <div>
        <h3>Add New Item</h3>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newItem.imageUrl}
          onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>
      <div>
        <h3>Available Items</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <img src={item.imageUrl} alt={item.name} width="100" />
              <p>Price: ${item.price}</p>
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CharityStore;
