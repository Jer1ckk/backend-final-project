require('dotenv').config();

// Set seeding mode to prevent server auto-sync conflicts
process.env.SEEDING_MODE = 'true';

const { sequelize } = require('../config/database');
const { Category, Product, User } = require('../models');
const bcrypt = require('bcryptjs');

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
};

// Random data generators
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPrice = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
const getRandomDiscount = () => [0, 10, 15, 20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 10)];

// Random data arrays
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'Mason', 'Isabella', 'James',
  'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Mia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Michael',
  'Abigail', 'Daniel', 'Emily', 'Jacob', 'Elizabeth', 'Logan', 'Mila', 'Jackson', 'Ella', 'Sebastian',
  'Grace', 'Jack', 'Victoria', 'Owen', 'Aria', 'Samuel', 'Scarlett', 'Matthew', 'Chloe', 'Joseph'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const adjectives = [
  'Premium', 'Classic', 'Modern', 'Vintage', 'Elegant', 'Casual', 'Professional', 'Trendy', 'Stylish', 'Comfortable',
  'Luxury', 'Essential', 'Perfect', 'Amazing', 'Beautiful', 'Stunning', 'Gorgeous', 'Fantastic', 'Incredible', 'Outstanding',
  'Ultimate', 'Superior', 'Exclusive', 'Designer', 'Fashion', 'Chic', 'Sophisticated', 'Contemporary', 'Timeless', 'Iconic'
];

const materials = [
  'Cotton', 'Polyester', 'Cotton Blend', 'Linen', 'Silk', 'Wool', 'Cashmere', 'Denim', 'Leather', 'Suede',
  'Viscose', 'Rayon', 'Spandex', 'Elastane', 'Nylon', 'Acrylic', 'Modal', 'Bamboo', 'Organic Cotton', 'Recycled Polyester'
];

const brands = [
  'StyleStore', 'FashionHub', 'TrendWear', 'UrbanStyle', 'ClassicMode', 'ModernLook', 'ChicWear', 'ElegantStyle',
  'CasualTrend', 'PremiumWear', 'DesignerChoice', 'FashionForward', 'StyleCentral', 'TrendyLook', 'UrbanChic'
];

const colors = [
  'Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple',
  'Brown', 'Orange', 'Beige', 'Cream', 'Maroon', 'Olive', 'Teal', 'Coral', 'Mint', 'Lavender',
  'Burgundy', 'Khaki', 'Charcoal', 'Rose', 'Sage', 'Dusty Blue', 'Blush', 'Emerald', 'Crimson', 'Ivory'
];

const sizes = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['6', '7', '8', '9', '10', '11', '12'],
  accessories: ['One Size'],
  belts: ['28', '30', '32', '34', '36', '38', '40', '42']
};

// Categories data matching frontend structure
const categoriesData = [
  {
    name: 'Women',
    description: 'Women\'s clothing and accessories',
    slug: 'women',
    isActive: true,
    subcategories: [
      { name: 'Women T-shirt', slug: 'women-t-shirt' },
      { name: 'Women Shirt', slug: 'women-shirt' },
      { name: 'Women Jacket', slug: 'women-jacket' },
      { name: 'Women Skirt', slug: 'women-skirt' },
      { name: 'Women Shorts', slug: 'women-shorts' },
      { name: 'Women Jeans', slug: 'women-jeans' },
      { name: 'Women Trouser', slug: 'women-trouser' },
      { name: 'Women Dress', slug: 'women-dress' },
      { name: 'Women Shoes', slug: 'women-shoes' }
    ]
  },
  {
    name: 'Men',
    description: 'Men\'s clothing and accessories',
    slug: 'men',
    isActive: true,
    subcategories: [
      { name: 'Men T-shirt', slug: 'men-t-shirt' },
      { name: 'Men Jeans', slug: 'men-jeans' },
      { name: 'Men Jacket', slug: 'men-jacket' },
      { name: 'Men Trouser', slug: 'men-trouser' },
      { name: 'Men Shirt', slug: 'men-shirt' },
      { name: 'Men Shoes', slug: 'men-shoes' }
    ]
  },
  {
    name: 'Girls',
    description: 'Girls\' clothing and accessories',
    slug: 'girls',
    isActive: true,
    subcategories: [
      { name: 'Girls Clothing', slug: 'girls-clothing' },
      { name: 'Girls Shoes', slug: 'girls-shoes' }
    ]
  },
  {
    name: 'Boys',
    description: 'Boys\' clothing and accessories',
    slug: 'boys',
    isActive: true,
    subcategories: [
      { name: 'Boys Clothing', slug: 'boys-clothing' },
      { name: 'Boys Shoes', slug: 'boys-shoes' }
    ]
  },
  {
    name: 'Accessories',
    description: 'Fashion accessories',
    slug: 'accessories',
    isActive: true,
    subcategories: [
      { name: 'Glasses', slug: 'glasses' },
      { name: 'Watches', slug: 'watches' },
      { name: 'Gloves', slug: 'gloves' },
      { name: 'Belt', slug: 'belt' },
      { name: 'Hat', slug: 'hat' },
      { name: 'Bag', slug: 'bag' },
      { name: 'Wallet', slug: 'wallet' }
    ]
  }
];

// Product name templates by category
const productTemplates = {
  'women-t-shirt': [
    '{adjective} Fitted Crop T-Shirt',
    '{adjective} V-Neck T-Shirt',
    '{adjective} Basic T-Shirt',
    '{adjective} Polo T-Shirt',
    '{adjective} Oversized T-Shirt',
    '{adjective} Tank Top',
    '{adjective} Long Sleeve T-Shirt',
    '{adjective} Graphic T-Shirt'
  ],
  'women-shirt': [
    '{adjective} Button-Down Shirt',
    '{adjective} Blouse',
    '{adjective} Dress Shirt',
    '{adjective} Casual Shirt',
    '{adjective} Work Shirt',
    '{adjective} Flannel Shirt'
  ],
  'women-jacket': [
    '{adjective} Denim Jacket',
    '{adjective} Blazer',
    '{adjective} Leather Jacket',
    '{adjective} Bomber Jacket',
    '{adjective} Cardigan',
    '{adjective} Trench Coat'
  ],
  'women-dress': [
    '{adjective} Maxi Dress',
    '{adjective} Mini Dress',
    '{adjective} Midi Dress',
    '{adjective} Cocktail Dress',
    '{adjective} Casual Dress',
    '{adjective} Evening Dress'
  ],
  'women-jeans': [
    '{adjective} Skinny Jeans',
    '{adjective} Straight Leg Jeans',
    '{adjective} Wide Leg Jeans',
    '{adjective} High Waist Jeans',
    '{adjective} Distressed Jeans',
    '{adjective} Bootcut Jeans'
  ],
  'men-t-shirt': [
    '{adjective} Crew Neck T-Shirt',
    '{adjective} V-Neck T-Shirt',
    '{adjective} Polo T-Shirt',
    '{adjective} Henley T-Shirt',
    '{adjective} Graphic T-Shirt',
    '{adjective} Tank Top'
  ],
  'men-shirt': [
    '{adjective} Dress Shirt',
    '{adjective} Casual Shirt',
    '{adjective} Flannel Shirt',
    '{adjective} Oxford Shirt',
    '{adjective} Polo Shirt'
  ],
  'men-jeans': [
    '{adjective} Slim Fit Jeans',
    '{adjective} Regular Fit Jeans',
    '{adjective} Straight Leg Jeans',
    '{adjective} Distressed Jeans',
    '{adjective} Dark Wash Jeans'
  ],
  'belt': [
    '{adjective} Leather Belt',
    '{adjective} Canvas Belt',
    '{adjective} Designer Belt',
    '{adjective} Casual Belt',
    '{adjective} Dress Belt'
  ],
  'bag': [
    '{adjective} Crossbody Bag',
    '{adjective} Tote Bag',
    '{adjective} Backpack',
    '{adjective} Handbag',
    '{adjective} Messenger Bag',
    '{adjective} Clutch Bag'
  ],
  'glasses': [
    '{adjective} Sunglasses',
    '{adjective} Reading Glasses',
    '{adjective} Aviator Glasses',
    '{adjective} Round Glasses',
    '{adjective} Square Glasses'
  ]
};

// Generate random product
const generateRandomProduct = (categorySlug, subcategorySlug, categoryId, subcategoryId, index) => {
  const templates = productTemplates[subcategorySlug] || ['{adjective} Product'];
  const template = getRandomElement(templates);
  const adjective = getRandomElement(adjectives);
  const productName = template.replace('{adjective}', adjective);
  
  const originalPrice = getRandomPrice(19.99, 299.99);
  const discount = getRandomDiscount();
  const salePrice = discount > 0 ? +(originalPrice * (1 - discount / 100)).toFixed(2) : null;
  
  // Select appropriate sizes based on subcategory
  let productSizes;
  if (subcategorySlug.includes('shoes')) {
    productSizes = sizes.shoes;
  } else if (subcategorySlug.includes('belt')) {
    productSizes = sizes.belts;
  } else if (subcategorySlug.includes('glasses') || subcategorySlug.includes('bag') || subcategorySlug.includes('wallet') || subcategorySlug.includes('hat')) {
    productSizes = sizes.accessories;
  } else {
    productSizes = sizes.clothing;
  }
  
  // Generate random colors (1-4 colors per product)
  const productColors = [];
  const numColors = getRandomNumber(1, 4);
  for (let i = 0; i < numColors; i++) {
    const color = getRandomElement(colors);
    if (!productColors.includes(color)) {
      productColors.push(color);
    }
  }
  
  const descriptions = [
    `${adjective} ${subcategorySlug.replace('-', ' ')} perfect for any occasion. Made with high-quality materials for comfort and durability.`,
    `Stylish and comfortable ${subcategorySlug.replace('-', ' ')} that combines fashion with functionality. Perfect addition to your wardrobe.`,
    `Premium quality ${subcategorySlug.replace('-', ' ')} designed for the modern individual. Versatile piece that goes with everything.`,
    `Essential ${subcategorySlug.replace('-', ' ')} featuring superior craftsmanship and attention to detail. A must-have for fashion enthusiasts.`,
    `Contemporary ${subcategorySlug.replace('-', ' ')} that offers both style and comfort. Perfect for everyday wear or special occasions.`
  ];
  
  return {
    name: productName,
    description: getRandomElement(descriptions),
    originalPrice: originalPrice,
    salePrice: salePrice,
    discountPercentage: discount,
    colors: JSON.stringify(productColors),
    sizes: JSON.stringify(productSizes),
    stock: getRandomNumber(10, 100),
    sku: `${categorySlug.substring(0, 1).toUpperCase()}${subcategorySlug.substring(0, 2).toUpperCase()}${String(index).padStart(3, '0')}`,
    slug: generateSlug(productName),
    brand: getRandomElement(brands),
    material: getRandomElement(materials),
    tags: JSON.stringify([
      adjective.toLowerCase(),
      subcategorySlug.replace('-', ' '),
      getRandomElement(['trendy', 'comfortable', 'stylish', 'modern', 'classic'])
    ]),
    categoryId: categoryId,
    subcategoryId: subcategoryId,
    subcategory: subcategorySlug,
    gender: categorySlug === 'women' ? 'women' : categorySlug === 'men' ? 'men' : categorySlug === 'girls' ? 'girls' : categorySlug === 'boys' ? 'boys' : 'unisex',
    isFeatured: Math.random() > 0.7, // 30% chance of being featured
    isActive: true,
    metaTitle: `${productName} - ${getRandomElement(brands)}`,
    metaDescription: `Shop ${productName} at ${getRandomElement(brands)}. ${getRandomElement(descriptions).substring(0, 150)}...`
  };
};

// Generate random users
const generateRandomUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    users.push({
      name: `${firstName} ${lastName}`,
      email: email,
      password: 'password123', // Will be hashed by model
      role: Math.random() > 0.95 ? 'admin' : 'customer', // 5% chance of admin
      isActive: Math.random() > 0.1, // 90% chance of being active
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
      updatedAt: new Date()
    });
  }
  return users;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding with exactly 300 products...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables synchronized');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@stylestore.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin user created');
    
    // Generate and create random users
    console.log('👥 Generating random users...');
    const randomUsers = generateRandomUsers(50); // Generate 50 random users
    await User.bulkCreate(randomUsers);
    console.log(`✅ Created ${randomUsers.length} random users`);
    
    // Create categories and subcategories
    console.log('📂 Creating categories and subcategories...');
    const categoryMap = new Map();
    const subcategoryMap = new Map();
    
    for (const categoryData of categoriesData) {
      const { subcategories, ...mainCategoryData } = categoryData;
      
      // Create main category
      const category = await Category.create(mainCategoryData);
      categoryMap.set(category.slug, category);
      console.log(`✅ Created category: ${category.name}`);
      
      // Create subcategories
      for (const subCategoryData of subcategories) {
        const subcategory = await Category.create({
          ...subCategoryData,
          description: `${subCategoryData.name} in ${category.name} category`,
          parentId: category.id,
          isActive: true
        });
        subcategoryMap.set(subcategory.slug, subcategory);
        console.log(`  ✅ Created subcategory: ${subcategory.name}`);
      }
    }
    
    // Generate exactly 300 products total
    console.log('🛍️ Generating exactly 300 random products...');
    const allProducts = [];
    let productIndex = 1;
    const targetProductCount = 300;
    
    // Get all subcategories
    const subcategoryArray = Array.from(subcategoryMap.entries());
    const productsPerSubcategory = Math.floor(targetProductCount / subcategoryArray.length);
    const remainingProducts = targetProductCount % subcategoryArray.length;
    
    // Generate products for each subcategory
    for (let i = 0; i < subcategoryArray.length; i++) {
      const [subcategorySlug, subcategory] = subcategoryArray[i];
      const category = categoryMap.get(subcategory.slug.split('-')[0]);
      
      // Calculate products for this subcategory
      let numProducts = productsPerSubcategory;
      if (i < remainingProducts) {
        numProducts += 1; // Distribute remaining products
      }
      
      console.log(`  📦 Generating ${numProducts} products for ${subcategory.name}...`);
      
      for (let j = 0; j < numProducts; j++) {
        const product = generateRandomProduct(
          category.slug,
          subcategorySlug,
          category.id,
          subcategory.id,
          productIndex
        );
        allProducts.push(product);
        productIndex++;
      }
    }
    
    // Create all products in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      await Product.bulkCreate(batch);
      console.log(`✅ Created products ${i + 1} to ${Math.min(i + batchSize, allProducts.length)} of ${allProducts.length}`);
    }
    
    // Get final counts
    const categoryCount = await Category.count({ where: { parentId: null } });
    const subcategoryCount = await Category.count({ where: { parentId: { [require('sequelize').Op.not]: null } } });
    const productCount = await Product.count();
    const userCount = await User.count();
    
    console.log('🎉 Database seeding completed successfully with exactly 300 products!');
    console.log(`
📊 DATA SUMMARY:
🏪 Categories: ${categoryCount}
📂 Subcategories: ${subcategoryCount}
🛍️ Products: ${productCount} (Target: 300)
👥 Users: ${userCount}
💾 Total Records: ${categoryCount + subcategoryCount + productCount + userCount}

🔥 Database now contains exactly ${productCount} products across ${subcategoryCount} subcategories!
🚀 Perfect amount of data for testing payment system!

🔗 API Endpoints to test:
   GET /api/products - All products (paginated)
   GET /api/products/featured - Featured products
   GET /api/products?category=women - Women's products
   GET /api/products?category=men - Men's products
   GET /api/categories - All categories
   
👤 Test credentials:
   Admin: admin@stylestore.com / admin123
   Random users: firstname.lastname[0-49]@example.com / password123
    `);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ 300 products seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 300 products seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
