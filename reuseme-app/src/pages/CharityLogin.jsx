import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CharityLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/charities/login', { email, password });

      if (response.data.success) {
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    try {
      const response = await axios.post('http://localhost:8080/api/charities/forgot-password', { email: resetEmail });
      setResetMessage(response.data);
    } catch (error) {
      setResetMessage('Failed to send reset link. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>

      <form onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="resetEmail">Forgot Password? Enter your email:</label>
          <input
            type="email"
            id="resetEmail"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
        </div>
        {resetMessage && <p>{resetMessage}</p>}
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default CharityLogin;
