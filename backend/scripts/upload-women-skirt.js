const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

const IMAGES_FOLDER = path.join(__dirname, '../upload/women-skirt');

async function uploadWomenSkirtImages() {
  console.log('🚀 Starting Women Skirt Image Upload Process...\n');

  let connection;

  try {
    // Check Cloudinary configuration
    console.log('🔧 Checking Cloudinary configuration...');
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials missing from environment variables');
      return;
    }
    console.log('✅ Cloudinary configured successfully');

    // Connect to database
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // Get image files
    const files = fs.readdirSync(IMAGES_FOLDER)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .filter(file => !file.includes('Shortcut'))
      .slice(0, 20);

    console.log(`\n📂 Found ${files.length} images to upload:`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    if (files.length === 0) {
      console.log('❌ No images found in upload/women-skirt folder');
      console.log('💡 Please add your images to backend/upload/women-skirt/');
      return;
    }

    // Get products
    console.log('\n🔍 Finding women skirt products...');
    const [products] = await connection.execute(`
      SELECT p.id, p.name, p.images, c.name as category_name, sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN categories sc ON p.subcategoryId = sc.id
      WHERE sc.name = 'Women Skirt' AND p.isActive = 1
      ORDER BY p.id ASC
      LIMIT 20
    `);

    console.log(`✅ Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log('❌ No women skirt products found in database');
      console.log('💡 Make sure you have products in the "Women Skirt" subcategory');
      return;
    }

    // Upload images to Cloudinary and update products
    console.log('\n📤 Uploading images to Cloudinary and updating products...');
    
    const updatedProducts = [];

    for (let i = 0; i < Math.min(products.length, files.length); i++) {
      const product = products[i];
      const file = files[i];
      const filePath = path.join(IMAGES_FOLDER, file);

      try {
        console.log(`\n📤 Uploading ${i + 1}/${Math.min(products.length, files.length)}: ${file}...`);

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'clothing-store/women-skirt',
          public_id: `women-skirt-${file.split('.')[0]}-${Date.now()}`,
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
            { format: 'webp' }
          ]
        });

        console.log(`✅ Uploaded to Cloudinary: ${uploadResult.secure_url}`);

        // Update product in database
        const imagesJson = JSON.stringify([uploadResult.secure_url]);
        await connection.execute(
          'UPDATE products SET images = ? WHERE id = ?',
          [imagesJson, product.id]
        );

        updatedProducts.push({
          id: product.id,
          name: product.name,
          imageFile: file,
          cloudinaryUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });

        console.log(`✅ Updated product: ${product.name}`);

      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error.message);
      }
    }

    console.log('\n📊 FINAL SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Images uploaded to Cloudinary: ${updatedProducts.length}/${files.length}`);
    console.log(`✅ Products updated: ${updatedProducts.length}`);
    console.log(`📁 Cloudinary folder: clothing-store/women-skirt`);
    
    console.log('\n🔍 Updated Products:');
    updatedProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (ID: ${product.id})`);
      console.log(`      Image: ${product.imageFile}`);
      console.log(`      Cloudinary URL: ${product.cloudinaryUrl}`);
      console.log('');
    });

    console.log('🎉 Process completed successfully!');
    console.log('🌐 Your women skirt products now have Cloudinary image URLs!');
    console.log('🔍 Test by searching for "women skirt" on your website.');

  } catch (error) {
    console.error('❌ Process failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database connection failed. Please check your credentials.');
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
  uploadWomenSkirtImages();
}

module.exports = { uploadWomenSkirtImages };