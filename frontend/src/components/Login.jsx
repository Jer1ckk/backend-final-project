import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      console.log('🔄 Attempting login...');
      const response = await apiService.login(formData.email, formData.password);
      console.log('✅ Login successful:', response);
      
      // Show success message
      alert('Login successful! Welcome back.');
      
      // Redirect to homepage or dashboard
      navigate('/');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Add Google OAuth logic here
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login clicked');
    // Add Facebook OAuth logic here
  };

  return (
    <div className="login-container">
      <div className="login-card">
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
        
        <form onSubmit={handleSubmit} className="login-form">
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

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="form-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <a href="/forgot-password" className="forgot-link">
              Forgot your password?
            </a>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Social Login Buttons */}
          <div className="social-buttons">
            <button
              type="button"
              className="social-button google-button"
              onClick={handleGoogleLogin}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <button
              type="button"
              className="social-button facebook-button"
              onClick={handleFacebookLogin}
            >
              <span className="facebook-icon">f</span>
              Continue with Facebook
            </button>
          </div>

          {/* Register Link */}
          <div className="register-section">
            <span className="register-text">
              New StyleStore? <a href="/register" className="register-link">Register</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;