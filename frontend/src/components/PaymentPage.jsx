import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import {
  Heart,
  Bell,
  ShoppingBag,
  ArrowLeft,
  Plus,
  Minus,
  CreditCard,
  Truck,
  Shield,
  Check,
  User,
  LogOut,
} from "lucide-react";
import "../styles/PaymentPage.css";
import apiService from "../services/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Product and order state
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // User state (similar to homepage)
  const [user, setUser] = useState(null);

  // Payment flow state
  const [currentStep, setCurrentStep] = useState("product-details"); // 'product-details' or 'checkout'

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Cambodia",
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is logged in (similar to homepage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    // Function to fetch product by ID from API
    const fetchProductById = async (productId) => {
      setIsLoading(true);
      try {
        const response = await apiService.getProduct(productId);

        if (response.product) {
          const fetchedProduct = response.product;

          // Parse JSON strings from database
          const processedProduct = {
            ...fetchedProduct,
            images: fetchedProduct.images
              ? JSON.parse(fetchedProduct.images)
              : [],
            colors: fetchedProduct.colors
              ? JSON.parse(fetchedProduct.colors)
              : [],
            sizes: fetchedProduct.sizes ? JSON.parse(fetchedProduct.sizes) : [],
            tags: fetchedProduct.tags ? JSON.parse(fetchedProduct.tags) : [],
            // Convert string prices to numbers
            originalPrice: parseFloat(fetchedProduct.originalPrice) || 0,
            salePrice: parseFloat(fetchedProduct.salePrice) || 0,
            price:
              parseFloat(fetchedProduct.salePrice) ||
              parseFloat(fetchedProduct.originalPrice) ||
              0,
          };

          console.log("🔍 Raw product from API:", fetchedProduct);
          console.log("🔍 Processed product:", processedProduct);

          setProduct(processedProduct);

          // Set default selections
          if (processedProduct.colors && processedProduct.colors.length > 0) {
            setSelectedColor(processedProduct.colors[0]);
          }
          if (processedProduct.sizes && processedProduct.sizes.length > 0) {
            setSelectedSize(processedProduct.sizes[0]);
          } else {
            setSelectedSize("M"); // Default size
          }
        } else {
          console.error("Product not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (location.state && location.state.product) {
      // Handle product data from navigation state - use this data directly to maintain consistency
      const receivedProduct = location.state.product;

      console.log("🔍 Navigation state product:", receivedProduct);
      console.log(
        "🔍 Using navigation state data directly to maintain price consistency"
      );

      // Process the navigation state data - keep original price structure
      const processedProduct = {
        ...receivedProduct,
        images: receivedProduct.images
          ? typeof receivedProduct.images === "string"
            ? JSON.parse(receivedProduct.images)
            : receivedProduct.images
          : [],
        colors: receivedProduct.colors
          ? typeof receivedProduct.colors === "string"
            ? JSON.parse(receivedProduct.colors)
            : receivedProduct.colors
          : [],
        sizes: receivedProduct.sizes
          ? typeof receivedProduct.sizes === "string"
            ? JSON.parse(receivedProduct.sizes)
            : receivedProduct.sizes
          : [],
        tags: receivedProduct.tags
          ? typeof receivedProduct.tags === "string"
            ? JSON.parse(receivedProduct.tags)
            : receivedProduct.tags
          : [],
        // Keep original price structure from homepage - don't recalculate
        originalPrice: parseFloat(receivedProduct.originalPrice) || 0,
        salePrice: receivedProduct.salePrice
          ? parseFloat(receivedProduct.salePrice)
          : null,
        price: parseFloat(receivedProduct.price) || 0, // Use the price from homepage directly
      };

      console.log("🔍 Raw product from navigation:", receivedProduct);
      console.log("🔍 Raw product price details:", {
        price: receivedProduct.price,
        salePrice: receivedProduct.salePrice,
        originalPrice: receivedProduct.originalPrice,
        priceType: typeof receivedProduct.price,
        salePriceType: typeof receivedProduct.salePrice,
        originalPriceType: typeof receivedProduct.originalPrice,
      });
      console.log("🔍 Processed product from navigation:", processedProduct);
      console.log("🔍 Processed product price details:", {
        price: processedProduct.price,
        salePrice: processedProduct.salePrice,
        originalPrice: processedProduct.originalPrice,
        priceType: typeof processedProduct.price,
        salePriceType: typeof processedProduct.salePrice,
        originalPriceType: typeof processedProduct.originalPrice,
      });

      setProduct(processedProduct);

      // Set default selections
      if (processedProduct.colors && processedProduct.colors.length > 0) {
        setSelectedColor(processedProduct.colors[0]);
      }
      if (processedProduct.sizes && processedProduct.sizes.length > 0) {
        setSelectedSize(processedProduct.sizes[0]);
      } else {
        setSelectedSize("M"); // Default size
      }
    } else if (id) {
      // Handle product ID from URL parameters
      fetchProductById(id);
    } else {
      // If no product data or ID, redirect to home
      navigate("/");
    }
  }, [location.state, id, navigate]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper function to get the current effective price
  const getCurrentPrice = () => {
    if (!product) return 0;
    // Use the same logic as homepage: product.price (which should already be the effective price)
    const effectivePrice = product.price || 0;
    console.log("💰 Price calculation:", {
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      price: product.price,
      effectivePrice: effectivePrice,
      note: "Using product.price to match homepage display",
    });
    return effectivePrice;
  };

  const calculateSubtotal = () => {
    if (!product) return 0;
    const price = getCurrentPrice();
    return (price * quantity).toFixed(2);
  };

  const calculateSavings = () => {
    if (!product) return 0;
    const originalPrice = product.originalPrice || 0;
    const currentPrice = getCurrentPrice();
    return ((originalPrice - currentPrice) * quantity).toFixed(2);
  };

  const calculateShipping = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return subtotal > 50 ? 0 : 1.25; // Free shipping over $50
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.1).toFixed(2); // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const shipping = calculateShipping();
    const tax = parseFloat(calculateTax());
    return (subtotal + shipping + tax).toFixed(2);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Render the homepage-style header
  const renderHeader = () => (
    <div className="header">
      {/* Logo */}
      <div className="logo-container">
        <Link to="/" className="logo-bg">
          <span className="logo-text">
            <span className="logo-star">★</span>
            StyleStore
          </span>
        </Link>
      </div>
      {/* Search + Icons + Login/Register */}
      <div className="header-right">
        <div className="header-row">
          <input type="text" placeholder="Search" className="search-input" />
          {/* Icons area */}
          <div className="icons-area">
            <Bell size={20} className="text-black" />
            <Heart size={20} className="text-black" />
            <div className="shopping-bag-rel">
              <ShoppingBag size={22} className="text-black" />
              <span className="shopping-bag-badge">0</span>
            </div>

            {/* User Authentication Section */}
            {user ? (
              <div
                className="user-section"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  className="user-info"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <User size={20} className="text-black" />
                  <span style={{ color: "#000", fontSize: "14px" }}>
                    Hi, {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    color: "#ef4444",
                  }}
                >
                  <LogOut size={16} />
                  <span style={{ fontSize: "12px" }}>Logout</span>
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  ⚠️ Login Required for Orders
                </span>
                <Link to="/login" className="login-link">
                  LOGIN
                </Link>
                <Link to="/register" className="register-link">
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) {
    return (
      <div className="payment-page">
        {renderHeader()}
        <div className="loading-container">
          <div className="loading">
            {isLoading
              ? "Loading product details..."
              : "Loading payment page..."}
          </div>
        </div>
      </div>
    );
  }

  // Product Details Step (First Interface)
  const renderProductDetails = () => (
    <div className="product-details-container">
      <div className="product-details-content">
        {/* Large Product Image */}
        <div className="product-large-image-container">
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "400px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ddd",
            }}
          >
            <span>Product Image</span>
          </div>
          {(product.onSale || product.discount > 0) && (
            <div className="sale-badge-large">SALE</div>
          )}
        </div>

        {/* Product Information */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-price-section">
            <span className="current-price-large">
              ${getCurrentPrice().toFixed(2)}
            </span>
            {product.originalPrice &&
              product.originalPrice !== getCurrentPrice() && (
                <span className="original-price-large">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="selection-group">
              <label className="selection-label">Color:</label>
              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option-large ${
                      selectedColor === color ? "selected" : ""
                    }`}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      backgroundColor: color === "white" ? "#f8f9fa" : color,
                    }}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                  >
                    {selectedColor === color && <Check size={16} />}
                  </button>
                ))}
              </div>
              <span className="selected-display">
                {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
              </span>
            </div>
          )}

          {/* Size Selection */}
          <div className="selection-group">
            <label className="selection-label">Size:</label>
            <div className="size-options">
              {(product.sizes || ["XS", "S", "M", "L", "XL"]).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-option-large ${
                    selectedSize === size ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="selection-group">
            <label className="selection-label">Quantity:</label>
            <div className="quantity-selector-large">
              <button
                type="button"
                className="quantity-btn-large decrease"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="quantity-display-large">{quantity}</span>
              <button
                type="button"
                className="quantity-btn-large increase"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="quantity-total">
              <span>Total: ${calculateSubtotal()}</span>
            </div>
          </div>

          {/* Proceed to Checkout Button */}
          <button
            className="proceed-checkout-btn"
            onClick={() => setCurrentStep("checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );

  // Checkout Step (Second Interface)
  const renderCheckout = () => (
    <div className="checkout-container">
      <div className="checkout-content">
        {/* Order Summary Container */}
        <div className="order-summary-container">
          <h2>Order Summary</h2>

          <div className="summary-product">
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "12px" }}>Image</span>
            </div>
            <div className="summary-product-details">
              <h3>{product.name}</h3>
              <p>
                <strong>Color:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    backgroundColor: selectedColor,
                    borderRadius: "50%",
                    marginLeft: "8px",
                    border: "2px solid #e5e7eb",
                  }}
                ></span>{" "}
                {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
              </p>
              <p>
                <strong>Size:</strong> {selectedSize}
              </p>
              <p>
                <strong>Quantity:</strong> {quantity}
              </p>
              <p className="summary-price">
                ${getCurrentPrice().toFixed(2)} each
              </p>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-line">
              <span>
                Subtotal ({quantity} item{quantity > 1 ? "s" : ""})
              </span>
              <span>${calculateSubtotal()}</span>
            </div>
            {parseFloat(calculateSavings()) > 0 && (
              <div className="price-line savings">
                <span>You Save</span>
                <span>-${calculateSavings()}</span>
              </div>
            )}
            <div className="price-line">
              <span>
                Delivery {calculateShipping() === 0 ? "(Free over $50)" : ""}
              </span>
              <span>
                {calculateShipping() === 0
                  ? "FREE"
                  : `$${calculateShipping().toFixed(2)}`}
              </span>
            </div>
            <div className="price-line">
              <span>Tax</span>
              <span>${calculateTax()}</span>
            </div>
            <div className="price-divider"></div>
            <div className="price-line total">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Checkout & Payment Details Container */}
        <div className="payment-details-container">
          <h2>Payment & Shipping</h2>

          <form onSubmit={handleSubmitOrderComplete} className="checkout-form">
            {/* Error Display */}
            {error && (
              <div
                className="error-message"
                style={{
                  backgroundColor: "#fee",
                  color: "#c33",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #fcc",
                }}
              >
                {error}
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="payment-methods-section">
              <h3>Choose Payment Method</h3>
              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "card" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <CreditCard size={24} className="payment-icon" />
                    <span>Credit/Debit Card</span>
                    <div className="card-brands">
                      <span className="visa">VISA</span>
                      <span className="mastercard">MC</span>
                    </div>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "paypal" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">💳</span>
                    <span>PayPal</span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "cod" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">💰</span>
                    <span>Cash on Delivery</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Card Details (if card is selected) */}
            {paymentMethod === "card" && (
              <div className="card-details-section">
                <h3>Card Details</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentForm.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Information */}
            <div className="shipping-section">
              <h3>Shipping Information</h3>
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-field">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={paymentForm.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={paymentForm.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={paymentForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={paymentForm.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={paymentForm.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={paymentForm.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter ZIP code"
                      required
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={paymentForm.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Cambodia">Cambodia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Confirm Order Button */}
            <button
              type="submit"
              className="confirm-order-btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="processing">
                  <span className="spinner"></span>
                  Processing Order...
                </span>
              ) : (
                `Complete Order - $${calculateTotal()}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const handleSubmitOrderComplete = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !user || !userData) {
        setError(
          "Please log in to complete your order. You need to be logged in to place orders."
        );
        setIsProcessing(false);
        return;
      }

      // Verify user data is valid
      let parsedUser;
      try {
        parsedUser = JSON.parse(userData);
        if (!parsedUser.id) {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
        setError("Please log out and log in again to complete your order.");
        setIsProcessing(false);
        return;
      }

      console.log("🚀 Starting order creation...");
      console.log("📦 Product:", product);
      console.log("👤 User:", user);

      // Step 1: Create the order
      const orderData = {
        items: [
          {
            product: product.id,
            quantity: quantity,
            color: selectedColor,
            size: selectedSize,
          },
        ],
        shippingAddress: {
          name: `${paymentForm.firstName} ${paymentForm.lastName}`,
          street: paymentForm.address,
          city: paymentForm.city,
          zipCode: paymentForm.zipCode,
          country: paymentForm.country,
          phone: paymentForm.email, // Using email as contact for now
        },
        billingAddress: {
          name: `${paymentForm.firstName} ${paymentForm.lastName}`,
          street: paymentForm.address,
          city: paymentForm.city,
          zipCode: paymentForm.zipCode,
          country: paymentForm.country,
        },
        paymentMethod:
          paymentMethod === "card"
            ? "credit_card"
            : paymentMethod === "cod"
            ? "cash_on_delivery"
            : paymentMethod,
      };

      console.log("📋 Order data:", orderData);

      const orderResponse = await apiService.createOrder(orderData);
      console.log("📦 Order response:", orderResponse);

      if (!orderResponse || !orderResponse.success) {
        throw new Error(orderResponse?.message || "Failed to create order");
      }

      const order = orderResponse.order;
      setCreatedOrder(order);
      console.log("✅ Order created successfully:", order);

      // Step 2: Process the payment
      const paymentData = {
        orderId: order.id,
        paymentMethod:
          paymentMethod === "card"
            ? "credit_card"
            : paymentMethod === "cod"
            ? "cash_on_delivery"
            : paymentMethod,
        amount: parseFloat(calculateTotal()),
        paymentGateway: paymentMethod === "card" ? "stripe" : "manual",
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        gatewayResponse: {
          status: "succeeded",
          payment_method: paymentMethod,
          card_last4:
            paymentMethod === "card" ? paymentForm.cardNumber.slice(-4) : null,
          processed_at: new Date().toISOString(),
        },
      };

      console.log("💳 Payment data:", paymentData);

      const paymentResponse = await apiService.processPayment(paymentData);
      console.log("💳 Payment response:", paymentResponse);

      if (!paymentResponse || !paymentResponse.success) {
        throw new Error(
          paymentResponse?.message || "Payment processing failed"
        );
      }

      setPaymentResult(paymentResponse.payment);
      console.log(
        "✅ Payment processed successfully:",
        paymentResponse.payment
      );

      // Success - show completion screen
      setIsProcessing(false);
      setOrderComplete(true);
    } catch (error) {
      console.error("❌ Order/Payment processing error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      let errorMessage = "An error occurred while processing your order";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="payment-page">
        {renderHeader()}

        <div className="order-success">
          <div className="success-container">
            <div className="success-icon">
              <Check size={64} color="#10b981" />
            </div>
            <h1>Order Successful!</h1>
            <p>
              Thank you for your purchase. Your order has been confirmed and
              will be delivered soon.
            </p>
            <div className="order-details">
              <h3>Order Summary</h3>
              {createdOrder && (
                <div
                  className="order-info"
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  <p>
                    <strong>Order Number:</strong> {createdOrder.orderNumber}
                  </p>
                  <p>
                    <strong>Order Status:</strong> {createdOrder.orderStatus}
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    {createdOrder.paymentStatus}
                  </p>
                </div>
              )}
              <div className="order-item">
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "10px" }}>Image</span>
                </div>
                <div className="order-item-info">
                  <p>
                    <strong>{product.name}</strong>
                  </p>
                  <p>Quantity: {quantity}</p>
                  <p>Color: {selectedColor}</p>
                  <p>Size: {selectedSize}</p>
                  <p className="order-total">
                    <strong>Total: ${calculateTotal()}</strong>
                  </p>
                </div>
              </div>
              {paymentResult && (
                <div
                  className="payment-info"
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#e8f5e8",
                    borderRadius: "8px",
                  }}
                >
                  <p>
                    <strong>Transaction ID:</strong>{" "}
                    {paymentResult.transactionId}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {paymentResult.paymentMethod}
                  </p>
                  <p>
                    <strong>Payment Status:</strong> {paymentResult.status}
                  </p>
                </div>
              )}
            </div>
            <div className="action-buttons">
              <button
                onClick={() => navigate("/")}
                className="continue-shopping-btn"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="view-orders-btn"
              >
                Track Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {renderHeader()}

      {/* Back Button */}
      <div className="back-navigation">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          Back to Shopping
        </button>
      </div>

      {/* Main Content - Two Step Process */}
      <div className="payment-main-content">
        {currentStep === "product-details"
          ? renderProductDetails()
          : renderCheckout()}
      </div>
    </div>
  );
};

export default PaymentPage;
