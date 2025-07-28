// Backend: Order Verification & Payment Routes
// File: backend/routes/orderVerification.js

const express = require('express');
const { Order, OrderItem, Product, Payment, User } = require('../models');
const { auth } = require('../config/auth');
const router = express.Router();

// Get user's order history with pagination
router.get('/orders/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    // Authorization check
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build where condition
    const whereCondition = { userId: parseInt(userId) };
    if (status) {
      whereCondition.orderStatus = status;
    }

    const offset = (page - 1) * limit;

    const orders = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image', 'category']
            }
          ]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'amount', 'paymentMethod', 'paymentStatus', 'paymentDate', 'transactionId']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Calculate summary statistics
    const totalSpent = await Payment.sum('amount', { 
      where: { userId: parseInt(userId) } 
    }) || 0;

    const orderStatistics = await Order.findAll({
      where: { userId: parseInt(userId) },
      attributes: [
        'orderStatus',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
      ],
      group: ['orderStatus'],
      raw: true
    });

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalOrders: orders.count,
          hasNext: offset + orders.rows.length < orders.count,
          hasPrev: page > 1
        },
        summary: {
          totalSpent: parseFloat(totalSpent).toFixed(2),
          ordersByStatus: orderStatistics.reduce((acc, stat) => {
            acc[stat.orderStatus] = parseInt(stat.count);
            return acc;
          }, {}),
          lastOrderDate: orders.rows.length > 0 ? orders.rows[0].createdAt : null
        }
      }
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get specific order details for verification
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image', 'category', 'description']
            }
          ]
        },
        {
          model: Payment,
          as: 'payment'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization check
    if (req.user.id !== order.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate order totals
    const itemsTotal = order.orderItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );

    res.json({
      success: true,
      message: 'Order details retrieved successfully',
      order: {
        ...order.toJSON(),
        calculations: {
          itemsTotal: parseFloat(itemsTotal).toFixed(2),
          tax: parseFloat(order.tax || 0).toFixed(2),
          shipping: parseFloat(order.shipping || 0).toFixed(2),
          finalTotal: parseFloat(order.total).toFixed(2)
        },
        verification: {
          dataConsistency: Math.abs(itemsTotal - parseFloat(order.total)) < 0.01,
          paymentMatch: order.payment ? 
            Math.abs(parseFloat(order.payment.amount) - parseFloat(order.total)) < 0.01 : 
            false,
          allItemsPresent: order.orderItems.every(item => item.product !== null)
        }
      }
    });

  } catch (error) {
    console.error('Order detail fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

// Verify payment status for an order
router.get('/payment/verify/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Payment,
          as: 'payment'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization check
    if (req.user.id !== order.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const verification = {
      orderExists: true,
      paymentRecord: !!order.payment,
      paymentStatus: order.payment?.paymentStatus || 'no_payment',
      paymentMethod: order.payment?.paymentMethod || 'unknown',
      transactionId: order.payment?.transactionId || null,
      amountPaid: order.payment?.amount || 0,
      orderTotal: order.total,
      amountsMatch: order.payment ? 
        Math.abs(parseFloat(order.payment.amount) - parseFloat(order.total)) < 0.01 : 
        false,
      paymentDate: order.payment?.paymentDate || null,
      databaseVerified: true,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Payment verification completed',
      verification: verification,
      recommendations: {
        dataIntegrity: verification.amountsMatch ? 'PASS' : 'FAIL',
        paymentStatus: verification.paymentRecord ? 'VERIFIED' : 'MISSING',
        nextAction: !verification.paymentRecord ? 
          'Payment record missing - check payment processor' :
          verification.paymentStatus === 'completed' ? 
            'Payment verified successfully' : 
            'Payment pending - monitor status'
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Get latest orders for dashboard
router.get('/recent/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;

    // Authorization check
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const recentOrders = await Order.findAll({
      where: { userId: parseInt(userId) },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          limit: 3, // Show only first 3 items
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image']
            }
          ]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['paymentStatus', 'paymentMethod']
        }
      ],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Recent orders retrieved successfully',
      orders: recentOrders
    });

  } catch (error) {
    console.error('Recent orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message
    });
  }
});

module.exports = router;
