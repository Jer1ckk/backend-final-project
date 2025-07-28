-- 🗄️ Clothing Store Database Schema
-- File: backend/database/clothing_store_schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS users;

-- ================================
-- 🏪 CATEGORIES TABLE
-- ================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id INT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ================================
-- 👕 PRODUCTS TABLE (NO IMAGE PATHS)
-- ================================
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Pricing
  original_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NULL,
  discount_percentage INT DEFAULT 0,
  
  -- Product Details
  colors JSON, -- ["red", "blue", "white"]
  sizes JSON,  -- ["XS", "S", "M", "L", "XL"]
  material VARCHAR(100),
  brand VARCHAR(100),
  tags JSON, -- ["casual", "summer", "cotton"]
  
  -- Inventory
  stock INT DEFAULT 0,
  min_stock_alert INT DEFAULT 5,
  
  -- Category & Organization
  category_id INT NOT NULL,
  subcategory VARCHAR(100),
  gender ENUM('men', 'women', 'unisex', 'kids') DEFAULT 'unisex',
  
  -- Status & Features
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_on_sale BOOLEAN GENERATED ALWAYS AS (sale_price IS NOT NULL AND sale_price < original_price) STORED,
  
  -- SEO & Metadata
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_category (category_id),
  INDEX idx_gender (gender),
  INDEX idx_featured (is_featured),
  INDEX idx_active (is_active),
  INDEX idx_sale (is_on_sale),
  INDEX idx_price (sale_price, original_price),
  INDEX idx_stock (stock)
);

-- ================================
-- 👤 USERS TABLE
-- ================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ================================
-- 🛒 ORDERS TABLE
-- ================================
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Order Status
  order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method ENUM('credit_card', 'debit_card', 'paypal', 'cod') DEFAULT 'credit_card',
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Shipping Address (JSON for flexibility)
  shipping_address JSON NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user (user_id),
  INDEX idx_status (order_status),
  INDEX idx_payment (payment_status)
);

-- ================================
-- 📦 ORDER ITEMS TABLE
-- ================================
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL, -- Price at time of purchase
  color VARCHAR(50),
  size VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- ================================
-- 💳 PAYMENTS TABLE
-- ================================
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'paypal', 'cod') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  
  -- Transaction Details
  transaction_id VARCHAR(255) UNIQUE,
  payment_gateway VARCHAR(50),
  gateway_response JSON,
  
  -- Timestamps
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_status (status),
  INDEX idx_transaction (transaction_id)
);

-- ================================
-- 🛒 CART ITEMS TABLE
-- ================================
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  color VARCHAR(50),
  size VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id, color, size),
  INDEX idx_user (user_id)
);

-- ================================
-- ❤️ USER FAVORITES TABLE
-- ================================
CREATE TABLE user_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, product_id),
  INDEX idx_user (user_id),
  INDEX idx_product (product_id)
);

-- ================================
-- ⭐ PRODUCT REVIEWS TABLE
-- ================================
CREATE TABLE product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT NULL, -- Reference to verified purchase
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_user (user_id),
  INDEX idx_rating (rating)
);

-- ================================
-- 📊 SAMPLE DATA INSERTION
-- ================================

-- Insert Categories
INSERT INTO categories (name, slug, description) VALUES
('Women', 'women', 'Women\'s clothing and accessories'),
('Men', 'men', 'Men\'s clothing and accessories'),
('Accessories', 'accessories', 'Fashion accessories for all');

INSERT INTO categories (name, slug, parent_id, description) VALUES
('T-Shirts', 't-shirts', 1, 'Women\'s T-Shirts'),
('Shirts', 'shirts', 1, 'Women\'s Shirts'),
('Dresses', 'dresses', 1, 'Women\'s Dresses'),
('Jeans', 'jeans', 1, 'Women\'s Jeans'),
('Jackets', 'jackets', 1, 'Women\'s Jackets'),
('Men Shirts', 'men-shirts', 2, 'Men\'s Shirts'),
('Men Jeans', 'men-jeans', 2, 'Men\'s Jeans'),
('Bags', 'bags', 3, 'Fashion Bags'),
('Belts', 'belts', 3, 'Fashion Belts');

-- Insert Sample Products (NO IMAGE PATHS - Images handled in frontend)
INSERT INTO products (
  name, description, sku, slug, original_price, sale_price, discount_percentage,
  colors, sizes, material, brand, tags, stock, category_id, subcategory, gender, is_featured
) VALUES
-- Women's T-Shirts
(
  'Regular Fitted Crop T-Shirt', 
  'A comfortable and stylish fitted crop t-shirt perfect for casual wear.',
  'WTS001', 'regular-fitted-crop-t-shirt', 39.99, 27.99, 30,
  '["white", "red"]', '["XS", "S", "M", "L", "XL"]',
  'Cotton Blend', 'StyleStore', '["casual", "crop", "fitted"]',
  50, 4, 't-shirt', 'women', true
),
(
  'Regular Crop Textured T-Shirt',
  'Textured crop t-shirt with a modern fit and comfortable feel.',
  'WTS002', 'regular-crop-textured-t-shirt', 44.99, 31.49, 30,
  '["pink"]', '["XS", "S", "M", "L", "XL"]',
  'Cotton', 'StyleStore', '["casual", "textured", "crop"]',
  35, 4, 't-shirt', 'women', false
),
(
  'Women\'s Cream Blouse',
  'Elegant cream blouse perfect for office or casual wear.',
  'WB001', 'womens-cream-blouse', 33.99, 23.99, 29,
  '["cream", "white"]', '["XS", "S", "M", "L"]',
  'Polyester Blend', 'StyleStore', '["elegant", "office", "blouse"]',
  25, 5, 'shirt', 'women', true
),

-- Women's Dresses
(
  'Floral Ruffle Dress',
  'Beautiful floral dress with ruffle details, perfect for summer.',
  'WD001', 'floral-ruffle-dress', 59.99, 17.99, 70,
  '["pink", "white"]', '["XS", "S", "M", "L", "XL"]',
  'Chiffon', 'StyleStore', '["floral", "summer", "ruffle"]',
  30, 6, 'dress', 'women', true
),
(
  'Lace Midi Dress',
  'Sophisticated lace midi dress for special occasions.',
  'WD002', 'lace-midi-dress', 64.99, 19.49, 70,
  '["red"]', '["XS", "S", "M", "L"]',
  'Lace', 'StyleStore', '["formal", "lace", "midi"]',
  20, 6, 'dress', 'women', false
),

-- Men's Shirts
(
  'Casual Cotton Shirt',
  'Comfortable casual cotton shirt for everyday wear.',
  'MS001', 'casual-cotton-shirt', 49.99, 34.99, 30,
  '["white", "blue"]', '["S", "M", "L", "XL", "XXL"]',
  'Cotton', 'StyleStore', '["casual", "cotton", "comfortable"]',
  40, 9, 'shirt', 'men', true
),

-- Accessories
(
  'Classic Leather Belt',
  'Premium leather belt with classic buckle design.',
  'AB001', 'classic-leather-belt', 29.99, 19.99, 33,
  '["black", "brown"]', '["28", "30", "32", "34", "36", "38"]',
  'Genuine Leather', 'StyleStore', '["leather", "classic", "belt"]',
  60, 12, 'belt', 'unisex', false
);

-- Create a sample admin user
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@stylestore.com', '$2b$10$example.hash.here', 'admin'),
('Test Customer', 'customer@example.com', '$2b$10$example.hash.here', 'customer');

-- ================================
-- 📊 USEFUL VIEWS FOR EASY QUERYING
-- ================================

-- View for products with calculated fields
CREATE VIEW product_details AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  CASE 
    WHEN p.sale_price IS NOT NULL AND p.sale_price < p.original_price 
    THEN p.sale_price 
    ELSE p.original_price 
  END as current_price,
  ROUND(
    CASE 
      WHEN p.sale_price IS NOT NULL AND p.sale_price < p.original_price 
      THEN ((p.original_price - p.sale_price) / p.original_price) * 100 
      ELSE 0 
    END
  ) as calculated_discount
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- View for inventory alerts
CREATE VIEW low_stock_products AS
SELECT 
  id, name, sku, stock, min_stock_alert,
  category_id, current_price
FROM product_details
WHERE stock <= min_stock_alert AND is_active = true;

-- ================================
-- 🔍 SAMPLE QUERIES FOR TESTING
-- ================================

-- Get all women's t-shirts with pricing
-- SELECT * FROM product_details WHERE gender = 'women' AND subcategory = 't-shirt';

-- Get featured products
-- SELECT * FROM product_details WHERE is_featured = true;

-- Get products on sale
-- SELECT * FROM product_details WHERE is_on_sale = true;

-- Get products by category
-- SELECT * FROM product_details WHERE category_slug = 'women';

-- Full product search with filters
-- SELECT * FROM product_details 
-- WHERE gender = 'women' 
-- AND category_slug = 'women' 
-- AND current_price BETWEEN 20 AND 50
-- ORDER BY current_price ASC;
