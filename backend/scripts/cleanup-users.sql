-- ============================================================================
-- USER CLEANUP SQL SCRIPT
-- ============================================================================
-- This script will delete all non-admin users and their related data
-- ⚠️  IMPORTANT: Make sure you have a database backup before running this!
-- ============================================================================

-- First, let's see what we're working with
SELECT 
    '=== CURRENT USERS IN DATABASE ===' as info,
    NULL as id, NULL as name, NULL as email, NULL as role, NULL as created_at
UNION ALL
SELECT 
    'User Info' as info,
    id, name, email, role, createdAt as created_at
FROM users 
ORDER BY role DESC, id ASC;

-- Count users by role
SELECT 
    '=== USER COUNT BY ROLE ===' as summary,
    NULL as role, NULL as count
UNION ALL
SELECT 
    'Role Summary' as summary,
    role, COUNT(*) as count
FROM users 
GROUP BY role;

-- ============================================================================
-- PREVIEW: What will be deleted
-- ============================================================================

-- Show non-admin users that will be deleted
SELECT 
    '=== USERS TO BE DELETED ===' as info,
    NULL as id, NULL as name, NULL as email, NULL as role
UNION ALL
SELECT 
    'Non-Admin User' as info,
    id, name, email, role
FROM users 
WHERE role != 'admin'
ORDER BY id;

-- Count related data that will be deleted
SELECT 
    '=== RELATED DATA TO BE DELETED ===' as summary,
    NULL as data_type, NULL as count
UNION ALL
SELECT 
    'Summary' as summary,
    'User Favorites' as data_type, 
    COUNT(*) as count
FROM user_favorites uf
JOIN users u ON uf.userId = u.id
WHERE u.role != 'admin'
UNION ALL
SELECT 
    'Summary' as summary,
    'Cart Items' as data_type, 
    COUNT(*) as count
FROM carts c
JOIN users u ON c.userId = u.id
WHERE u.role != 'admin'
UNION ALL
SELECT 
    'Summary' as summary,
    'Orders' as data_type, 
    COUNT(*) as count
FROM orders o
JOIN users u ON o.userId = u.id
WHERE u.role != 'admin'
UNION ALL
SELECT 
    'Summary' as summary,
    'Order Items' as data_type, 
    COUNT(oi.*) as count
FROM orderitems oi
JOIN orders o ON oi.orderId = o.id
JOIN users u ON o.userId = u.id
WHERE u.role != 'admin'
UNION ALL
SELECT 
    'Summary' as summary,
    'Payments' as data_type, 
    COUNT(p.*) as count
FROM payments p
JOIN orders o ON p.orderId = o.id
JOIN users u ON o.userId = u.id
WHERE u.role != 'admin';

-- ============================================================================
-- ACTUAL DELETION COMMANDS
-- ============================================================================
-- ⚠️  UNCOMMENT THE FOLLOWING LINES TO EXECUTE THE DELETION
-- ⚠️  MAKE SURE YOU HAVE A BACKUP FIRST!
-- ============================================================================

-- Start transaction for data integrity
-- START TRANSACTION;

-- 1. Delete user favorites for non-admin users
-- DELETE uf FROM user_favorites uf
-- JOIN users u ON uf.userId = u.id
-- WHERE u.role != 'admin';

-- 2. Delete cart items for non-admin users
-- DELETE c FROM carts c
-- JOIN users u ON c.userId = u.id
-- WHERE u.role != 'admin';

-- 3. Delete order items for orders belonging to non-admin users
-- DELETE oi FROM orderitems oi
-- JOIN orders o ON oi.orderId = o.id
-- JOIN users u ON o.userId = u.id
-- WHERE u.role != 'admin';

-- 4. Delete payments for orders belonging to non-admin users
-- DELETE p FROM payments p
-- JOIN orders o ON p.orderId = o.id
-- JOIN users u ON o.userId = u.id
-- WHERE u.role != 'admin';

-- 5. Delete orders for non-admin users
-- DELETE o FROM orders o
-- JOIN users u ON o.userId = u.id
-- WHERE u.role != 'admin';

-- 6. Finally, delete non-admin users
-- DELETE FROM users 
-- WHERE role != 'admin';

-- Commit the transaction
-- COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run after deletion)
-- ============================================================================

-- Verify remaining users
-- SELECT 
--     '=== REMAINING USERS AFTER CLEANUP ===' as info,
--     NULL as id, NULL as name, NULL as email, NULL as role
-- UNION ALL
-- SELECT 
--     'Remaining User' as info,
--     id, name, email, role
-- FROM users 
-- ORDER BY role DESC, id ASC;

-- Count remaining data
-- SELECT 
--     '=== REMAINING DATA COUNT ===' as summary,
--     NULL as data_type, NULL as count
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'Total Users' as data_type, 
--     COUNT(*) as count
-- FROM users
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'Admin Users' as data_type, 
--     COUNT(*) as count
-- FROM users 
-- WHERE role = 'admin'
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'User Favorites' as data_type, 
--     COUNT(*) as count
-- FROM user_favorites
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'Cart Items' as data_type, 
--     COUNT(*) as count
-- FROM carts
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'Orders' as data_type, 
--     COUNT(*) as count
-- FROM orders
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'Order Items' as data_type, 
--     COUNT(*) as count
-- FROM orderitems
-- UNION ALL
-- SELECT 
--     'Summary' as summary,
--     'Payments' as data_type, 
--     COUNT(*) as count
-- FROM payments;

-- ============================================================================
-- INSTRUCTIONS FOR USE:
-- ============================================================================
/*
1. BACKUP YOUR DATABASE FIRST!
   mysqldump -u username -p database_name > backup_before_cleanup.sql

2. Run the preview queries first (the uncommented ones above) to see what will be deleted

3. If you're satisfied with the preview, uncomment the deletion commands and run them

4. Run the verification queries to confirm the cleanup was successful

5. Alternative: Use the Node.js script instead:
   cd backend
   node scripts/cleanup-users.js

SAFETY NOTES:
- This script preserves ALL admin users (role = 'admin')
- All related data (orders, cart items, favorites, payments) will be deleted
- The script uses transactions to ensure data integrity
- Always test on a backup/development database first
*/
