require("dotenv").config();

const { sequelize } = require("../config/database");
const { User, Order, OrderItem, Payment, CartItem, UserFavorite } = require("../models");

const clearAuthDatabase = async () => {
  try {
    console.log("🧹 Starting database cleanup for authentication...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Clear user-related data in correct order (respecting foreign key constraints)
    console.log("🗑️ Clearing user-related data...");

    // 1. Clear cart items first
    const cartItemsDeleted = await CartItem.destroy({ where: {} });
    console.log(`✅ Deleted ${cartItemsDeleted} cart items`);

    // 2. Clear user favorites
    const favoritesDeleted = await UserFavorite.destroy({ where: {} });
    console.log(`✅ Deleted ${favoritesDeleted} user favorites`);

    // 3. Clear payments
    const paymentsDeleted = await Payment.destroy({ where: {} });
    console.log(`✅ Deleted ${paymentsDeleted} payments`);

    // 4. Clear order items
    const orderItemsDeleted = await OrderItem.destroy({ where: {} });
    console.log(`✅ Deleted ${orderItemsDeleted} order items`);

    // 5. Clear orders
    const ordersDeleted = await Order.destroy({ where: {} });
    console.log(`✅ Deleted ${ordersDeleted} orders`);

    // 6. Finally clear users (except admin)
    const usersDeleted = await User.destroy({
      where: {
        email: {
          [require("sequelize").Op.ne]: "admin@stylestore.com"
        }
      }
    });
    console.log(`✅ Deleted ${usersDeleted} users (kept admin)`);

    // Reset auto-increment counters
    console.log("🔄 Resetting auto-increment counters...");
    
    await sequelize.query("ALTER TABLE users AUTO_INCREMENT = 2"); // Start from 2 (admin is 1)
    await sequelize.query("ALTER TABLE orders AUTO_INCREMENT = 1");
    await sequelize.query("ALTER TABLE order_items AUTO_INCREMENT = 1");
    await sequelize.query("ALTER TABLE payments AUTO_INCREMENT = 1");
    await sequelize.query("ALTER TABLE cart_items AUTO_INCREMENT = 1");
    await sequelize.query("ALTER TABLE user_favorites AUTO_INCREMENT = 1");
    
    console.log("✅ Auto-increment counters reset");

    // Verify admin user still exists
    const adminUser = await User.findOne({
      where: { email: "admin@stylestore.com" }
    });

    if (adminUser) {
      console.log(`✅ Admin user preserved: ${adminUser.name} (${adminUser.email})`);
    } else {
      // Create admin user if it doesn't exist
      const newAdmin = await User.create({
        name: "Admin User",
        email: "admin@stylestore.com",
        password: "admin123",
        role: "admin",
        isActive: true,
      });
      console.log(`✅ Admin user created: ${newAdmin.name} (${newAdmin.email})`);
    }

    // Get final counts
    const userCount = await User.count();
    const orderCount = await Order.count();
    const cartCount = await CartItem.count();
    const favoriteCount = await UserFavorite.count();
    const paymentCount = await Payment.count();

    console.log(`
🎉 Database cleanup completed successfully!

📊 FINAL STATUS:
👥 Users: ${userCount} (admin only)
🛒 Cart Items: ${cartCount}
❤️ Favorites: ${favoriteCount}
📦 Orders: ${orderCount}
💳 Payments: ${paymentCount}

🔐 AUTHENTICATION STATUS:
✅ Clean slate for user registration
✅ Clean slate for user login
✅ Admin account preserved
✅ All user sessions cleared
✅ All user data removed

🚀 Ready for fresh user registrations and logins!

👤 Admin credentials:
   Email: admin@stylestore.com
   Password: admin123
    `);

  } catch (error) {
    console.error("❌ Error clearing auth database:", error);
    throw error;
  }
};

// Run cleanup if called directly
if (require.main === module) {
  clearAuthDatabase()
    .then(() => {
      console.log("✅ Auth database cleanup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Auth database cleanup failed:", error);
      process.exit(1);
    });
}

module.exports = { clearAuthDatabase };
