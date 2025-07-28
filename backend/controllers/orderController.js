const { Order, OrderItem, Product, User } = require("../models");
const { sequelize } = require("../config/database");
const { validationResult } = require("express-validator");

// Create new order
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log(
      "📦 Create Order Request Body:",
      JSON.stringify(req.body, null, 2)
    );

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation Errors:", errors.array());
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate products and calculate total
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemTotal = product.salePrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.salePrice,
        color: item.color,
        size: item.size,
      });
    }

    // Calculate shipping and tax (simple logic)
    const shippingCost = subtotal > 50 ? 0 : 1.25; // Free shipping over $50
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create the order
    const order = await Order.create(
      {
        userId: userId,
        orderNumber: orderNumber,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        tax,
        total,
      },
      { transaction }
    );

    // Create order items
    for (const itemData of orderItemsData) {
      await OrderItem.create(
        {
          orderId: order.id,
          ...itemData,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Fetch the created order with items and product details
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "images", "salePrice"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: createdOrder,
    });
  } catch (error) {
    // Only rollback if transaction is still active
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "images", "salePrice"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id: id,
        userId: req.user.id,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "images", "salePrice"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "pending" && order.orderStatus !== "confirmed") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    if (req.query.payment) {
      filter.paymentStatus = req.query.payment;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
