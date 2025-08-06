import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../css/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [success, setSuccess] = useState('');
  const [isCharity, setIsCharity] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Reset errors when login type changes
  useEffect(() => {
    setErrors({
      email: '',
      password: '',
      general: ''
    });
  }, [isCharity, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors and success messages
    setErrors({
      email: '',
      password: '',
      general: ''
    });
    setSuccess('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    // Clear old login data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');

    try {
      if (isAdmin) {
        const response = await fetch('http://localhost:8080/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuccess('Login successful!');
          login(data);
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userType', 'admin');
          navigate('/admin-dashboard');
        } else {
          let errorMsg = '';
          try {
            const responseText = await response.text();
            // Try to parse JSON; if not, use plain text
            try {
              const errorData = JSON.parse(responseText);
              errorMsg = errorData.message || 'Login failed';
            } catch (parseErr) {
              errorMsg = responseText;
            }
          } catch (err) {
            errorMsg = 'Login failed';
          }
          setErrors({ ...errors, general: errorMsg });
        }
        return;
      }

      const endpoint = isCharity
        ? 'http://localhost:8080/api/charities/login'
        : 'http://localhost:8080/api/users/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Login successful!');
        login(data);

        // Set localStorage values
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userType', isCharity ? 'charity' : 'user');

        if (isCharity) {
          localStorage.setItem('userId', data.charityId); // Use charityId for charity users
          navigate(`/charity-profile/${data.charityId}`);
        } else {
          localStorage.setItem('userId', data.userId);
          navigate(`/profile/${data.userId}`);
        }
      } else {
        let errorMsg = '';
        try {
          const responseText = await response.text();
          try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.message || 'Login failed';
          } catch (parseErr) {
            errorMsg = responseText;
          }
        } catch (err) {
          errorMsg = 'Login failed';
        }
        setErrors({ ...errors, general: errorMsg });
      }
    } catch (err) {
      setErrors({ ...errors, general: 'Connection error. Please check your internet and try again.' });
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            required
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
            required
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              id="isCharity"
              name="isCharity"
              checked={isCharity}
              onChange={(e) => {
                setIsCharity(e.target.checked);
                if (e.target.checked) setIsAdmin(false);
              }}
            />
            Login as Charity
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={isAdmin}
              onChange={(e) => {
                setIsAdmin(e.target.checked);
                if (e.target.checked) setIsCharity(false);
              }}
            />
            Login as Admin
          </label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="register-link">
        New to ReuseMe App? <Link to="/register">Register here</Link>
      </p>
      <p className="register-link">
        Are you a charity? <Link to="/charity-registration">Register here</Link>
      </p>
      <p className="forgot-password-link">
        Forgot your password? <Link to="/reset-password-request">Reset it here</Link>
      </p>
    </div>
  );
};

export default Login;