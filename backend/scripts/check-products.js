const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'clothes',
  ssl: process.env.DB_SSL === 'true' ? {
    require: true,
    rejectUnauthorized: false
  } : false
};

async function checkProducts() {
  console.log('🔍 Checking Products Database...\n');

  let connection;

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');

    // Get product counts by category
    const [categoryStats] = await connection.execute(`
      SELECT 
        c.name as category_name,
        sc.name as subcategory_name,
        COUNT(p.id) as product_count,
        SUM(CASE WHEN p.images IS NOT NULL AND p.images != '[]' THEN 1 ELSE 0 END) as products_with_images
      FROM categories c
      LEFT JOIN categories sc ON sc.parentId = c.id
      LEFT JOIN products p ON p.subcategoryId = sc.id AND p.isActive = 1
      WHERE c.parentId IS NULL
      GROUP BY c.id, sc.id
      ORDER BY c.name, sc.name
    `);

    console.log('📊 PRODUCT STATISTICS BY CATEGORY:');
    console.log('═══════════════════════════════════════════════════════════════');

    let totalProducts = 0;
    let totalWithImages = 0;

    categoryStats.forEach(stat => {
      if (stat.product_count > 0) {
        console.log(`${stat.category_name} → ${stat.subcategory_name}:`);
        console.log(`   Products: ${stat.product_count}`);
        console.log(`   With Images: ${stat.products_with_images}`);
        console.log(`   Coverage: ${((stat.products_with_images / stat.product_count) * 100).toFixed(1)}%`);
        console.log('');
        
        totalProducts += stat.product_count;
        totalWithImages += stat.products_with_images;
      }
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📈 TOTAL SUMMARY:`);
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Products with Images: ${totalWithImages}`);
    console.log(`   Overall Coverage: ${((totalWithImages / totalProducts) * 100).toFixed(1)}%`);

    // Check for products without images
    const [productsWithoutImages] = await connection.execute(`
      SELECT p.id, p.name, sc.name as subcategory
      FROM products p
      LEFT JOIN categories sc ON p.subcategoryId = sc.id
      WHERE p.isActive = 1 AND (p.images IS NULL OR p.images = '[]')
      ORDER BY sc.name, p.name
      LIMIT 10
    `);

    if (productsWithoutImages.length > 0) {
      console.log('\n⚠️  PRODUCTS WITHOUT IMAGES (showing first 10):');
      console.log('═══════════════════════════════════════════════════════════════');
      productsWithoutImages.forEach(product => {
        console.log(`   ${product.subcategory}: ${product.name} (ID: ${product.id})`);
      });
    }

    console.log('\n🎉 Product check completed successfully!');

  } catch (error) {
    console.error('❌ Error checking products:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database connection failed. Please check your environment variables.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  checkProducts();
}

module.exports = { checkProducts };
