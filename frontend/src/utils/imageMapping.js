// 🎨 Image Mapping System for Frontend
// File: frontend/src/utils/imageMapping.js

// Import all product images (keep your existing images)
import women_shirt1 from '../assets/women_shirt1.jpg';
import women_shirt2 from '../assets/women_shirt2.jpg';
import women_shirt3 from '../assets/women_shirt3.jpg';
import women_shirt42 from '../assets/women_shirt42.jpg';
import women_dress1 from '../assets/women_dress1.webp';
import women_dress2 from '../assets/women_dress2.webp';
import men_shirt1 from '../assets/men_shirt1.jpg';
import men_shirt2 from '../assets/men_shirt2.jpg';
// ... import more images as needed

// 🗺️ Image mapping by product ID
const imageMapById = {
  1: women_shirt42,    // Regular Fitted Crop T-Shirt
  2: women_shirt2,     // Regular Crop Textured T-Shirt  
  3: women_shirt3,     // Women's Cream Blouse
  4: women_dress1,     // Floral Ruffle Dress
  5: women_dress2,     // Lace Midi Dress
  6: men_shirt1,       // Casual Cotton Shirt
  7: men_shirt2,       // Classic Leather Belt
  // Add more mappings as needed
};

// 🗺️ Image mapping by product SKU (alternative method)
const imageMapBySku = {
  'WTS001': women_shirt42,   // Regular Fitted Crop T-Shirt
  'WTS002': women_shirt2,    // Regular Crop Textured T-Shirt
  'WB001': women_shirt3,     // Women's Cream Blouse
  'WD001': women_dress1,     // Floral Ruffle Dress
  'WD002': women_dress2,     // Lace Midi Dress
  'MS001': men_shirt1,       // Casual Cotton Shirt
  'AB001': men_shirt2,       // Classic Leather Belt
  // Add more SKU mappings
};

// 🗺️ Image mapping by product name (fallback method)
const imageMapByName = {
  'Regular Fitted Crop T-Shirt': women_shirt42,
  'Regular Crop Textured T-Shirt': women_shirt2,
  'Women\'s Cream Blouse': women_shirt3,
  'Floral Ruffle Dress': women_dress1,
  'Lace Midi Dress': women_dress2,
  'Casual Cotton Shirt': men_shirt1,
  'Classic Leather Belt': men_shirt2,
  // Add more name mappings
};

// 🗺️ Category-based image arrays (for random assignment)
const imagesByCategory = {
  women: {
    't-shirt': [women_shirt1, women_shirt2, women_shirt3, women_shirt42],
    'shirt': [women_shirt1, women_shirt2, women_shirt3],
    'dress': [women_dress1, women_dress2],
    'default': [women_shirt1, women_shirt2, women_shirt3]
  },
  men: {
    'shirt': [men_shirt1, men_shirt2],
    'default': [men_shirt1, men_shirt2]
  },
  default: [women_shirt1, men_shirt1] // Fallback images
};

// 🖼️ Default/placeholder image
import placeholderImage from '../assets/placeholder-product.jpg'; // Create a placeholder

// 📸 Main function to get product image
export const getProductImage = (product) => {
  // Method 1: Try by product ID first (most reliable)
  if (product.id && imageMapById[product.id]) {
    return imageMapById[product.id];
  }

  // Method 2: Try by SKU (unique identifier)
  if (product.sku && imageMapBySku[product.sku]) {
    return imageMapBySku[product.sku];
  }

  // Method 3: Try by exact name match
  if (product.name && imageMapByName[product.name]) {
    return imageMapByName[product.name];
  }

  // Method 4: Try by category and subcategory
  if (product.gender && product.subcategory) {
    const categoryImages = imagesByCategory[product.gender];
    if (categoryImages && categoryImages[product.subcategory]) {
      const images = categoryImages[product.subcategory];
      // Use product ID to consistently pick same image
      const index = product.id ? product.id % images.length : 0;
      return images[index];
    }
  }

  // Method 5: Try by gender only
  if (product.gender && imagesByCategory[product.gender]) {
    const images = imagesByCategory[product.gender].default;
    const index = product.id ? product.id % images.length : 0;
    return images[index];
  }

  // Method 6: Use default fallback
  return placeholderImage;
};

// 🔄 Batch function to add images to products array
export const addImagesToProducts = (products) => {
  return products.map(product => ({
    ...product,
    image: getProductImage(product),
    // Keep original image field if it exists (for backward compatibility)
    originalImage: product.image
  }));
};

// 🛠️ Helper function to get multiple images for a product (for galleries)
export const getProductImages = (product, count = 1) => {
  const mainImage = getProductImage(product);
  const images = [mainImage];

  // Try to get additional images from the same category
  if (count > 1 && product.gender && product.subcategory) {
    const categoryImages = imagesByCategory[product.gender]?.[product.subcategory] 
      || imagesByCategory[product.gender]?.default 
      || imagesByCategory.default;

    for (let i = 1; i < count && i < categoryImages.length; i++) {
      const additionalIndex = (product.id + i) % categoryImages.length;
      if (categoryImages[additionalIndex] !== mainImage) {
        images.push(categoryImages[additionalIndex]);
      }
    }
  }

  return images;
};

// 🎨 Function to get color-specific images (if you have color variants)
export const getProductImageByColor = (product, color) => {
  // You can extend this to map specific colors to specific images
  const colorImageMap = {
    [product.id]: {
      'white': women_shirt1,
      'red': women_shirt2,
      'blue': women_shirt3,
      // Add color-specific mappings
    }
  };

  if (colorImageMap[product.id] && colorImageMap[product.id][color]) {
    return colorImageMap[product.id][color];
  }

  // Fallback to main product image
  return getProductImage(product);
};

// 🏷️ Export image maps for direct use
export {
  imageMapById,
  imageMapBySku,
  imageMapByName,
  imagesByCategory
};

// 📝 Usage Examples:
/*
// In your React component:
import { getProductImage, addImagesToProducts } from '../utils/imageMapping';

// For single product:
const productWithImage = {
  ...product,
  image: getProductImage(product)
};

// For array of products:
const productsWithImages = addImagesToProducts(products);

// In JSX:
<img src={getProductImage(product)} alt={product.name} />
*/
