// Enhanced API service with connection verification and error handling
// File: frontend/src/services/api.js

import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const CONNECTION_TIMEOUT = 10000; // 10 seconds

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: CONNECTION_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Connection status tracking
let isBackendConnected = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// Enhanced error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Cannot connect to backend server. Please make sure the backend is running on port 3001.',
  TIMEOUT_ERROR: 'Request timed out. The server might be overloaded.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CORS_ERROR: 'Cross-origin request blocked. Please contact support.',
  CONNECTION_REFUSED: 'Connection refused. Backend server is not running.',
  DNS_ERROR: 'Cannot resolve server address. Check your network connection.'
};

// Connection checker function
const checkBackendConnection = async () => {
  const now = Date.now();
  
  // Skip if checked recently
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return isBackendConnected;
  }
  
  try {
    console.log('🔍 Checking backend connection...');
    const response = await axios.get(`${API_BASE_URL}/health`, { 
      timeout: 5000,
      withCredentials: true 
    });
    
    isBackendConnected = response.status === 200;
    lastConnectionCheck = now;
    
    if (isBackendConnected) {
      console.log('✅ Backend connection successful');
    }
    
    return isBackendConnected;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    isBackendConnected = false;
    lastConnectionCheck = now;
    return false;
  }
};

// Enhanced error handler
const handleApiError = (error) => {
  console.error('🚫 API Error:', error);
  
  // Network/Connection errors
  if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
    return {
      type: 'CONNECTION_ERROR',
      message: ERROR_MESSAGES.CONNECTION_REFUSED,
      details: 'Backend server is not running on port 3001'
    };
  }
  
  if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
    return {
      type: 'DNS_ERROR',
      message: ERROR_MESSAGES.DNS_ERROR,
      details: 'Cannot resolve localhost'
    };
  }
  
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return {
      type: 'TIMEOUT_ERROR',
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      details: `Request timed out after ${CONNECTION_TIMEOUT}ms`
    };
  }
  
  if (!error.response) {
    return {
      type: 'NETWORK_ERROR',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      details: error.message || 'Network request failed'
    };
  }

  // HTTP Response errors
  const status = error.response.status;
  const data = error.response.data;
  
  switch (status) {
    case 401:
      return {
        type: 'AUTH_ERROR',
        message: ERROR_MESSAGES.AUTH_ERROR,
        details: data.message || 'Unauthorized access'
      };
    
    case 400:
      return {
        type: 'VALIDATION_ERROR',
        message: data.message || ERROR_MESSAGES.VALIDATION_ERROR,
        details: data.errors || 'Bad request'
      };
    
    case 403:
      return {
        type: 'FORBIDDEN_ERROR',
        message: 'Access forbidden. You don\'t have permission.',
        details: data.message || 'Forbidden'
      };
    
    case 404:
      return {
        type: 'NOT_FOUND_ERROR',
        message: 'Resource not found.',
        details: data.message || 'Endpoint not found'
      };
    
    case 500:
      return {
        type: 'SERVER_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
        details: data.message || 'Internal server error'
      };
    
    default:
      return {
        type: 'UNKNOWN_ERROR',
        message: `Server returned ${status} error`,
        details: data.message || 'Unknown error occurred'
      };
  }
};

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data ? Object.keys(config.data) : 'No data'
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (handle responses and errors)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    isBackendConnected = true;
    return response;
  },
  (error) => {
    const apiError = handleApiError(error);
    
    // Auto-logout on auth errors
    if (apiError.type === 'AUTH_ERROR') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Mark backend as disconnected on connection errors
    if (['CONNECTION_ERROR', 'NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(apiError.type)) {
      isBackendConnected = false;
    }
    
    return Promise.reject(apiError);
  }
);

// API methods with enhanced error handling
export const apiService = {
  // Connection utilities
  checkConnection: checkBackendConnection,
  isConnected: () => isBackendConnected,
  
  // Auth methods
  async register(userData) {
    await checkBackendConnection();
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  async login(credentials) {
    await checkBackendConnection();
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      console.warn('Logout request failed, clearing local storage anyway');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
  },
  
  // Generic HTTP methods
  async get(url, config = {}) {
    await checkBackendConnection();
    const response = await api.get(url, config);
    return response.data;
  },
  
  async post(url, data, config = {}) {
    await checkBackendConnection();
    const response = await api.post(url, data, config);
    return response.data;
  },
  
  async put(url, data, config = {}) {
    await checkBackendConnection();
    const response = await api.put(url, data, config);
    return response.data;
  },
  
  async delete(url, config = {}) {
    await checkBackendConnection();
    const response = await api.delete(url, config);
    return response.data;
  }
};

// Note: Import React hooks in your component files where you use this
// import { useState, useEffect } from 'react';

// Connection status hook for React components
export const useConnectionStatus = () => {
  // This hook should be used in React components
  // Make sure to import useState and useEffect in the component file
  console.warn('useConnectionStatus hook requires React imports in your component');
  return false; // Default return
};

export default apiService;
