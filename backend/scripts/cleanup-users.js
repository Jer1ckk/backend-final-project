// Load environment variables
require("dotenv").config();

const {
  User,
  Order,
  OrderItem,
  Cart,
  UserFavorite,
  Payment,
} = require("../models");
const { sequelize } = require("../config/database");

/**
 * Script to delete all users except admin users
 * This will also clean up related data (orders, cart items, favorites, etc.)
 */

const cleanupNonAdminUsers = async () => {
  try {
    console.log("🧹 Starting user cleanup process...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Start transaction for data integrity
    const transaction = await sequelize.transaction();

    try {
      // 1. First, let's see what we're working with
      const allUsers = await User.findAll({
        attributes: ["id", "name", "email", "role"],
        order: [
          ["role", "DESC"],
          ["id", "ASC"],
        ],
      });

      console.log("\n📊 Current users in database:");
      allUsers.forEach((user) => {
        console.log(
          `  ${user.role.toUpperCase()}: ${user.name} (${user.email}) - ID: ${
            user.id
          }`
        );
      });

      // 2. Identify admin and non-admin users
      const adminUsers = allUsers.filter((user) => user.role === "admin");
      const nonAdminUsers = allUsers.filter((user) => user.role !== "admin");

      console.log(
        `\n🔍 Found ${adminUsers.length} admin users and ${nonAdminUsers.length} non-admin users`
      );

      if (nonAdminUsers.length === 0) {
        console.log(
          "✅ No non-admin users to delete. Database is already clean!"
        );
        await transaction.rollback();
        return;
      }

      // 3. Get IDs of non-admin users
      const nonAdminUserIds = nonAdminUsers.map((user) => user.id);
      console.log(
        `\n🎯 Will delete users with IDs: ${nonAdminUserIds.join(", ")}`
      );

      // 4. Delete related data first (to maintain referential integrity)
      console.log("\n🗑️  Cleaning up related data...");

      // Delete user favorites
      const deletedFavorites = await UserFavorite.destroy({
        where: { userId: nonAdminUserIds },
        transaction,
      });
      console.log(`   ✅ Deleted ${deletedFavorites} user favorites`);

      // Delete cart items
      const deletedCartItems = await Cart.destroy({
        where: { userId: nonAdminUserIds },
        transaction,
      });
      console.log(`   ✅ Deleted ${deletedCartItems} cart items`);

      // Delete order items for orders belonging to non-admin users
      const ordersToDelete = await Order.findAll({
        where: { userId: nonAdminUserIds },
        attributes: ["id"],
        transaction,
      });
      const orderIdsToDelete = ordersToDelete.map((order) => order.id);

      if (orderIdsToDelete.length > 0) {
        const deletedOrderItems = await OrderItem.destroy({
          where: { orderId: orderIdsToDelete },
          transaction,
        });
        console.log(`   ✅ Deleted ${deletedOrderItems} order items`);

        // Delete payments for these orders
        const deletedPayments = await Payment.destroy({
          where: { orderId: orderIdsToDelete },
          transaction,
        });
        console.log(`   ✅ Deleted ${deletedPayments} payments`);

        // Delete orders
        const deletedOrders = await Order.destroy({
          where: { userId: nonAdminUserIds },
          transaction,
        });
        console.log(`   ✅ Deleted ${deletedOrders} orders`);
      }

      // 5. Finally, delete the non-admin users
      console.log("\n👥 Deleting non-admin users...");
      const deletedUsers = await User.destroy({
        where: {
          id: nonAdminUserIds,
          role: { [sequelize.Sequelize.Op.ne]: "admin" }, // Extra safety check
        },
        transaction,
      });

      console.log(`   ✅ Deleted ${deletedUsers} non-admin users`);

      // 6. Commit the transaction
      await transaction.commit();

      // 7. Show final results
      console.log("\n🎉 Cleanup completed successfully!");

      const remainingUsers = await User.findAll({
        attributes: ["id", "name", "email", "role"],
        order: [
          ["role", "DESC"],
          ["id", "ASC"],
        ],
      });

      console.log("\n📊 Remaining users in database:");
      if (remainingUsers.length === 0) {
        console.log("   ⚠️  No users remaining in database!");
      } else {
        remainingUsers.forEach((user) => {
          console.log(
            `   ${user.role.toUpperCase()}: ${user.name} (${
              user.email
            }) - ID: ${user.id}`
          );
        });
      }

      console.log("\n✅ User cleanup process completed successfully!");
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Error during user cleanup:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the cleanup if this script is executed directly
if (require.main === module) {
  console.log("🚀 Starting user cleanup script...");
  console.log(
    "⚠️  This will delete ALL non-admin users and their related data!"
  );
  console.log("⚠️  Make sure you have a database backup before proceeding!");
  console.log("");

  cleanupNonAdminUsers()
    .then(() => {
      console.log("🏁 Script execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script execution failed:", error.message);
      process.exit(1);
    });
}

module.exports = { cleanupNonAdminUsers };
