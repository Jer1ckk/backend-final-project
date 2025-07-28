// Load environment variables
require('dotenv').config();

const { User, Order, OrderItem, Cart, UserFavorite, Payment } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Script to verify the user cleanup was successful
 */

const verifyCleanup = async () => {
  try {
    console.log('🔍 Verifying user cleanup results...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get all remaining users
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['role', 'DESC'], ['id', 'ASC']]
    });

    console.log('\n📊 CLEANUP VERIFICATION RESULTS:');
    console.log('=====================================');

    // Show remaining users
    console.log('\n👥 Remaining Users:');
    if (allUsers.length === 0) {
      console.log('   ⚠️  No users found in database!');
    } else {
      allUsers.forEach(user => {
        console.log(`   ${user.role.toUpperCase()}: ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    }

    // Count by role
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    const nonAdminCount = allUsers.filter(u => u.role !== 'admin').length;
    
    console.log('\n📈 User Statistics:');
    console.log(`   Total Users: ${allUsers.length}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Non-Admin Users: ${nonAdminCount}`);

    // Check related data
    console.log('\n🗂️  Related Data Check:');
    
    const favoriteCount = await UserFavorite.count();
    console.log(`   User Favorites: ${favoriteCount}`);
    
    const cartCount = await Cart.count();
    console.log(`   Cart Items: ${cartCount}`);
    
    const orderCount = await Order.count();
    console.log(`   Orders: ${orderCount}`);
    
    const orderItemCount = await OrderItem.count();
    console.log(`   Order Items: ${orderItemCount}`);
    
    const paymentCount = await Payment.count();
    console.log(`   Payments: ${paymentCount}`);

    // Verification status
    console.log('\n✅ VERIFICATION STATUS:');
    console.log('========================');
    
    if (nonAdminCount === 0) {
      console.log('✅ SUCCESS: All non-admin users have been deleted');
    } else {
      console.log(`❌ WARNING: ${nonAdminCount} non-admin users still exist`);
    }
    
    if (adminCount > 0) {
      console.log('✅ SUCCESS: Admin users are preserved');
    } else {
      console.log('⚠️  WARNING: No admin users found!');
    }

    console.log('\n🎉 Verification completed!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the verification if this script is executed directly
if (require.main === module) {
  console.log('🚀 Starting cleanup verification...');
  
  verifyCleanup()
    .then(() => {
      console.log('🏁 Verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyCleanup };
