// Simple backend test
require('dotenv').config();

console.log('🧪 Testing backend configuration...');

try {
  // Test environment variables
  console.log('📝 Environment Variables:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  - PORT: ${process.env.PORT}`);
  console.log(`  - DB_HOST: ${process.env.DB_HOST}`);
  console.log(`  - DB_NAME: ${process.env.DB_NAME}`);
  console.log(`  - CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);

  // Test database configuration
  console.log('\n🗄️ Testing Database Configuration...');
  const { sequelize } = require('./config/database');
  console.log('✅ Database config loaded');

  // Test models
  console.log('\n🏗️ Testing Models...');
  const models = require('./models');
  console.log('✅ Models loaded');

  // Test routes one by one
  console.log('\n🛣️ Testing Routes...');
  
  try {
    require('./routes/auth');
    console.log('✅ Auth routes loaded');
  } catch (e) {
    console.log(`❌ Auth routes failed: ${e.message}`);
  }

  try {
    require('./routes/products');
    console.log('✅ Product routes loaded');
  } catch (e) {
    console.log(`❌ Product routes failed: ${e.message}`);
  }

  try {
    require('./routes/categories');
    console.log('✅ Category routes loaded');
  } catch (e) {
    console.log(`❌ Category routes failed: ${e.message}`);
  }

  try {
    require('./routes/test');
    console.log('✅ Test routes loaded');
  } catch (e) {
    console.log(`❌ Test routes failed: ${e.message}`);
  }

  console.log('\n🎉 Backend configuration test completed!');
  console.log('💡 If all tests passed, the server should start successfully.');

} catch (error) {
  console.error('❌ Backend test failed:', error.message);
  console.error('Stack:', error.stack);
}

process.exit(0);
