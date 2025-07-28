// Backend: User Profile & Verification Routes
// File: backend/routes/userProfile.js

const express = require('express');
const { User, Order, OrderItem, Product, Payment } = require('../models');
const { auth } = require('../config/auth');
const router = express.Router();

// Get current user profile (with JWT verification)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'isActive'],
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'orderNumber', 'total', 'orderStatus', 'paymentStatus', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate user statistics
    const totalOrders = await Order.count({ where: { userId: user.id } });
    const totalSpent = await Payment.sum('amount', { where: { userId: user.id } }) || 0;

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberSince: user.createdAt,
        isActive: user.isActive,
        statistics: {
          totalOrders: totalOrders,
          totalSpent: parseFloat(totalSpent).toFixed(2),
          recentOrders: user.orders
        }
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Verify user existence in database
router.get('/verify/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to verify their own data or admins to verify any user
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt', 'isActive']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    res.json({
      success: true,
      message: 'User verified in database',
      user: user,
      databaseInfo: {
        stored: true,
        lastUpdated: user.updatedAt,
        accountStatus: user.isActive ? 'Active' : 'Inactive'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database verification failed',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user data
    await user.update({
      name: name || user.name,
      email: email || user.email
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;
