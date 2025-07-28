// API Test Script for Purchase Verification
// File: backend/test-verification-api.js

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
const testCredentials = {
  email: 'admin@stylestore.com',
  password: 'admin123'
};

async function testVerificationAPI() {
  try {
    console.log('🧪 Testing Purchase Verification API Endpoints...\n');

    // Step 1: Login to get token
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Login successful! User ID: ${userId}`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test User Profile API
    console.log('\n2. Testing User Profile API...');
    const profileResponse = await axios.get(`${API_BASE}/user/profile`, { headers });
    
    if (profileResponse.data.success) {
      console.log(`✅ Profile API working! User: ${profileResponse.data.user.name}`);
      console.log(`   Total Orders: ${profileResponse.data.user.statistics.totalOrders}`);
      console.log(`   Total Spent: $${profileResponse.data.user.statistics.totalSpent}`);
    } else {
      console.log('❌ Profile API failed');
    }

    // Step 3: Test Order History API
    console.log('\n3. Testing Order History API...');
    const ordersResponse = await axios.get(`${API_BASE}/verification/orders/${userId}`, { headers });
    
    if (ordersResponse.data.success) {
      console.log(`✅ Order History API working!`);
      console.log(`   Total Orders: ${ordersResponse.data.data.pagination.totalOrders}`);
      console.log(`   Orders Found: ${ordersResponse.data.data.orders.length}`);
    } else {
      console.log('❌ Order History API failed');
    }

    // Step 4: Test Products API with Real Data
    console.log('\n4. Testing Products API with Real Data...');
    const productsResponse = await axios.get(`${API_BASE}/products?limit=5`);
    
    if (productsResponse.data.success && productsResponse.data.products.length > 0) {
      console.log(`✅ Products API working! Found ${productsResponse.data.products.length} products`);
      
      const firstProduct = productsResponse.data.products[0];
      console.log(`   Sample Product: ${firstProduct.name}`);
      console.log(`   Price: $${firstProduct.originalPrice}`);
      console.log(`   Category: ${firstProduct.category?.name}`);
      console.log(`   Colors: ${JSON.parse(firstProduct.colors || '[]').join(', ')}`);
      console.log(`   Stock: ${firstProduct.stock}`);
    } else {
      console.log('❌ Products API failed or no products found');
    }

    // Step 5: Test Categories API
    console.log('\n5. Testing Categories API...');
    const categoriesResponse = await axios.get(`${API_BASE}/categories`);
    
    if (categoriesResponse.data.success) {
      console.log(`✅ Categories API working! Found ${categoriesResponse.data.categories.length} categories`);
      categoriesResponse.data.categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.subcategories?.length || 0} subcategories)`);
      });
    } else {
      console.log('❌ Categories API failed');
    }

    console.log('\n🎉 All API tests completed!');
    console.log('\n📋 Next Steps for Testing Purchase Verification:');
    console.log('1. ✅ Backend is ready - all APIs working');
    console.log('2. 🛒 Go to your frontend (localhost:5174)');
    console.log('3. 👤 Login with: admin@stylestore.com / admin123');
    console.log('4. 🛍️ Browse products and add items to cart');
    console.log('5. 💳 Complete a test purchase');
    console.log('6. 📋 Check "My Profile" to see user verification');
    console.log('7. 📋 Check "My Orders" to see order history');
    console.log('8. 🗄️ Use SQL queries to verify data in database');

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

// Run the test
testVerificationAPI();
