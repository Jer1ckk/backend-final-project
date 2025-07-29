require("dotenv").config();

const { sequelize } = require("../config/database");
const { User, Order, OrderItem, Payment, Cart, UserFavorite, Review } = require("../models");

const verifyAuthStatus = async () => {
  try {
    console.log("🔍 Verifying authentication system status...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Get counts for all user-related tables
    const counts = {
      users: await User.count(),
      orders: await Order.count(),
      orderItems: await OrderItem.count(),
      payments: await Payment.count(),
      cartItems: await Cart.count(),
      favorites: await UserFavorite.count(),
      reviews: await Review.count(),
    };

    // Get admin user details
    const adminUser = await User.findOne({
      where: { email: "admin@stylestore.com" }
    });

    // Get all users for verification
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt']
    });

    console.log(`
📊 AUTHENTICATION SYSTEM STATUS:

🗃️ DATABASE COUNTS:
👥 Users: ${counts.users}
📦 Orders: ${counts.orders}
🛍️ Order Items: ${counts.orderItems}
💳 Payments: ${counts.payments}
🛒 Cart Items: ${counts.cartItems}
❤️ Favorites: ${counts.favorites}
⭐ Reviews: ${counts.reviews}

👤 ADMIN USER STATUS:
${adminUser ? `✅ Admin exists: ${adminUser.name} (${adminUser.email})` : '❌ Admin user not found'}
${adminUser ? `   Role: ${adminUser.role}` : ''}
${adminUser ? `   Active: ${adminUser.isActive}` : ''}
${adminUser ? `   ID: ${adminUser.id}` : ''}

👥 ALL USERS IN SYSTEM:
${allUsers.length === 0 ? '   No users found' : ''}
${allUsers.map(user => 
  `   ID: ${user.id} | ${user.name} | ${user.email} | ${user.role} | Active: ${user.isActive}`
).join('\n')}

🔐 AUTHENTICATION STATUS:
${counts.users === 1 && adminUser ? '✅' : '❌'} Clean user database
${counts.orders === 0 ? '✅' : '❌'} No existing orders
${counts.cartItems === 0 ? '✅' : '❌'} No cart items
${counts.favorites === 0 ? '✅' : '❌'} No favorites
${counts.payments === 0 ? '✅' : '❌'} No payments
${adminUser ? '✅' : '❌'} Admin user ready

🚀 SYSTEM READINESS:
${counts.users === 1 && adminUser && counts.orders === 0 ? '✅ READY' : '❌ NOT READY'} for new user registrations
${adminUser ? '✅ READY' : '❌ NOT READY'} for admin login
${counts.users <= 1 ? '✅ CLEAN' : '❌ DIRTY'} authentication state

${counts.users === 1 && adminUser && counts.orders === 0 ? 
'🎉 Authentication system is CLEAN and READY!' : 
'⚠️ Authentication system needs cleanup!'}
    `);

  } catch (error) {
    console.error("❌ Error verifying auth status:", error);
    throw error;
  }
};

// Run verification if called directly
if (require.main === module) {
  verifyAuthStatus()
    .then(() => {
      console.log("✅ Auth status verification completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Auth status verification failed:", error);
      process.exit(1);
    });
}

module.exports = { verifyAuthStatus };
