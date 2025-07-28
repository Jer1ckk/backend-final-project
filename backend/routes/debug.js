// Add this route to your backend for development purposes only
// File: backend/routes/debug.js (CREATE THIS FILE)

const express = require('express');
const { User, Product, Order, OrderItem } = require('../models');
const { sequelize } = require('../config/database');
const router = express.Router();

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      message: 'Database connection successful',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// GET all users (for development/debugging only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'], // Exclude password
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all orders with items
router.get('/orders', async (req, res) => {
  try {
    // First get orders without complex associations
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      message: 'Orders retrieved successfully',
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET order items separately
router.get('/order-items', async (req, res) => {
  try {
    // First test database connection
    await sequelize.authenticate();
    
    const orderItems = await OrderItem.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50 // Limit results to avoid timeout
    });
    
    res.json({
      message: 'Order items retrieved successfully',
      count: orderItems.length,
      orderItems: orderItems
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      details: 'Database connection or query failed'
    });
  }
});

// GET order statistics
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.count();
    const adminCount = await User.count({ where: { role: 'admin' } });
    const customerCount = await User.count({ where: { role: 'customer' } });
    
    const orderCount = await Order.count();
    const paidOrders = await Order.count({ where: { paymentStatus: 'paid' } });
    const pendingOrders = await Order.count({ where: { paymentStatus: 'pending' } });
    
    // Calculate total revenue
    const paidOrdersData = await Order.findAll({
      where: { paymentStatus: 'paid' },
      attributes: ['total']
    });
    
    const totalRevenue = paidOrdersData.reduce((sum, order) => {
      return sum + parseFloat(order.total);
    }, 0);
    
    res.json({
      message: 'Database statistics',
      stats: {
        users: {
          total: userCount,
          admins: adminCount,
          customers: customerCount
        },
        orders: {
          total: orderCount,
          paid: paidOrders,
          pending: pendingOrders
        },
        revenue: {
          total: totalRevenue.toFixed(2),
          currency: 'USD'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Force database sync and table creation
router.get('/setup-database', async (req, res) => {
  try {
    // Test connection first
    await sequelize.authenticate();
    
    // Force sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    
    // Check what tables were created
    const tables = await sequelize.getQueryInterface().showAllTables();
    
    // Get count of records in each table
    const tableCounts = {};
    for (const table of tables) {
      try {
        const count = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`, {
          type: sequelize.QueryTypes.SELECT
        });
        tableCounts[table] = count[0].count;
      } catch (error) {
        tableCounts[table] = `Error: ${error.message}`;
      }
    }
    
    res.json({
      message: 'Database setup completed',
      tablesCreated: tables,
      recordCounts: tableCounts,
      connectionStatus: 'Connected successfully'
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({
      message: 'Database setup failed',
      error: error.message
    });
  }
});

// Raw SQL query endpoint
router.get('/raw-query/:query', async (req, res) => {
  try {
    const query = decodeURIComponent(req.params.query);
    
    // Only allow SELECT queries for safety
    if (!query.toLowerCase().trim().startsWith('select') && !query.toLowerCase().trim().startsWith('show')) {
      return res.status(400).json({
        message: 'Only SELECT and SHOW queries allowed',
        providedQuery: query
      });
    }
    
    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      message: 'Query executed successfully',
      query: query,
      results: results,
      count: results.length
    });
    
  } catch (error) {
    console.error('Raw query error:', error);
    res.status(500).json({
      message: 'Query failed',
      error: error.message,
      query: req.params.query
    });
  }
});
router.get('/payment-data', async (req, res) => {
  try {
    // First test database connection
    await sequelize.authenticate();
    
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    const orderItems = await OrderItem.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    // Format the response
    let formattedResponse = "";
    
    if (orders.length === 0) {
      formattedResponse = `
🛒 PAYMENT DATA RESULTS:

❌ No orders found in database yet.

To create order data:
1. Start frontend: npm run dev (in frontend folder)
2. Visit: http://localhost:5174
3. Register/Login
4. Add products to cart
5. Complete checkout process
6. Then check this URL again!
      `;
    } else {
      formattedResponse = `
💳 PAYMENT DATA RESULTS:

📦 ORDERS FOUND: ${orders.length}
📋 ORDER ITEMS FOUND: ${orderItems.length}

`;
      
      orders.forEach((order, index) => {
        formattedResponse += `
🔸 Order Record ${index + 1}:
{
  "id": ${order.id},
  "userId": ${order.userId},
  "orderNumber": "${order.orderNumber}",
  "paymentMethod": "${order.paymentMethod}",
  "paymentStatus": "${order.paymentStatus}",
  "subtotal": ${order.subtotal},
  "shippingCost": ${order.shippingCost},
  "tax": ${order.tax},
  "total": ${order.total},
  "shippingAddress": ${JSON.stringify(order.shippingAddress, null, 2)},
  "orderStatus": "${order.orderStatus}",
  "createdAt": "${order.createdAt}"
}

`;
        
        // Find items for this order
        const relatedItems = orderItems.filter(item => item.orderId === order.id);
        
        if (relatedItems.length > 0) {
          formattedResponse += `🔸 Order Items for Order ${order.id}:
[
`;
          relatedItems.forEach((item, itemIndex) => {
            formattedResponse += `  {
    "id": ${item.id},
    "orderId": ${item.orderId},
    "productId": ${item.productId},
    "quantity": ${item.quantity},
    "price": ${item.price},
    "color": "${item.color || 'N/A'}",
    "size": "${item.size || 'N/A'}"
  }${itemIndex < relatedItems.length - 1 ? ',' : ''}
`;
          });
          formattedResponse += `]

─────────────────────────────────────────

`;
        }
      });
    }
    
    res.json({
      message: "Formatted payment data retrieved",
      totalOrders: orders.length,
      totalOrderItems: orderItems.length,
      formattedData: formattedResponse,
      rawOrders: orders,
      rawOrderItems: orderItems
    });
    
  } catch (error) {
    console.error('Error fetching formatted payment data:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
