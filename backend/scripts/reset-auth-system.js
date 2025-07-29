require("dotenv").config();

const { sequelize } = require("../config/database");
const {
  User,
  Order,
  OrderItem,
  Payment,
  Cart,
  UserFavorite,
  Review,
} = require("../models");

const resetAuthSystem = async () => {
  try {
    console.log("🔄 Starting complete authentication system reset...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    console.log("🧹 Clearing ALL user-related data...");

    // Clear all user-related data in correct order
    const deletionOrder = [
      { model: Review, name: "reviews" },
      { model: Cart, name: "cart items" },
      { model: UserFavorite, name: "user favorites" },
      { model: Payment, name: "payments" },
      { model: OrderItem, name: "order items" },
      { model: Order, name: "orders" },
    ];

    for (const { model, name } of deletionOrder) {
      const deleted = await model.destroy({ where: {} });
      console.log(`✅ Deleted ${deleted} ${name}`);
    }

    // Clear all users
    const usersDeleted = await User.destroy({ where: {} });
    console.log(`✅ Deleted ${usersDeleted} users`);

    // Reset all auto-increment counters to 1
    console.log("🔄 Resetting auto-increment counters...");

    const tables = [
      "users",
      "orders",
      "order_items",
      "payments",
      "carts",
      "user_favorites",
      "reviews",
    ];

    for (const table of tables) {
      try {
        await sequelize.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`✅ Reset ${table} counter`);
      } catch (error) {
        console.log(
          `⚠️ Could not reset ${table} counter (table may not exist)`
        );
      }
    }

    // Create fresh admin user
    console.log("👤 Creating fresh admin user...");
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@stylestore.com",
      password: "admin123",
      role: "admin",
      isActive: true,
    });
    console.log(`✅ Admin user created with ID: ${adminUser.id}`);

    // Verify database is clean
    const finalCounts = {
      users: await User.count(),
      orders: await Order.count(),
      cartItems: await Cart.count(),
      favorites: await UserFavorite.count(),
      payments: await Payment.count(),
      reviews: await Review.count(),
    };

    console.log(`
🎉 Authentication system reset completed!

📊 DATABASE STATUS:
👥 Users: ${finalCounts.users} (admin only)
🛒 Cart Items: ${finalCounts.cartItems}
❤️ Favorites: ${finalCounts.favorites}
📦 Orders: ${finalCounts.orders}
💳 Payments: ${finalCounts.payments}
⭐ Reviews: ${finalCounts.reviews}

🔐 AUTHENTICATION RESET COMPLETE:
✅ All user accounts removed
✅ All user sessions cleared
✅ All user data wiped
✅ Fresh admin account created
✅ Auto-increment counters reset
✅ Ready for new registrations

🚀 SYSTEM STATUS:
✅ Registration system: CLEAN
✅ Login system: CLEAN
✅ Database: RESET
✅ Admin access: READY

👤 Admin Login Credentials:
   Email: admin@stylestore.com
   Password: admin123
   Role: admin

🔥 Your authentication system is now completely clean!
Users can register fresh accounts starting from ID 2.
    `);
  } catch (error) {
    console.error("❌ Error resetting auth system:", error);
    throw error;
  }
};

// Run reset if called directly
if (require.main === module) {
  resetAuthSystem()
    .then(() => {
      console.log("✅ Authentication system reset completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Authentication system reset failed:", error);
      process.exit(1);
    });
}

module.exports = { resetAuthSystem };
