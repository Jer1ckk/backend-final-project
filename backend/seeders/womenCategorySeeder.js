require("dotenv").config();

// Set seeding mode to prevent server auto-sync conflicts
process.env.SEEDING_MODE = "true";

const { sequelize } = require("../config/database");
const { Category, Product } = require("../models");

// Helper functions
const getRandomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPrice = (min, max) =>
  +(Math.random() * (max - min) + min).toFixed(2);
const getRandomDiscount = () =>
  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 11)];

// Product data arrays
const adjectives = [
  "Premium",
  "Classic",
  "Modern",
  "Vintage",
  "Elegant",
  "Casual",
  "Professional",
  "Trendy",
  "Stylish",
  "Comfortable",
  "Luxury",
  "Essential",
  "Perfect",
  "Amazing",
  "Beautiful",
  "Stunning",
  "Gorgeous",
  "Fantastic",
  "Incredible",
  "Outstanding",
  "Ultimate",
  "Superior",
  "Exclusive",
  "Designer",
  "Fashion",
  "Chic",
  "Sophisticated",
  "Contemporary",
  "Timeless",
  "Iconic",
];

const styles = [
  "Slim",
  "Regular",
  "Loose",
  "Fitted",
  "Relaxed",
  "Cropped",
  "Long",
  "Short",
  "Oversized",
  "Tailored",
  "A-line",
  "Straight",
  "Flared",
  "Wrap",
  "Bodycon",
  "Maxi",
  "Mini",
  "Midi",
  "High-waisted",
  "Low-rise",
];

const materials = [
  "Cotton",
  "Polyester",
  "Linen",
  "Silk",
  "Wool",
  "Cashmere",
  "Denim",
  "Leather",
  "Suede",
  "Viscose",
  "Rayon",
  "Spandex",
  "Modal",
  "Bamboo",
  "Canvas",
  "Chiffon",
  "Satin",
  "Velvet",
  "Tweed",
  "Jersey",
];

const colors = [
  "black",
  "white",
  "gray",
  "navy",
  "blue",
  "red",
  "pink",
  "purple",
  "green",
  "yellow",
  "orange",
  "brown",
  "beige",
  "maroon",
  "teal",
  "olive",
  "burgundy",
  "coral",
  "lavender",
  "mint",
];

const sizes = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["5", "6", "7", "8", "9", "10", "11"],
};

// Women's subcategories with their IDs from the database
const womenSubcategories = [
  { id: 2, name: "Women T-shirt", slug: "women-t-shirt", type: "clothing" },
  { id: 3, name: "Women Shirt", slug: "women-shirt", type: "clothing" },
  { id: 4, name: "Women Jacket", slug: "women-jacket", type: "clothing" },
  { id: 5, name: "Women Skirt", slug: "women-skirt", type: "clothing" },
  { id: 6, name: "Women Shorts", slug: "women-shorts", type: "clothing" },
  { id: 7, name: "Women Jeans", slug: "women-jeans", type: "clothing" },
  { id: 8, name: "Women Trouser", slug: "women-trouser", type: "clothing" },
  { id: 9, name: "Women Dress", slug: "women-dress", type: "clothing" },
  { id: 10, name: "Women Shoes", slug: "women-shoes", type: "shoes" },
];

// Generate product data for a specific subcategory
const generateProductsForSubcategory = (subcategory, startId, categoryId) => {
  const products = [];
  const baseType = subcategory.name.split(" ")[1].toLowerCase(); // e.g., 't-shirt', 'jacket', etc.

  for (let i = 1; i <= 20; i++) {
    const adjective = getRandomElement(adjectives);
    const style = getRandomElement(styles);
    const material = getRandomElement(materials);
    const originalPrice = getRandomPrice(25, 200);
    const discount = getRandomDiscount();
    const salePrice =
      discount > 0
        ? +(originalPrice * (1 - discount / 100)).toFixed(2)
        : originalPrice;

    // Generate unique colors (2-4 colors per product)
    const productColors = [];
    const numColors = getRandomNumber(2, 4);
    while (productColors.length < numColors) {
      const color = getRandomElement(colors);
      if (!productColors.includes(color)) {
        productColors.push(color);
      }
    }

    // Generate sizes based on type
    const productSizes =
      subcategory.type === "shoes"
        ? sizes.shoes.slice(0, getRandomNumber(3, 6))
        : sizes.clothing.slice(0, getRandomNumber(4, 6));

    const product = {
      id: startId + i - 1,
      name: `${adjective} ${style} ${material} ${
        baseType.charAt(0).toUpperCase() + baseType.slice(1)
      } ${i}`,
      description: `High-quality ${baseType} perfect for everyday wear. Made with premium ${material.toLowerCase()} for comfort and style.`,
      originalPrice: originalPrice.toString(),
      salePrice: salePrice.toString(),
      discount: discount,
      categoryId: categoryId, // Dynamic category ID
      subcategoryId: subcategory.id,
      images: JSON.stringify([`${subcategory.slug}${i}.jpg`]),
      colors: JSON.stringify(productColors),
      sizes: JSON.stringify(productSizes),
      stock: getRandomNumber(10, 100),
      sku: `${subcategory.slug
        .toUpperCase()
        .replace(/-/g, "")
        .substring(0, 6)}${i.toString().padStart(3, "0")}`,
      brand: "StyleStore",
      material: material,
      tags: JSON.stringify([baseType, "women", "fashion", "clothing"]),
      ratingAverage: +(Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      ratingCount: getRandomNumber(5, 100),
      isActive: true,
      isFeatured: i <= 3, // First 3 products are featured
      slug: `${adjective.toLowerCase()}-${style.toLowerCase()}-${material.toLowerCase()}-${baseType}-${i}`.replace(
        /\s+/g,
        "-"
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    products.push(product);
  }

  return products;
};

// Main seeding function
const seedWomenProducts = async () => {
  try {
    console.log("🚀 Starting Women's Category Seeding...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // First, ensure categories exist
    console.log("📂 Creating categories if they don't exist...");

    // Create Women category
    const [womenCategory] = await Category.findOrCreate({
      where: { name: "Women" },
      defaults: {
        id: 1,
        name: "Women",
        description: "Women's clothing and accessories",
        slug: "women",
        isActive: true,
      },
    });
    console.log(`✅ Women category: ID ${womenCategory.id}`);

    // Create women's subcategories
    const subcategoriesToCreate = [
      {
        id: 2,
        name: "Women T-shirt",
        slug: "women-t-shirt",
        description: "Women T-shirt in Women category",
      },
      {
        id: 3,
        name: "Women Shirt",
        slug: "women-shirt",
        description: "Women Shirt in Women category",
      },
      {
        id: 4,
        name: "Women Jacket",
        slug: "women-jacket",
        description: "Women Jacket in Women category",
      },
      {
        id: 5,
        name: "Women Skirt",
        slug: "women-skirt",
        description: "Women Skirt in Women category",
      },
      {
        id: 6,
        name: "Women Shorts",
        slug: "women-shorts",
        description: "Women Shorts in Women category",
      },
      {
        id: 7,
        name: "Women Jeans",
        slug: "women-jeans",
        description: "Women Jeans in Women category",
      },
      {
        id: 8,
        name: "Women Trouser",
        slug: "women-trouser",
        description: "Women Trouser in Women category",
      },
      {
        id: 9,
        name: "Women Dress",
        slug: "women-dress",
        description: "Women Dress in Women category",
      },
      {
        id: 10,
        name: "Women Shoes",
        slug: "women-shoes",
        description: "Women Shoes in Women category",
      },
    ];

    for (const subcat of subcategoriesToCreate) {
      await Category.findOrCreate({
        where: { name: subcat.name },
        defaults: {
          id: subcat.id,
          name: subcat.name,
          description: subcat.description,
          slug: subcat.slug,
          parentId: womenCategory.id,
          isActive: true,
        },
      });
    }
    console.log("✅ All women's subcategories created");

    // Clear existing women's products (optional - comment out if you want to keep existing)
    console.log("🗑️ Clearing existing women's products...");
    await Product.destroy({
      where: {
        categoryId: womenCategory.id,
      },
    });

    let currentId = 1000; // Start from ID 1000 to avoid conflicts

    // Generate products for each women's subcategory
    for (const subcategory of womenSubcategories) {
      console.log(`📦 Generating 20 products for ${subcategory.name}...`);

      const products = generateProductsForSubcategory(
        subcategory,
        currentId,
        womenCategory.id
      );

      // Insert products in batches
      await Product.bulkCreate(products);

      console.log(
        `✅ Created 20 products for ${subcategory.name} (IDs: ${currentId}-${
          currentId + 19
        })`
      );
      currentId += 20;
    }

    console.log("🎉 Women's category seeding completed successfully!");
    console.log(
      `📊 Total products created: ${
        womenSubcategories.length * 20
      } (180 products)`
    );

    // Verify the seeding
    const totalProducts = await Product.count({ where: { categoryId: 1 } });
    console.log(
      `✅ Verification: ${totalProducts} women's products in database`
    );
  } catch (error) {
    console.error("❌ Error seeding women's products:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seeder
if (require.main === module) {
  seedWomenProducts();
}

module.exports = { seedWomenProducts };
