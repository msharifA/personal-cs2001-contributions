import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, TextField, Typography } from '@mui/material';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [emailType, setEmailType] = useState(''); // Track whether it's a user or charity
  const navigate = useNavigate();

  // Fetch email and determine type (user or charity) based on the token
  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:8080/api/password/reset/email?token=${token}`)
        .then((response) => {
          setEmail(response.data.email);
          setEmailType(response.data.type); // Backend should return "user" or "charity"
        })
        .catch((error) => {
          setMessage('Invalid or expired token.');
        });
    }
  }, [token]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      // Determine the correct API endpoint based on the email type
      const endpoint =
        emailType === 'charity'
          ? 'http://localhost:8080/api/charities/reset-password'
          : 'http://localhost:8080/api/users/reset-password';

      const response = await axios.post(endpoint, {
        email,
        token,
        newPassword,
        confirmPassword,
      });

      setMessage('Password reset successfully.');
      navigate('/login');
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
    }
  };

  return (
    <Box textAlign="center" p={4}>
      <Typography variant="h4" gutterBottom>
        Reset Password
      </Typography>
      {message && <Typography variant="body1" color="error">{message}</Typography>}
      <form onSubmit={handleResetSubmit}>
        <TextField
          label="Email"
          value={email}
          fullWidth
          margin="normal"
          required
          disabled
        />
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
          Reset Password
        </Button>
      </form>
    </Box>
  );
};

export default ResetPassword;