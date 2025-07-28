-- Complete Database Schema for Clothing Store Payment System
-- Run these CREATE TABLE statements in MySQL Workbench

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone VARCHAR(20),
    address JSON,
    isActive BOOLEAN DEFAULT true,
    emailVerified BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parentId INT NULL,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parentId),
    INDEX idx_active (isActive)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    salePrice DECIMAL(10, 2),
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    categoryId INT,
    subcategoryId INT,
    brand VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(20),
    weight DECIMAL(8, 2),
    dimensions JSON,
    images JSON,
    tags JSON,
    isActive BOOLEAN DEFAULT true,
    isFeatured BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategoryId) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (categoryId),
    INDEX idx_price (price),
    INDEX idx_stock (stock),
    INDEX idx_active (isActive),
    CHECK (price >= 0),
    CHECK (stock >= 0)
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    orderNumber VARCHAR(50) UNIQUE NOT NULL,
    shippingAddress JSON NOT NULL,
    billingAddress JSON,
    paymentMethod ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery') NOT NULL,
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    orderStatus ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    shippingCost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    trackingNumber VARCHAR(100),
    estimatedDelivery DATE,
    deliveredAt TIMESTAMP NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_order_number (orderNumber),
    INDEX idx_payment_status (paymentStatus),
    INDEX idx_order_status (orderStatus),
    INDEX idx_created (createdAt),
    CHECK (subtotal >= 0),
    CHECK (shippingCost >= 0),
    CHECK (tax >= 0),
    CHECK (total >= 0)
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    color VARCHAR(50),
    size VARCHAR(20),
    discount DECIMAL(10, 2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (orderId),
    INDEX idx_product (productId),
    CHECK (quantity > 0),
    CHECK (price >= 0),
    CHECK (discount >= 0)
);

-- 6. Payments Table (NEW - Main focus)
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderId INT NOT NULL,
    paymentMethod ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    transactionId VARCHAR(100) UNIQUE,
    paymentGateway VARCHAR(50),
    gatewayResponse JSON,
    paidAt TIMESTAMP NULL,
    failureReason TEXT,
    refundedAt TIMESTAMP NULL,
    refundAmount DECIMAL(10, 2),
    processingFee DECIMAL(10, 2) DEFAULT 0,
    netAmount DECIMAL(10, 2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (orderId),
    INDEX idx_transaction (transactionId),
    INDEX idx_status (status),
    INDEX idx_payment_method (paymentMethod),
    INDEX idx_paid_at (paidAt),
    CHECK (amount >= 0),
    CHECK (refundAmount >= 0),
    CHECK (processingFee >= 0)
);

-- 7. Cart Table (for temporary storage)
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    color VARCHAR(50),
    size VARCHAR(20),
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (userId, productId, color, size),
    INDEX idx_user (userId),
    INDEX idx_product (productId),
    CHECK (quantity > 0)
);

-- 8. User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    productId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (userId, productId),
    INDEX idx_user (userId),
    INDEX idx_product (productId)
);

-- 9. Product Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    productId INT NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(200),
    comment TEXT,
    isVerifiedPurchase BOOLEAN DEFAULT false,
    isApproved BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_product (productId),
    INDEX idx_rating (rating),
    INDEX idx_approved (isApproved),
    CHECK (rating >= 1 AND rating <= 5)
);

-- 10. Inventory Logs Table (optional but recommended)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productId INT NOT NULL,
    orderId INT,
    changeType ENUM('sale', 'restock', 'adjustment', 'return') NOT NULL,
    quantityBefore INT NOT NULL,
    quantityChange INT NOT NULL,
    quantityAfter INT NOT NULL,
    reason VARCHAR(255),
    performedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (performedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product (productId),
    INDEX idx_order (orderId),
    INDEX idx_change_type (changeType),
    INDEX idx_created (createdAt)
);

-- Create indexes for better performance
CREATE INDEX idx_payments_created_at ON payments(createdAt);
CREATE INDEX idx_payments_amount ON payments(amount);
CREATE INDEX idx_orders_total ON orders(total);
CREATE INDEX idx_products_stock_low ON products(stock) WHERE stock < 10;

-- Sample triggers for automatic calculations
DELIMITER //

-- Trigger to update order total when order items change
CREATE TRIGGER update_order_total AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET subtotal = (
        SELECT SUM(quantity * price) 
        FROM order_items 
        WHERE orderId = NEW.orderId
    ),
    total = subtotal + shippingCost + tax - discount
    WHERE id = NEW.orderId;
END//

-- Trigger to log inventory changes
CREATE TRIGGER log_inventory_change AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.stock != NEW.stock THEN
        INSERT INTO inventory_logs (
            productId, changeType, quantityBefore, 
            quantityChange, quantityAfter, reason
        ) VALUES (
            NEW.id, 'adjustment', OLD.stock, 
            NEW.stock - OLD.stock, NEW.stock, 
            'Stock updated'
        );
    END IF;
END//

DELIMITER ;

-- Insert sample data for testing
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@clothingstore.com', '$2a$10$example_hashed_password', 'admin'),
('Test Customer', 'customer@test.com', '$2a$10$example_hashed_password', 'customer');

INSERT INTO categories (name, description) VALUES 
('Women', 'Women\'s clothing and accessories'),
('Men', 'Men\'s clothing and accessories'),
('Accessories', 'Bags, belts, and other accessories');

INSERT INTO products (name, description, price, stock, categoryId) VALUES 
('Women\'s Summer Dress', 'Light and comfortable summer dress', 49.99, 25, 1),
('Men\'s Casual Shirt', 'Cotton casual shirt for everyday wear', 29.99, 30, 2),
('Leather Handbag', 'Premium leather handbag', 89.99, 15, 3);
