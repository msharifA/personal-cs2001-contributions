import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditModal = ({ open, handleClose, item, handleSave }) => {
    const [updatedItem, setUpdatedItem] = useState({
        itemName: "",
        description: "",
        imageUrl: "",
    });
    const navigate = useNavigate();
    const authToken = localStorage.getItem("authToken");

    useEffect(() => {
        if (item) {
            setUpdatedItem({
                itemName: item.itemName || "",
                description: item.description || "",
                imageUrl: item.imageUrl || "",
            });
        }
    }, [item]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedItem({ ...updatedItem, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `http://localhost:8080/api/items/${item.id}`,
                updatedItem,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            handleSave(response.data);
            handleClose();
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    if (!item) {
        return null;
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Edit Item
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Item Name"
                        name="itemName"
                        value={updatedItem.itemName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={updatedItem.description}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                        multiline
                        rows={4}
                    />
                    <TextField
                        label="Image URL"
                        name="imageUrl"
                        value={updatedItem.imageUrl}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{ marginTop: "16px" }}
                    >
                        Save Changes
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default EditModal;