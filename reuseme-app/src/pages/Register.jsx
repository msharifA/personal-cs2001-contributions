import React, { useState, useEffect } from 'react';
// Added -> usenavigate to redirect user if they managed to register
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Register.css';

const Register = () => {
    // redirect -> to login after a regitartion
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
        general: ''
    });
    
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({
        name: false,
        surname: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear specific error when field changes
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };
    
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        validateField(name, formData[name]);
    };
    
    // Validate a specific field
    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required';
                } else if (value.length < 2) {
                    error = 'Name must be at least 2 characters';
                } else if (value.length > 50) {
                    error = 'Name must be less than 50 characters';
                } else if (!/^[a-zA-Z\s-']+$/.test(value)) {
                    error = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                }
                break;
                
            case 'surname':
                if (!value.trim()) {
                    error = 'Surname is required';
                } else if (value.length < 2) {
                    error = 'Surname must be at least 2 characters';
                } else if (value.length > 50) {
                    error = 'Surname must be less than 50 characters';
                } else if (!/^[a-zA-Z\s-']+$/.test(value)) {
                    error = 'Surname can only contain letters, spaces, hyphens, and apostrophes';
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
                    // Create checklist of requirements
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
                
            default:
                break;
        }
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };
        const fields = ['name', 'surname', 'email', 'password', 'confirmPassword'];
        
        // Validate all fields
        fields.forEach(field => {
            const fieldIsValid = validateField(field, formData[field]);
            if (!fieldIsValid) isValid = false;
        });
        
        // Additional validation for passwords matching
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setErrors({ ...errors, general: '' });
        
        // Mark all fields as touched
        const allTouched = Object.keys(touched).reduce((acc, field) => {
            acc[field] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Prepare data for submission (exclude confirmPassword)
            const { confirmPassword, ...submitData } = formData;
            
            const response = await axios.post('http://localhost:8080/api/users/register', submitData);
            
            if (response.status === 200) {
                setSuccess('Registration successful!');
                setFormData({
                    name: '',
                    surname: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                // Reset touched state
                setTouched({
                    name: false,
                    surname: false,
                    email: false,
                    password: false,
                    confirmPassword: false
                });
                
                // Navigate to login after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle specific API error responses
            if (error.response) {
                if (error.response.status === 409) {
                    setErrors({ ...errors, email: 'This email is already registered', general: '' });
                } else if (error.response.data && error.response.data.includes('email')) {
                    setErrors({ ...errors, email: error.response.data, general: '' });
                } else {
                    setErrors({ ...errors, general: error.response.data || 'Registration failed. Please try again.' });
                }
            } else {
                setErrors({ ...errors, general: 'Network error. Please check your connection and try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <Link to="/login" className="login-button">Login</Link>
            <h2>Register</h2>
            
            {errors.general && <p className="error">{errors.general}</p>}
            {success && <p className="success">{success}</p>}
            
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your name"
                        className={touched.name && errors.name ? 'input-error' : ''}
                        required
                    />
                    {touched.name && errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                
                <div className="form-group">
                    <label>Surname:</label>
                    <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your surname"
                        className={touched.surname && errors.surname ? 'input-error' : ''}
                        required
                    />
                    {touched.surname && errors.surname && <p className="field-error">{errors.surname}</p>}
                </div>
                
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your email"
                        className={touched.email && errors.email ? 'input-error' : ''}
                        required
                    />
                    {touched.email && errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your password"
                        className={touched.password && errors.password ? 'input-error' : ''}
                        required
                    />
                    {touched.password && errors.password && <p className="field-error">{errors.password}</p>}
                    <small className="password-requirements">
                        Password must be 8-20 characters and include at least one uppercase letter, 
                        one lowercase letter, one number, and one special character.
                    </small>
                </div>
                
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Confirm your password"
                        className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
                        required
                    />
                    {touched.confirmPassword && errors.confirmPassword && 
                        <p className="field-error">{errors.confirmPassword}</p>}
                </div>
                
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default Register;