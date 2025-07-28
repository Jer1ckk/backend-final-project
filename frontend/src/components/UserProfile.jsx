// Frontend: User Profile Component
// File: frontend/src/components/UserProfile.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setEditForm({
          name: response.data.user.name,
          email: response.data.user.email
        });
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const response = await axios.put(
        'http://localhost:3001/api/user/profile',
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          ...response.data.user
        }));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={fetchUserProfile} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <div className="verification-badge">
          ✅ Account Verified in Database
        </div>
      </div>

      <div className="profile-content">
        {/* User Information Card */}
        <div className="profile-card">
          <h2>Personal Information</h2>
          
          {!isEditing ? (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{user.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Role:</span>
                <span className="value role">{user.role}</span>
              </div>
              <div className="info-row">
                <span className="label">Member Since:</span>
                <span className="value">{formatDate(user.memberSince)}</span>
              </div>
              <div className="info-row">
                <span className="label">Account Status:</span>
                <span className={`value status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? '🟢 Active' : '🔴 Inactive'}
                </span>
              </div>
              
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-btn"
              >
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={updateProfile} className="edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">💾 Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="cancel-btn"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Statistics Card */}
        <div className="stats-card">
          <h2>📊 Account Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{user.statistics.totalOrders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">${user.statistics.totalSpent}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.id}</div>
              <div className="stat-label">User ID</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {user.statistics.recentOrders && user.statistics.recentOrders.length > 0 && (
          <div className="recent-orders-card">
            <h2>🛍️ Recent Orders</h2>
            <div className="orders-list">
              {user.statistics.recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-number">#{order.orderNumber}</div>
                    <div className="order-details">
                      <span className="order-total">${order.total}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`payment-badge ${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Verification Info */}
        <div className="db-verification">
          <h3>🗄️ Database Verification</h3>
          <p>✅ Your account data is properly stored in our MySQL database</p>
          <p>🔄 Last updated: {formatDate(user.memberSince)}</p>
          <button 
            onClick={fetchUserProfile} 
            className="refresh-btn"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
