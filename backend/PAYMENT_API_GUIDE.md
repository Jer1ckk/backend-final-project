# Payment API Testing Guide

## 🚀 Complete Payment Processing Flow

### Step 1: User Authentication
```bash
# Register a new user
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Login to get JWT token
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response will include:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Step 2: Create Order (Add to Cart + Checkout)
```bash
# Create an order first
POST http://localhost:3001/api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "product": 1,
      "quantity": 2,
      "color": "red",
      "size": "M"
    },
    {
      "product": 2,
      "quantity": 1,
      "color": "blue",
      "size": "L"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

### Step 3: Process Payment (MAIN FEATURE)
```bash
# Process payment after user clicks "Buy"
POST http://localhost:3001/api/payments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderId": 1,
  "paymentMethod": "credit_card",
  "amount": 98.97,
  "paymentGateway": "stripe",
  "transactionId": "txn_1234567890",
  "gatewayResponse": {
    "stripe_payment_intent": "pi_1234567890",
    "status": "succeeded",
    "charge_id": "ch_1234567890"
  }
}

# Expected Response:
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "id": 1,
      "transactionId": "TXN-1738060800000-1234",
      "amount": "98.97",
      "paymentMethod": "credit_card",
      "status": "completed",
      "paidAt": "2025-01-28T10:00:00.000Z"
    },
    "order": {
      "id": 1,
      "orderNumber": "ORD-1738060800000-456",
      "status": "confirmed",
      "paymentStatus": "paid",
      "total": "98.97"
    },
    "stockUpdates": [
      {
        "productId": 1,
        "productName": "Women's Summer Dress",
        "previousStock": 25,
        "soldQuantity": 2,
        "newStock": 23
      }
    ],
    "items": [
      {
        "productName": "Women's Summer Dress",
        "quantity": 2,
        "price": "49.99",
        "color": "red",
        "size": "M"
      }
    ]
  }
}
```

### Step 4: Get Payment Details
```bash
# Get specific payment details
GET http://localhost:3001/api/payments/1
Authorization: Bearer YOUR_JWT_TOKEN

# Get user's payment history
GET http://localhost:3001/api/payments?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### Step 5: Admin Refund (Optional)
```bash
# Refund a payment (admin only)
POST http://localhost:3001/api/payments/1/refund
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "refundAmount": 98.97,
  "reason": "Customer requested refund"
}
```

## 🔍 Database Verification Queries

After processing payment, run these in MySQL Workbench:

```sql
-- Check payment was created
SELECT * FROM payments WHERE orderId = 1;

-- Check order status was updated
SELECT id, orderNumber, paymentStatus, orderStatus, total 
FROM orders WHERE id = 1;

-- Check product stock was deducted
SELECT id, name, stock FROM products WHERE id IN (1, 2);

-- View complete payment details
SELECT 
    p.id as payment_id,
    p.transactionId,
    p.amount,
    p.status as payment_status,
    p.paidAt,
    o.orderNumber,
    o.orderStatus,
    u.name as customer_name,
    u.email
FROM payments p
JOIN orders o ON p.orderId = o.id
JOIN users u ON o.userId = u.id
WHERE p.id = 1;
```

## 🎯 What Happens Step-by-Step

1. **User Authentication**: JWT token validates user identity
2. **Order Validation**: Confirms order exists and belongs to user
3. **Amount Verification**: Payment amount matches order total
4. **Stock Check**: Ensures products are still available
5. **Payment Record**: Creates payment entry in database
6. **Order Update**: Changes order status to "confirmed" and payment status to "paid"
7. **Stock Deduction**: Reduces product quantities by sold amounts
8. **Inventory Logging**: Records stock changes for audit trail
9. **Response**: Returns complete transaction details
10. **Transaction Rollback**: If any step fails, all changes are reverted

## 🛡️ Error Handling

- **Invalid Order**: Returns 404 if order not found
- **Amount Mismatch**: Returns 400 if payment amount doesn't match order
- **Insufficient Stock**: Returns 400 if products not available
- **Database Errors**: Returns 500 with transaction rollback
- **Authentication**: Returns 401 if JWT token invalid

## 📊 Debug Endpoints

```bash
# Check all payments
GET http://localhost:3001/api/debug/payments

# Check specific order
GET http://localhost:3001/api/debug/orders

# Database statistics
GET http://localhost:3001/api/debug/stats
```
