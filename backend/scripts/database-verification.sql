-- Database Verification SQL Queries
-- File: backend/scripts/database-verification.sql

-- =============================================================================
-- USER REGISTRATION & LOGIN VERIFICATION QUERIES
-- =============================================================================

-- 1. Check if a specific user exists and get their details
SELECT 
    id,
    name,
    email,
    role,
    isActive,
    createdAt,
    updatedAt,
    CASE 
        WHEN isActive = 1 THEN 'Active'
        ELSE 'Inactive'
    END as account_status
FROM users 
WHERE email = 'user@example.com';  -- Replace with actual email

-- 2. Get all users registered today
SELECT 
    id,
    name,
    email,
    role,
    createdAt
FROM users 
WHERE DATE(createdAt) = CURDATE()
ORDER BY createdAt DESC;

-- 3. Count total users by registration date
SELECT 
    DATE(createdAt) as registration_date,
    COUNT(*) as users_registered
FROM users 
GROUP BY DATE(createdAt)
ORDER BY registration_date DESC
LIMIT 10;

-- 4. Verify user authentication data integrity
SELECT 
    u.id,
    u.name,
    u.email,
    u.password IS NOT NULL as has_password,
    u.role,
    u.isActive,
    u.createdAt
FROM users u
WHERE u.id = 1;  -- Replace with actual user ID

-- =============================================================================
-- ORDER & PURCHASE VERIFICATION QUERIES
-- =============================================================================

-- 5. Get complete order details with all related data
SELECT 
    o.id as order_id,
    o.orderNumber,
    o.userId,
    u.name as customer_name,
    u.email as customer_email,
    o.total as order_total,
    o.orderStatus,
    o.createdAt as order_date,
    p.id as payment_id,
    p.amount as payment_amount,
    p.paymentMethod,
    p.paymentStatus,
    p.transactionId,
    p.paymentDate,
    CASE 
        WHEN ABS(o.total - p.amount) < 0.01 THEN 'MATCH'
        ELSE 'MISMATCH'
    END as amount_verification
FROM orders o
LEFT JOIN users u ON o.userId = u.id
LEFT JOIN payments p ON o.id = p.orderId
WHERE o.id = 1  -- Replace with actual order ID
ORDER BY o.createdAt DESC;

-- 6. Get order items with product details
SELECT 
    o.orderNumber,
    oi.id as order_item_id,
    oi.quantity,
    oi.price as item_price,
    pr.name as product_name,
    pr.category as product_category,
    pr.price as current_product_price,
    (oi.quantity * oi.price) as item_total,
    CASE 
        WHEN ABS(pr.price - oi.price) < 0.01 THEN 'PRICE_MATCH'
        ELSE 'PRICE_CHANGED'
    END as price_verification
FROM orders o
JOIN orderitems oi ON o.id = oi.orderId
JOIN products pr ON oi.productId = pr.id
WHERE o.id = 1  -- Replace with actual order ID
ORDER BY oi.id;

-- 7. Verify order totals calculation
SELECT 
    o.id as order_id,
    o.orderNumber,
    o.total as recorded_total,
    SUM(oi.quantity * oi.price) as calculated_total,
    o.tax,
    o.shipping,
    (SUM(oi.quantity * oi.price) + COALESCE(o.tax, 0) + COALESCE(o.shipping, 0)) as expected_total,
    CASE 
        WHEN ABS(o.total - (SUM(oi.quantity * oi.price) + COALESCE(o.tax, 0) + COALESCE(o.shipping, 0))) < 0.01 
        THEN 'CALCULATION_CORRECT'
        ELSE 'CALCULATION_ERROR'
    END as calculation_verification
FROM orders o
JOIN orderitems oi ON o.id = oi.orderId
WHERE o.id = 1  -- Replace with actual order ID
GROUP BY o.id;

-- 8. Get recent orders for a specific user
SELECT 
    o.id,
    o.orderNumber,
    o.total,
    o.orderStatus,
    o.createdAt,
    COUNT(oi.id) as items_count,
    p.paymentStatus,
    p.paymentMethod
FROM orders o
LEFT JOIN orderitems oi ON o.id = oi.orderId
LEFT JOIN payments p ON o.id = p.orderId
WHERE o.userId = 1  -- Replace with actual user ID
GROUP BY o.id
ORDER BY o.createdAt DESC
LIMIT 10;

-- 9. Check for orphaned records (data integrity issues)
-- Orders without payments
SELECT 
    o.id,
    o.orderNumber,
    o.total,
    o.orderStatus,
    o.createdAt,
    'NO_PAYMENT' as issue
FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
WHERE p.id IS NULL;

-- Order items without valid products
SELECT 
    oi.id as order_item_id,
    oi.orderId,
    oi.productId,
    'INVALID_PRODUCT' as issue
FROM orderitems oi
LEFT JOIN products pr ON oi.productId = pr.id
WHERE pr.id IS NULL;

-- 10. Payment verification and statistics
SELECT 
    p.paymentStatus,
    COUNT(*) as payment_count,
    SUM(p.amount) as total_amount,
    AVG(p.amount) as average_amount,
    MIN(p.amount) as min_amount,
    MAX(p.amount) as max_amount
FROM payments p
GROUP BY p.paymentStatus
ORDER BY total_amount DESC;

-- =============================================================================
-- COMPREHENSIVE DATA VERIFICATION SUMMARY
-- =============================================================================

-- 11. Get user activity summary
SELECT 
    u.id,
    u.name,
    u.email,
    u.createdAt as registration_date,
    COUNT(o.id) as total_orders,
    SUM(o.total) as total_spent,
    COUNT(CASE WHEN o.orderStatus = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.orderStatus = 'pending' THEN 1 END) as pending_orders,
    MAX(o.createdAt) as last_order_date,
    DATEDIFF(NOW(), u.createdAt) as days_since_registration
FROM users u
LEFT JOIN orders o ON u.id = o.userId
WHERE u.id = 1  -- Replace with actual user ID
GROUP BY u.id;

-- 12. Daily sales and order summary
SELECT 
    DATE(o.createdAt) as order_date,
    COUNT(o.id) as orders_count,
    SUM(o.total) as daily_revenue,
    AVG(o.total) as average_order_value,
    COUNT(DISTINCT o.userId) as unique_customers,
    COUNT(CASE WHEN p.paymentStatus = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN p.paymentStatus = 'pending' THEN 1 END) as pending_payments
FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
WHERE o.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(o.createdAt)
ORDER BY order_date DESC;

-- 13. Product sales performance
SELECT 
    pr.id,
    pr.name,
    pr.category,
    pr.price as current_price,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.price) as total_revenue,
    AVG(oi.price) as average_selling_price
FROM products pr
LEFT JOIN orderitems oi ON pr.id = oi.productId
GROUP BY pr.id
HAVING times_ordered > 0
ORDER BY total_revenue DESC
LIMIT 20;

-- =============================================================================
-- QUICK VERIFICATION CHECKS (Run these to verify your latest purchase)
-- =============================================================================

-- 14. Check latest order for current user session
SELECT 
    o.id,
    o.orderNumber,
    o.total,
    o.orderStatus,
    o.createdAt,
    p.paymentStatus,
    p.amount as payment_amount,
    COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
LEFT JOIN orderitems oi ON o.id = oi.orderId
WHERE o.userId = (
    SELECT id FROM users WHERE email = 'your-email@example.com'  -- Replace with your email
)
GROUP BY o.id
ORDER BY o.createdAt DESC
LIMIT 1;

-- 15. Verify data consistency for latest order
SELECT 
    'Order Data' as check_type,
    CASE 
        WHEN COUNT(o.id) > 0 THEN 'PASS'
        ELSE 'FAIL'
    END as result,
    'Order exists in database' as description
FROM orders o
WHERE o.id = (SELECT MAX(id) FROM orders WHERE userId = 1)  -- Replace user ID

UNION ALL

SELECT 
    'Payment Data' as check_type,
    CASE 
        WHEN COUNT(p.id) > 0 THEN 'PASS'
        ELSE 'FAIL'
    END as result,
    'Payment record exists' as description
FROM payments p
WHERE p.orderId = (SELECT MAX(id) FROM orders WHERE userId = 1)  -- Replace user ID

UNION ALL

SELECT 
    'Order Items' as check_type,
    CASE 
        WHEN COUNT(oi.id) > 0 THEN 'PASS'
        ELSE 'FAIL'
    END as result,
    'Order items exist' as description
FROM orderitems oi
WHERE oi.orderId = (SELECT MAX(id) FROM orders WHERE userId = 1);  -- Replace user ID

-- =============================================================================
-- INSTRUCTIONS FOR USE:
-- =============================================================================
/*
1. Replace placeholder values:
   - Change 'user@example.com' to actual email addresses
   - Change user ID numbers (1) to actual user IDs
   - Change order ID numbers to actual order IDs

2. Run these queries in your MySQL client:
   - MySQL Workbench
   - phpMyAdmin
   - Command line: mysql -u username -p database_name

3. Quick verification after purchase:
   - Run query #14 to check your latest order
   - Run query #15 to verify data consistency
   - Run query #11 to see your user summary

4. For debugging issues:
   - Run query #9 to check for orphaned records
   - Run query #7 to verify calculation accuracy
   - Run query #5 for complete order details

5. Regular monitoring:
   - Run query #12 for daily sales summary
   - Run query #10 for payment status overview
   - Run query #13 for product performance
*/
