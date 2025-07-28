const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true // External payment gateway transaction ID
  },
  paymentGateway: {
    type: DataTypes.STRING(50),
    allowNull: true // stripe, paypal, etc.
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true // Store full gateway response
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'payments',
  timestamps: true,
  hooks: {
    beforeCreate: (payment) => {
      // Generate unique transaction ID if not provided
      if (!payment.transactionId) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        payment.transactionId = `TXN-${timestamp}-${random}`;
      }
    },
    afterUpdate: (payment) => {
      // Set paidAt timestamp when status changes to completed
      if (payment.status === 'completed' && !payment.paidAt) {
        payment.paidAt = new Date();
      }
    }
  }
});

module.exports = Payment;
