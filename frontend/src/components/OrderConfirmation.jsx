// Frontend: Order Confirmation Component
// File: frontend/src/components/OrderConfirmation.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/OrderConfirmation.css";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState(null);

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Fetch order details and verify data
  const fetchOrderDetails = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch order details
      const orderResponse = await axios.get(
        `http://localhost:3001/api/verification/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (orderResponse.data.success) {
        setOrder(orderResponse.data.order);

        // Fetch payment verification
        const paymentResponse = await axios.get(
          `http://localhost:3001/api/verification/payment/verify/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (paymentResponse.data.success) {
          setVerification(paymentResponse.data.verification);
        }
      } else {
        setError(orderResponse.data.message || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Order fetch error:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } else if (error.response?.status === 404) {
        setError("Order not found. Please check your order number.");
      } else {
        setError("Failed to load order details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "#27ae60";
      case "pending":
        return "#f39c12";
      case "processing":
        return "#3498db";
      case "cancelled":
      case "failed":
        return "#e74c3c";
      default:
        return "#7f8c8d";
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchOrderDetails} className="retry-btn">
              Try Again
            </button>
            <button onClick={() => navigate("/")} className="home-btn">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      {/* Success Header */}
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h1>Order Confirmed!</h1>
        <p>
          Thank you for your purchase. Your order has been successfully placed
          and verified in our database.
        </p>
      </div>

      {/* Order Summary */}
      <div className="order-summary-card">
        <h2>📋 Order Summary</h2>
        <div className="order-info-grid">
          <div className="info-item">
            <span className="label">Order Number:</span>
            <span className="value">{order.orderNumber}</span>
          </div>
          <div className="info-item">
            <span className="label">Order Date:</span>
            <span className="value">{formatDate(order.createdAt)}</span>
          </div>
          <div className="info-item">
            <span className="label">Order Status:</span>
            <span
              className="value status"
              style={{ color: getStatusColor(order.orderStatus) }}
            >
              {order.orderStatus}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Payment Status:</span>
            <span
              className="value status"
              style={{ color: getStatusColor(order.payment?.paymentStatus) }}
            >
              {order.payment?.paymentStatus || "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Items Purchased */}
      <div className="items-card">
        <h2>🛍️ Items Purchased</h2>
        <div className="items-list">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="item-row">
              <div className="item-image">
                {(() => {
                  // Helper function to safely get product image
                  const getProductImage = (product) => {
                    if (!product) return null;

                    // Try parsing images array first
                    if (product.images) {
                      try {
                        const parsedImages = JSON.parse(product.images);
                        if (
                          Array.isArray(parsedImages) &&
                          parsedImages.length > 0
                        ) {
                          return parsedImages[0];
                        }
                      } catch (e) {
                        // If parsing fails, continue to fallback
                      }
                    }

                    // Fallback to single image property
                    return product.image || null;
                  };

                  const imageUrl = getProductImage(item.product);

                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.product?.name || "Product"}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : (
                    <div className="no-image">📦</div>
                  );
                })()}
                <div className="no-image" style={{ display: "none" }}>
                  📦
                </div>
              </div>
              <div className="item-details">
                <h3>{item.product?.name || "Product"}</h3>
                <p>Category: {item.product?.category || "N/A"}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="item-price">
                <span className="unit-price">
                  ${parseFloat(item.price).toFixed(2)} each
                </span>
                <span className="total-price">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      {order.payment && (
        <div className="payment-card">
          <h2>💳 Payment Details</h2>
          <div className="payment-info-grid">
            <div className="info-item">
              <span className="label">Payment Method:</span>
              <span className="value">{order.payment.paymentMethod}</span>
            </div>
            <div className="info-item">
              <span className="label">Transaction ID:</span>
              <span className="value">
                {order.payment.transactionId || "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Payment Date:</span>
              <span className="value">
                {order.payment.paymentDate
                  ? formatDate(order.payment.paymentDate)
                  : "Pending"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Amount Paid:</span>
              <span className="value">
                ${parseFloat(order.payment.amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Total */}
      <div className="total-card">
        <h2>💰 Order Total</h2>
        <div className="total-breakdown">
          <div className="total-row">
            <span>Items Total:</span>
            <span>${order.calculations?.itemsTotal || "0.00"}</span>
          </div>
          {order.calculations?.tax &&
            parseFloat(order.calculations.tax) > 0 && (
              <div className="total-row">
                <span>Tax:</span>
                <span>${order.calculations.tax}</span>
              </div>
            )}
          {order.calculations?.shipping &&
            parseFloat(order.calculations.shipping) > 0 && (
              <div className="total-row">
                <span>Shipping:</span>
                <span>${order.calculations.shipping}</span>
              </div>
            )}
          <div className="total-row final-total">
            <span>Final Total:</span>
            <span>${parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Database Verification */}
      {verification && (
        <div className="verification-card">
          <h2>🗄️ Database Verification</h2>
          <div className="verification-grid">
            <div className="verification-item">
              <span className="check-label">Order in Database:</span>
              <span
                className={`check-value ${
                  verification.orderExists ? "success" : "error"
                }`}
              >
                {verification.orderExists ? "✅ Verified" : "❌ Not Found"}
              </span>
            </div>
            <div className="verification-item">
              <span className="check-label">Payment Record:</span>
              <span
                className={`check-value ${
                  verification.paymentRecord ? "success" : "error"
                }`}
              >
                {verification.paymentRecord ? "✅ Verified" : "❌ Missing"}
              </span>
            </div>
            <div className="verification-item">
              <span className="check-label">Amount Match:</span>
              <span
                className={`check-value ${
                  verification.amountsMatch ? "success" : "error"
                }`}
              >
                {verification.amountsMatch ? "✅ Verified" : "❌ Mismatch"}
              </span>
            </div>
            <div className="verification-item">
              <span className="check-label">Data Integrity:</span>
              <span
                className={`check-value ${
                  order.verification?.dataConsistency ? "success" : "error"
                }`}
              >
                {order.verification?.dataConsistency
                  ? "✅ Verified"
                  : "❌ Issues Found"}
              </span>
            </div>
          </div>

          <div className="verification-timestamp">
            <small>Verified at: {formatDate(verification.timestamp)}</small>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={() => navigate(`/order-history`)}
          className="view-orders-btn"
        >
          📋 View All Orders
        </button>
        <button onClick={() => navigate("/")} className="continue-shopping-btn">
          🛍️ Continue Shopping
        </button>
        <button onClick={() => window.print()} className="print-btn">
          🖨️ Print Confirmation
        </button>
      </div>

      {/* Customer Support */}
      <div className="support-card">
        <h3>Need Help?</h3>
        <p>
          If you have any questions about your order, please contact our
          customer support.
        </p>
        <div className="support-actions">
          <button className="support-btn">📞 Contact Support</button>
          <button className="support-btn">📧 Email Us</button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
