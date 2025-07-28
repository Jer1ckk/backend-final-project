// 🧪 Backend API Testing Routes (Combined Payment + API Testing)
// File: backend/routes/test.js

const express = require('express');
const { Order, OrderItem, Payment, Product, User, Category } = require('../models');
const { auth } = require('../config/auth');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const router = express.Router();

// ================================
// 🧪 API HEALTH & DATABASE TESTING
// ================================

// Test 1: Basic Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Clothing Store Backend',
    version: '1.0.0'
  });
});

// Test 2: Database Connection Test
router.get('/db-connection', async (req, res) => {
  try {
    // Try to connect to database by running a simple query
    const testConnection = await Product.findOne();
    
    res.json({
      status: 'SUCCESS',
      message: 'Database connection working perfectly',
      timestamp: new Date().toISOString(),
      database: 'MySQL via Sequelize',
      connectionTest: 'PASSED'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test 3: All Products Test
router.get('/products/all', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      include: [{
        model: Category,
        as: 'category',
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'SUCCESS',
      message: `Found ${count} total products in database`,
      data: {
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: p.salePrice || p.originalPrice || p.price,
          originalPrice: p.originalPrice,
          salePrice: p.salePrice,
          category: p.category?.name || 'Uncategorized',
          stock: p.stock,
          onSale: p.salePrice && p.salePrice < p.originalPrice,
          featured: p.isFeatured || p.featured,
          gender: p.gender,
          createdAt: p.createdAt
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
          hasNext: offset + parseInt(limit) < count,
          hasPrev: page > 1
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch products from database',
      error: error.message,
      details: error.stack
    });
  }
});

// Test 4: Category-Specific Products (Women/Men)
router.get('/products/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { limit = 10 } = req.query;

    console.log(`🔍 Searching for category: ${categoryName}`);

    // First try to find category by name
    let category = await Category.findOne({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${categoryName}%` } },
          { slug: { [Op.iLike]: `%${categoryName}%` } }
        ]
      }
    });

    let products = [];
    let searchMethod = '';

    if (category) {
      // Found category, search by categoryId
      products = await Product.findAll({
        where: { categoryId: category.id },
        include: [{ model: Category, as: 'category' }],
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']]
      });
      searchMethod = 'Found by category table';
    } else {
      // Fallback: search by gender field
      products = await Product.findAll({
        where: {
          [Op.or]: [
            { gender: { [Op.iLike]: `%${categoryName}%` } },
            { subcategory: { [Op.iLike]: `%${categoryName}%` } }
          ]
        },
        include: [{ model: Category, as: 'category' }],
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']]
      });
      searchMethod = 'Found by gender/subcategory field';
    }

    res.json({
      status: 'SUCCESS',
      message: `Found ${products.length} products for "${categoryName}"`,
      searchMethod,
      data: {
        category: {
          requested: categoryName,
          found: category ? category.name : `Products matching "${categoryName}"`,
          id: category?.id || null
        },
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: p.salePrice || p.originalPrice || p.price,
          originalPrice: p.originalPrice,
          salePrice: p.salePrice,
          category: p.category?.name || 'Uncategorized',
          gender: p.gender,
          subcategory: p.subcategory,
          stock: p.stock,
          onSale: p.salePrice && p.salePrice < p.originalPrice,
          featured: p.isFeatured || p.featured
        })),
        count: products.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: `Failed to fetch products for category "${req.params.categoryName}"`,
      error: error.message
    });
  }
});

// Test 5: Featured Products Test
router.get('/products/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { isFeatured: true },
          { featured: true }
        ]
      },
      include: [{
        model: Category,
        as: 'category',
        required: false
      }],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'SUCCESS',
      message: `Found ${products.length} featured products`,
      data: {
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: p.salePrice || p.originalPrice || p.price,
          originalPrice: p.originalPrice,
          salePrice: p.salePrice,
          category: p.category?.name || 'Uncategorized',
          gender: p.gender,
          stock: p.stock,
          featured: p.isFeatured || p.featured,
          onSale: p.salePrice && p.salePrice < p.originalPrice
        })),
        count: products.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// Test 6: Sale Products Test
router.get('/products/sale', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.findAll({
      where: {
        [Op.and]: [
          { salePrice: { [Op.not]: null } },
          { originalPrice: { [Op.not]: null } },
          sequelize.where(
            sequelize.col('salePrice'), 
            Op.lt, 
            sequelize.col('originalPrice')
          )
        ]
      },
      include: [{
        model: Category,
        as: 'category',
        required: false
      }],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'SUCCESS',
      message: `Found ${products.length} products on sale`,
      data: {
        products: products.map(p => {
          const discount = p.salePrice && p.originalPrice ? 
            Math.round((1 - p.salePrice / p.originalPrice) * 100) : 0;
          
          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.salePrice,
            originalPrice: p.originalPrice,
            salePrice: p.salePrice,
            discount: discount,
            savings: p.originalPrice - p.salePrice,
            category: p.category?.name || 'Uncategorized',
            gender: p.gender,
            stock: p.stock,
            onSale: true
          };
        }),
        count: products.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch sale products',
      error: error.message
    });
  }
});

// Test 7: Database Statistics
router.get('/database-stats', async (req, res) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalUsers,
      featuredProducts,
      saleProducts,
      outOfStock,
      womenProducts,
      menProducts
    ] = await Promise.all([
      Product.count(),
      Category.count(),
      User.count(),
      Product.count({ 
        where: {
          [Op.or]: [
            { isFeatured: true },
            { featured: true }
          ]
        }
      }),
      Product.count({
        where: {
          [Op.and]: [
            { salePrice: { [Op.not]: null } },
            { originalPrice: { [Op.not]: null } }
          ]
        }
      }),
      Product.count({ where: { stock: 0 } }),
      Product.count({ where: { gender: 'women' } }),
      Product.count({ where: { gender: 'men' } })
    ]);

    res.json({
      status: 'SUCCESS',
      message: 'Database statistics retrieved successfully',
      data: {
        products: {
          total: totalProducts,
          featured: featuredProducts,
          onSale: saleProducts,
          outOfStock: outOfStock,
          inStock: totalProducts - outOfStock,
          women: womenProducts,
          men: menProducts,
          other: totalProducts - womenProducts - menProducts
        },
        categories: totalCategories,
        users: totalUsers,
        health: {
          dataIntegrity: totalProducts > 0 ? 'Good' : 'No Products',
          categorization: totalCategories > 0 ? 'Good' : 'No Categories',
          userBase: totalUsers > 0 ? 'Active' : 'No Users'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get database statistics',
      error: error.message
    });
  }
});

// Test 8: Run All Tests (Comprehensive Test Suite)
router.get('/run-all-tests', async (req, res) => {
  const tests = [];
  let overallStatus = 'SUCCESS';
  
  try {
    console.log('🧪 Running comprehensive test suite...');

    // Test 1: Database Connection
    try {
      await Product.findOne();
      tests.push({ 
        test: 'Database Connection', 
        status: 'PASS', 
        message: 'Successfully connected to database'
      });
    } catch (error) {
      tests.push({ 
        test: 'Database Connection', 
        status: 'FAIL', 
        error: error.message 
      });
      overallStatus = 'FAILED';
    }

    // Test 2: Product Count
    try {
      const count = await Product.count();
      tests.push({ 
        test: 'Product Count', 
        status: count > 0 ? 'PASS' : 'WARN', 
        message: `Found ${count} products in database`,
        data: { count }
      });
      if (count === 0) overallStatus = 'PARTIAL';
    } catch (error) {
      tests.push({ 
        test: 'Product Count', 
        status: 'FAIL', 
        error: error.message 
      });
      overallStatus = 'FAILED';
    }

    // Test 3: Category Count
    try {
      const count = await Category.count();
      tests.push({ 
        test: 'Category Count', 
        status: count > 0 ? 'PASS' : 'WARN', 
        message: `Found ${count} categories in database`,
        data: { count }
      });
      if (count === 0) overallStatus = 'PARTIAL';
    } catch (error) {
      tests.push({ 
        test: 'Category Count', 
        status: 'FAIL', 
        error: error.message 
      });
      overallStatus = 'FAILED';
    }

    // Test 4: Sample Product Fetch
    try {
      const product = await Product.findOne({ 
        include: [{ model: Category, as: 'category' }] 
      });
      
      if (product) {
        tests.push({ 
          test: 'Sample Product Fetch', 
          status: 'PASS', 
          message: `Successfully fetched sample product: "${product.name}"`,
          data: {
            id: product.id,
            name: product.name,
            price: product.salePrice || product.originalPrice,
            category: product.category?.name || 'No Category',
            sku: product.sku
          }
        });
      } else {
        tests.push({ 
          test: 'Sample Product Fetch', 
          status: 'WARN', 
          message: 'No products found in database'
        });
        overallStatus = 'PARTIAL';
      }
    } catch (error) {
      tests.push({ 
        test: 'Sample Product Fetch', 
        status: 'FAIL', 
        error: error.message 
      });
      overallStatus = 'FAILED';
    }

    // Calculate summary
    const summary = {
      total: tests.length,
      passed: tests.filter(t => t.status === 'PASS').length,
      failed: tests.filter(t => t.status === 'FAIL').length,
      warnings: tests.filter(t => t.status === 'WARN').length
    };

    res.json({
      status: overallStatus,
      message: `Test Suite Complete: ${summary.passed} passed, ${summary.failed} failed, ${summary.warnings} warnings`,
      summary,
      tests,
      recommendations: summary.failed > 0 ? [
        'Check database connection and credentials',
        'Ensure database is seeded with products',
        'Verify Sequelize model associations'
      ] : summary.warnings > 0 ? [
        'Consider seeding database with sample products',
        'Add categories if missing'
      ] : [
        'All tests passing! API is ready for production'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Test suite execution failed',
      error: error.message,
      tests,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// 💳 PAYMENT TESTING ROUTES (ORIGINAL)
// ================================

// 🧪 Create test order for payment testing
router.post('/create-test-order', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    
    // Create test order
    const order = await Order.create({
      userId: userId,
      orderNumber: `ORD-TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shippingAddress: {
        name: "Test Customer",
        street: "123 Test Street",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "USA",
        phone: "+1234567890"
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal: 89.97,
      shippingCost: 0.00,
      tax: 8.997,
      total: 98.967
    }, { transaction });

    // Add test order items
    await OrderItem.create({
      orderId: order.id,
      productId: 1, // Assumes product ID 1 exists
      quantity: 2,
      price: 29.99,
      color: 'red',
      size: 'M'
    }, { transaction });

    await OrderItem.create({
      orderId: order.id,
      productId: 2, // Assumes product ID 2 exists
      quantity: 1,
      price: 29.99,
      color: 'blue',
      size: 'L'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Test order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create test order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test order',
      error: error.message
    });
  }
});

// 💳 Process test payment
router.post('/process-payment/:orderId', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    // Find the order
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        userId: userId,
        orderStatus: 'pending'
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product }]
        }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      orderId: order.id,
      paymentMethod: 'credit_card',
      amount: order.total,
      currency: 'USD',
      status: 'completed',
      transactionId: `TXN-TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      paymentGateway: 'test_gateway',
      gatewayResponse: {
        test: true,
        status: 'succeeded',
        charge_id: `ch_test_${Date.now()}`
      },
      paidAt: new Date()
    }, { transaction });

    // Update order status
    await order.update({
      orderStatus: 'confirmed',
      paymentStatus: 'paid'
    }, { transaction });

    // Update product stock (simulate)
    const stockUpdates = [];
    for (const item of order.items) {
      if (item.Product) {
        const newStock = Math.max(0, item.Product.stock - item.quantity);
        await item.Product.update({
          stock: newStock
        }, { transaction });

        stockUpdates.push({
          productId: item.Product.id,
          productName: item.Product.name,
          previousStock: item.Product.stock,
          soldQuantity: item.quantity,
          newStock: newStock
        });
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Test payment processed successfully',
      data: {
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt
        },
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          total: order.total
        },
        stockUpdates: stockUpdates
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Process test payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Test payment processing failed',
      error: error.message
    });
  }
});

// 📊 Get all payment data for testing
router.get('/payment-summary', auth, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          include: [
            { model: User, attributes: ['id', 'name', 'email'] },
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, attributes: ['id', 'name', 'price', 'stock'] }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      message: 'Payment summary retrieved',
      count: payments.length,
      payments: payments
    });

  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment summary',
      error: error.message
    });
  }
});

// 🗄️ Database statistics
router.get('/db-stats', async (req, res) => {
  try {
    const stats = {
      users: await User.count(),
      products: await Product.count(),
      orders: await Order.count(),
      payments: await Payment.count(),
      orderItems: await OrderItem.count(),
      pendingOrders: await Order.count({ where: { orderStatus: 'pending' } }),
      paidOrders: await Order.count({ where: { paymentStatus: 'paid' } }),
      completedPayments: await Payment.count({ where: { status: 'completed' } })
    };

    // Calculate total revenue
    const paidPayments = await Payment.findAll({
      where: { status: 'completed' },
      attributes: ['amount']
    });
    
    const totalRevenue = paidPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    res.json({
      success: true,
      message: 'Database statistics',
      stats: {
        ...stats,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Get DB stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database statistics',
      error: error.message
    });
  }
});

// 🧹 Clean test data
router.delete('/cleanup-test-data', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Delete test payments
    await Payment.destroy({
      where: {
        transactionId: {
          [sequelize.Op.like]: 'TXN-TEST-%'
        }
      },
      transaction
    });

    // Delete test orders
    await Order.destroy({
      where: {
        orderNumber: {
          [sequelize.Op.like]: 'ORD-TEST-%'
        }
      },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Test data cleaned up successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Cleanup test data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup test data',
      error: error.message
    });
  }
});

module.exports = router;
