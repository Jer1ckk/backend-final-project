const { Order, OrderItem, Payment, Product, User } = require('../models');
const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');

// Process payment after user clicks "Buy"
const processPayment = async (req, res) => {
  // Start database transaction for data consistency
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const userId = req.user.id; // From JWT middleware
    const { 
      orderId, 
      paymentMethod, 
      amount,
      paymentGateway = 'manual',
      transactionId = null,
      gatewayResponse = null 
    } = req.body;

    // Step 1: Validate order exists and belongs to user
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        userId: userId,
        orderStatus: 'pending' // Only allow payment for pending orders
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

    // Step 2: Validate payment amount matches order total
    if (parseFloat(amount) !== parseFloat(order.total)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount}) does not match order total (${order.total})`
      });
    }

    // Step 3: Check product stock availability
    for (const item of order.items) {
      const product = item.Product;
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        });
      }
    }

    // Step 4: Create payment record
    const payment = await Payment.create({
      orderId: orderId,
      paymentMethod: paymentMethod,
      amount: amount,
      currency: 'USD',
      status: 'completed', // Assuming payment is successful
      transactionId: transactionId,
      paymentGateway: paymentGateway,
      gatewayResponse: gatewayResponse,
      paidAt: new Date()
    }, { transaction });

    // Step 5: Update order status to "paid"
    await order.update({
      orderStatus: 'confirmed',
      paymentStatus: 'paid'
    }, { transaction });

    // Step 6: Deduct product quantities from stock
    const stockUpdates = [];
    for (const item of order.items) {
      const product = item.Product;
      const newStock = product.stock - item.quantity;
      
      await product.update({
        stock: newStock
      }, { transaction });

      stockUpdates.push({
        productId: product.id,
        productName: product.name,
        previousStock: product.stock,
        soldQuantity: item.quantity,
        newStock: newStock
      });
    }

    // Step 7: Create inventory log (optional but recommended)
    for (const item of order.items) {
      // You could create an InventoryLog model to track stock changes
      console.log(`Stock updated: Product ${item.Product.name} - Sold: ${item.quantity}, Remaining: ${item.Product.stock - item.quantity}`);
    }

    // Commit transaction
    await transaction.commit();

    // Step 8: Return success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
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
        stockUpdates: stockUpdates,
        items: order.items.map(item => ({
          productName: item.Product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size
        }))
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error('Payment processing error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [
        {
          model: Order,
          where: { userId: userId }, // Ensure user owns this payment
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, attributes: ['id', 'name', 'images'] }]
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: payment
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's payment history
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const payments = await Payment.findAndCountAll({
      include: [
        {
          model: Order,
          where: { userId: userId },
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, attributes: ['id', 'name', 'images'] }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      success: true,
      payments: payments.rows,
      pagination: {
        page: page,
        limit: limit,
        total: payments.count,
        totalPages: Math.ceil(payments.count / limit)
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Refund payment (admin only)
const refundPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { paymentId } = req.params;
    const { refundAmount, reason } = req.body;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Order,
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product }]
            }
          ]
        }
      ],
      transaction
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    const refundAmountNum = parseFloat(refundAmount);
    if (refundAmountNum > parseFloat(payment.amount)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Update payment
    await payment.update({
      status: 'refunded',
      refundAmount: refundAmountNum,
      refundedAt: new Date(),
      failureReason: reason
    }, { transaction });

    // Update order status
    await payment.Order.update({
      orderStatus: 'cancelled',
      paymentStatus: 'refunded'
    }, { transaction });

    // Restore product stock
    for (const item of payment.Order.items) {
      const product = item.Product;
      await product.update({
        stock: product.stock + item.quantity
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      refund: {
        paymentId: payment.id,
        refundAmount: refundAmountNum,
        refundedAt: payment.refundedAt
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed'
    });
  }
};

module.exports = {
  processPayment,
  getPaymentDetails,
  getUserPayments,
  refundPayment
};
