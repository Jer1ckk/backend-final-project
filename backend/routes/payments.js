const express = require('express');
const { body } = require('express-validator');
const {
  processPayment,
  getPaymentDetails,
  getUserPayments,
  refundPayment
} = require('../controllers/paymentController');
const { auth, adminAuth } = require('../config/auth');
const router = express.Router();

// Validation middleware for payment processing
const validatePayment = [
  body('orderId')
    .isInt({ gt: 0 })
    .withMessage('Valid order ID is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'])
    .withMessage('Valid payment method is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Payment amount must be greater than 0'),
  body('paymentGateway')
    .optional()
    .isString()
    .withMessage('Payment gateway must be a string'),
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string')
];

// Validation for refund
const validateRefund = [
  body('refundAmount')
    .isFloat({ gt: 0 })
    .withMessage('Refund amount must be greater than 0'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
];

// @route   POST /api/payments
// @desc    Process payment after user clicks "Buy"
// @access  Private (JWT required)
router.post('/', auth, validatePayment, processPayment);

// @route   GET /api/payments/:paymentId
// @desc    Get specific payment details
// @access  Private (JWT required)
router.get('/:paymentId', auth, getPaymentDetails);

// @route   GET /api/payments
// @desc    Get user's payment history
// @access  Private (JWT required)
router.get('/', auth, getUserPayments);

// @route   POST /api/payments/:paymentId/refund
// @desc    Refund a payment (Admin only)
// @access  Private (Admin JWT required)
router.post('/:paymentId/refund', auth, adminAuth, validateRefund, refundPayment);

module.exports = router;
