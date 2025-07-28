import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Register.css';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔄 Testing backend connection...');
      try {
        const result = await apiService.testConnection();
        setConnectionStatus(result.success);
        if (result.success) {
          console.log('✅ Backend connection successful');
        } else {
          console.error('❌ Backend connection failed:', result.error);
          setError('Cannot connect to server. Please make sure the backend is running.');
        }
      } catch (error) {
        console.error('❌ Connection test error:', error);
        setConnectionStatus(false);
        setError('Cannot connect to server. Please make sure the backend is running.');
      }
    };
    
    testConnection();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Attempting registration...');
      const response = await apiService.register(
        formData.name,
        formData.email,
        formData.password
      );

      console.log('✅ Registration successful:', response);
      
      // Show success message
      alert('Registration successful! You will be redirected to login.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Navigate to login page
      navigate('/login');
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    console.log('Facebook registration clicked');
    // Add Facebook OAuth logic here
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Connection Status Indicator */}
        {connectionStatus === false && (
          <div className="connection-error" style={{
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            ⚠️ Cannot connect to backend server. Please make sure the backend is running on port 3001.
          </div>
        )}
        
        {connectionStatus === true && (
          <div className="connection-success" style={{
            color: '#16a34a',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '4px',
            padding: '8px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            ✅ Connected to backend server
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ 
              color: '#ef4444', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '4px', 
              padding: '12px', 
              marginBottom: '16px' 
            }}>
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="input-group">
            <label htmlFor="name" className="input-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="form-input"
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password (min 6 characters)"
              className="form-input"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="form-input"
              required
            />
          </div>

          {/* Create Account Button */}
          <button type="submit" className="create-account-button" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Facebook Login */}
          <button
            type="button"
            className="facebook-button"
            onClick={handleFacebookLogin}
          >
            <span className="facebook-icon">f</span>
            Continue with Facebook
          </button>

          {/* Login Link */}
          <div className="login-section">
            <span className="login-text">
              Already have an account? <a href="/login" className="login-link">Login</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;