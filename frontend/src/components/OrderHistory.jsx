// Frontend: Order History Component
// File: frontend/src/components/OrderHistory.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Get token and user data
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  // Fetch order history
  const fetchOrderHistory = async (page = 1, status = '') => {
    try {
      const token = getAuthToken();
      const user = getUserData();

      if (!token || !user) {
        setError('No authentication found. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (status) {
        params.append('status', status);
      }

      const response = await axios.get(
        `http://localhost:3001/api/verification/orders/${user.id}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
        setSummary(response.data.data.summary);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch order history');
      }
    } catch (error) {
      console.error('Order history fetch error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } else {
        setError('Failed to load order history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchOrderHistory(newPage, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrderHistory(1, status);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'cancelled':
      case 'failed':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  // View order details
  const viewOrderDetails = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && orders.length === 0) {
    return (
      <div className="order-history-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      {/* Header */}
      <div className="history-header">
        <h1>📋 My Order History</h1>
        <p>Track and manage all your orders</p>
      </div>

      {/* Summary Statistics */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-number">{pagination.totalOrders || 0}</div>
            <div className="summary-label">Total Orders</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">${summary.totalSpent || '0.00'}</div>
            <div className="summary-label">Total Spent</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">
              {summary.ordersByStatus?.completed || 0}
            </div>
            <div className="summary-label">Completed Orders</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">
              {summary.lastOrderDate ? formatDate(summary.lastOrderDate) : 'N/A'}
            </div>
            <div className="summary-label">Last Order</div>
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="filter-section">
        <h3>Filter by Status:</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('processing')}
          >
            Processing
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchOrderHistory()} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="orders-section">
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-number">
                    <h3>#{order.orderNumber}</h3>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                    {order.payment && (
                      <span
                        className="payment-badge"
                        style={{ backgroundColor: getStatusColor(order.payment.paymentStatus) }}
                      >
                        {order.payment.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-content">
                  <div className="order-items-preview">
                    <h4>Items ({order.orderItems?.length || 0}):</h4>
                    <div className="items-preview">
                      {order.orderItems?.slice(0, 3).map((item) => (
                        <div key={item.id} className="item-preview">
                          <div className="item-image">
                            {item.product?.image ? (
                              <img src={item.product.image} alt={item.product.name} />
                            ) : (
                              <div className="no-image">📦</div>
                            )}
                          </div>
                          <div className="item-info">
                            <span className="item-name">{item.product?.name}</span>
                            <span className="item-quantity">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {order.orderItems?.length > 3 && (
                        <div className="more-items">
                          +{order.orderItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="order-total">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                    {order.payment && (
                      <div className="payment-info">
                        <span className="payment-method">{order.payment.paymentMethod}</span>
                        {order.payment.transactionId && (
                          <span className="transaction-id">
                            ID: {order.payment.transactionId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    onClick={() => viewOrderDetails(order.id)}
                    className="view-details-btn"
                  >
                    📋 View Details
                  </button>
                  {order.orderStatus === 'completed' && (
                    <button className="reorder-btn">
                      🔄 Reorder
                    </button>
                  )}
                  {(order.orderStatus === 'pending' || order.orderStatus === 'processing') && (
                    <button className="cancel-btn">
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="page-btn"
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-orders">
          <div className="no-orders-icon">🛍️</div>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/')}
            className="start-shopping-btn"
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Database Verification Notice */}
      <div className="db-notice">
        <h4>🗄️ Database Verification</h4>
        <p>All order data shown above is verified and stored in our secure MySQL database.</p>
        <p>Data is automatically synchronized and checked for consistency.</p>
      </div>
    </div>
  );
};

export default OrderHistory;
