# 💳 Payment Testing Database Commands
# File: payment_database_commands.sql

-- ================================
-- 📊 SHOW ALL TABLES
-- ================================
SHOW TABLES;

-- ================================
-- 🔍 VIEW TABLE STRUCTURES
-- ================================

-- Users table structure
DESCRIBE users;

-- Products table structure  
DESCRIBE products;

-- Orders table structure
DESCRIBE orders;

-- Order Items table structure
DESCRIBE order_items;

-- Payments table structure
DESCRIBE payments;

-- ================================
-- 📋 VIEW ALL DATA IN TABLES
-- ================================

-- Show all users
SELECT * FROM users;

-- Show all products with stock
SELECT id, name, price, stock, category FROM products ORDER BY id;

-- Show all orders
SELECT * FROM orders ORDER BY createdAt DESC;

-- Show all order items
SELECT * FROM order_items ORDER BY id DESC;

-- Show all payments
SELECT * FROM payments ORDER BY createdAt DESC;

-- ================================
-- 🧪 PAYMENT TESTING QUERIES
-- ================================

-- Check recent payments with order details
SELECT 
    p.id as payment_id,
    p.transactionId,
    p.amount,
    p.status as payment_status,
    p.paymentMethod,
    p.paidAt,
    o.id as order_id,
    o.orderNumber,
    o.orderStatus,
    o.total,
    u.name as customer_name,
    u.email as customer_email
FROM payments p
JOIN orders o ON p.orderId = o.id
JOIN users u ON o.userId = u.id
ORDER BY p.createdAt DESC
LIMIT 10;

-- Check order items for recent orders
SELECT 
    oi.id,
    oi.orderId,
    o.orderNumber,
    oi.productId,
    p.name as product_name,
    oi.quantity,
    oi.price,
    oi.color,
    oi.size,
    (oi.quantity * oi.price) as item_total
FROM order_items oi
JOIN orders o ON oi.orderId = o.id
JOIN products p ON oi.productId = p.id
WHERE o.orderStatus = 'confirmed'
ORDER BY oi.id DESC;

-- Check payment status summary
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM payments 
GROUP BY status;

-- Check order status summary  
SELECT 
    orderStatus,
    paymentStatus,
    COUNT(*) as count,
    SUM(total) as total_value
FROM orders 
GROUP BY orderStatus, paymentStatus;

-- ================================
-- 📈 PAYMENT ANALYTICS
-- ================================

-- Daily payment summary
SELECT 
    DATE(paidAt) as payment_date,
    COUNT(*) as payments_count,
    SUM(amount) as daily_revenue
FROM payments 
WHERE status = 'completed' 
    AND paidAt IS NOT NULL
GROUP BY DATE(paidAt)
ORDER BY payment_date DESC;

-- Product sales summary
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock,
    COUNT(oi.id) as times_sold,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.price) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.productId
LEFT JOIN orders o ON oi.orderId = o.id
WHERE o.paymentStatus = 'paid'
GROUP BY p.id, p.name, p.price, p.stock
ORDER BY total_revenue DESC;

-- Customer purchase summary
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT p.id) as total_payments,
    COALESCE(SUM(p.amount), 0) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.userId
LEFT JOIN payments p ON o.id = p.orderId AND p.status = 'completed'
GROUP BY u.id, u.name, u.email
HAVING total_orders > 0
ORDER BY total_spent DESC;

-- ================================
-- 🔍 SPECIFIC PAYMENT VERIFICATION
-- ================================

-- Check specific order payment status
-- Replace ORDER_ID with actual order ID
SELECT 
    o.id as order_id,
    o.orderNumber,
    o.orderStatus,
    o.paymentStatus,
    o.total,
    p.id as payment_id,
    p.transactionId,
    p.amount as paid_amount,
    p.status as payment_status,
    p.paidAt,
    u.name as customer
FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
LEFT JOIN users u ON o.userId = u.id
WHERE o.id = 1; -- Replace with specific order ID

-- Check product stock changes
SELECT 
    p.id,
    p.name,
    p.stock as current_stock,
    COUNT(oi.id) as sold_count,
    SUM(oi.quantity) as total_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.productId
LEFT JOIN orders o ON oi.orderId = o.id
WHERE o.paymentStatus = 'paid'
GROUP BY p.id, p.name, p.stock
ORDER BY p.id;

-- ================================
-- 🧹 TEST DATA CLEANUP QUERIES
-- ================================

-- Find test orders
SELECT * FROM orders WHERE orderNumber LIKE 'ORD-TEST-%';

-- Find test payments  
SELECT * FROM payments WHERE transactionId LIKE 'TXN-TEST-%';

-- Count test data
SELECT 
    'Test Orders' as data_type,
    COUNT(*) as count
FROM orders 
WHERE orderNumber LIKE 'ORD-TEST-%'
UNION ALL
SELECT 
    'Test Payments' as data_type,
    COUNT(*) as count
FROM payments 
WHERE transactionId LIKE 'TXN-TEST-%';

-- ================================
-- 🛠️ MAINTENANCE QUERIES
-- ================================

-- Check for orphaned records
SELECT 'Orphaned Payments' as issue, COUNT(*) as count
FROM payments p
LEFT JOIN orders o ON p.orderId = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 'Orphaned Order Items' as issue, COUNT(*) as count
FROM order_items oi
LEFT JOIN orders o ON oi.orderId = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 'Orders without Payments' as issue, COUNT(*) as count
FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
WHERE o.paymentStatus = 'paid' AND p.id IS NULL;

-- Check data consistency
SELECT 
    'Payment-Order Amount Mismatch' as issue,
    COUNT(*) as count
FROM payments p
JOIN orders o ON p.orderId = o.id
WHERE ABS(p.amount - o.total) > 0.01;

-- ================================
-- 📊 QUICK STATUS CHECK
-- ================================

-- Overall system status
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM payments) as total_payments,
    (SELECT COUNT(*) FROM orders WHERE paymentStatus = 'paid') as paid_orders,
    (SELECT COUNT(*) FROM orders WHERE orderStatus = 'pending') as pending_orders,
    (SELECT ROUND(SUM(amount), 2) FROM payments WHERE status = 'completed') as total_revenue;
