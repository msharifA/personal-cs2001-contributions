import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Register.css'; 

const CharityRegistration = () => {
  const [formData, setFormData] = useState({
    charityName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    postcode: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({
    charityName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    postcode: '',
    phone: '',
    general: ''
  });
  
  const [touched, setTouched] = useState({
    charityName: false,
    email: false,
    password: false,
    confirmPassword: false,
    address: false,
    postcode: false,
    phone: false
  });
  
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };
  
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'charityName':
        if (!value.trim()) {
          error = 'Charity name is required';
        } else if (value.length < 2) {
          error = 'Charity name must be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Charity name must be less than 100 characters';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (value.length > 20) {
          error = 'Password must be less than 20 characters';
        } else {
          // Check password strength
          const missingRequirements = [];
          if (!/[A-Z]/.test(value)) missingRequirements.push('uppercase letter');
          if (!/[a-z]/.test(value)) missingRequirements.push('lowercase letter');
          if (!/\d/.test(value)) missingRequirements.push('number');
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) missingRequirements.push('special character');
          
          if (missingRequirements.length > 0) {
            error = `Password must include at least one ${missingRequirements.join(', ')}`;
          }
        }
        
        // Also check confirm password if it's been touched
        if (touched.confirmPassword && formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else if (touched.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.length < 5) {
          error = 'Please enter a valid address';
        }
        break;
        
      case 'postcode':
        if (!value.trim()) {
          error = 'Postcode is required';
        } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(value)) {
          error = 'Please enter a valid UK postcode';
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^[0-9+\-\s()]{10,15}$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    const fields = Object.keys(formData);
    
    // Validate all fields
    fields.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
    });
    
    // Mark all fields as touched
    const allTouched = Object.keys(touched).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, general: '' });
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...submitData } = formData;
      
      const response = await fetch('http://localhost:8080/api/charities/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registered charity data:', data);
        setSuccess('Charity registered successfully!');
        
        // Reset form
        setFormData({
          charityName: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
          postcode: '',
          phone: ''
        });
        
        // Reset touched state
        setTouched({
          charityName: false,
          email: false,
          password: false,
          confirmPassword: false,
          address: false,
          postcode: false,
          phone: false
        });
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const errorData = await response.json();
        
        // Handle specific errors
        if (response.status === 409) {
          setErrors({ ...errors, email: 'This email is already registered', general: '' });
        } else if (errorData.message && errorData.message.includes('email')) {
          setErrors({ ...errors, email: errorData.message, general: '' });
        } else {
          setErrors({ ...errors, general: errorData.message || 'Error registering charity' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ ...errors, general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <Link to="/login" className="login-button">Back to Login</Link>
      <h2>Charity Registration</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      {success && <p className="success">{success}</p>}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="charityName">Charity Name:</label>
          <input
            type="text"
            id="charityName"
            name="charityName"
            value={formData.charityName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.charityName && errors.charityName ? 'input-error' : ''}
            required
          />
          {touched.charityName && errors.charityName && 
            <p className="field-error">{errors.charityName}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.email && errors.email ? 'input-error' : ''}
            required
          />
          {touched.email && errors.email && 
            <p className="field-error">{errors.email}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.password && errors.password ? 'input-error' : ''}
            required
          />
          {touched.password && errors.password && 
            <p className="field-error">{errors.password}</p>}
          <small className="password-requirements">
            Password must be 8-20 characters and include uppercase, lowercase, 
            number, and special character.
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
            required
          />
          {touched.confirmPassword && errors.confirmPassword && 
            <p className="field-error">{errors.confirmPassword}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.address && errors.address ? 'input-error' : ''}
            required
          />
          {touched.address && errors.address && 
            <p className="field-error">{errors.address}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="postcode">Postcode:</label>
          <input
            type="text"
            id="postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.postcode && errors.postcode ? 'input-error' : ''}
            required
          />
          {touched.postcode && errors.postcode && 
            <p className="field-error">{errors.postcode}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.phone && errors.phone ? 'input-error' : ''}
            required
          />
          {touched.phone && errors.phone && 
            <p className="field-error">{errors.phone}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register Charity'}
        </button>
      </form>
    </div>
  );
};

export default CharityRegistration;