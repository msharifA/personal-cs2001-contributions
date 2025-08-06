import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography } from '@mui/material';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailType, setEmailType] = useState(''); // Track the email type (user or charity)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Step 1: Check the email type
      const emailCheckResponse = await axios.post('http://localhost:8080/api/email-check', { email });
      const emailType = emailCheckResponse.data.emailType;

      let resetPasswordUrl = '';
      if (emailType === 'user') {
        resetPasswordUrl = 'http://localhost:8080/api/users/reset-password-request';
      } else if (emailType === 'charity') {
        resetPasswordUrl = 'http://localhost:8080/api/charities/reset-password-request';
      } else {
        setError('Email not found. Please check and try again.');
        return;
      }

      setEmailType(emailType); // Save the email type (user or charity)

      // Step 2: Call the appropriate reset password API
      const response = await axios.post(resetPasswordUrl, { email });
      setMessage('A password reset link has been sent to your email.');
    } catch (err) {
      setError('Failed to send password reset link. Please try again.');
    }
  };

  return (
    <Box textAlign="center" p={4}>
      <Typography variant="h4" gutterBottom>
        Request Password Reset
      </Typography>
      {message && <Typography variant="body1" color="success">{message}</Typography>}
      {error && <Typography variant="body1" color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
          Send Reset Link
        </Button>
      </form>
    </Box>
  );
};

export default ResetPasswordRequest;