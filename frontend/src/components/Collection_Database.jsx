// Updated Collection.jsx to fetch from database
// File: frontend/src/components/Collection.jsx (Database Integration)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/CollectionDatabase.css';

// ================================
// 🖼️ COMPLETE STATIC IMAGE IMPORTS
// ================================

// Women's Collection
import women1 from '../assets/women_shirt1.jpg';
import women2 from '../assets/women_shirt2.jpg';
import women3 from '../assets/women_shirt3.jpg';
import women4 from '../assets/women_shirt4.jpg';
import women5 from '../assets/women_shirt5.jpg';
import women6 from '../assets/women_shirt6.jpg';
import women7 from '../assets/women_shirt7.jpg';
import women8 from '../assets/women_shirt8.jpg';
import women9 from '../assets/women_shirt9.jpg';
import women10 from '../assets/women_shirt10.jpg';
import women11 from '../assets/women_shirt11.jpg';
import women12 from '../assets/women_shirt12.jpg';
import women13 from '../assets/women_jean13.jpg';
import women14 from '../assets/women_shorts14.jpg';
import women15 from '../assets/women_dress.jpg';
import women16 from '../assets/women_jean2.jpg';
import women17 from '../assets/women_jean3.jpg';
import women18 from '../assets/women_jean4.jpg';
import women19 from '../assets/women_shorts5.jpg';
import women20 from '../assets/women_skirt2.jpg';

// Men's Collection
import men1 from '../assets/men_shirt39.jpg';
import men2 from '../assets/men_shirt23.jpg';
import men3 from '../assets/men_shirt32.jpg';
import men4 from '../assets/men_jacket10.webp';
import men5 from '../assets/men_jacket19.webp';
import men6 from '../assets/men_jean2.jpg';
import men7 from '../assets/men_shirt24.jpg';
import men8 from '../assets/men_shirt10.webp';
import men9 from '../assets/men_shirt37.jpg';
import men10 from '../assets/men_shirt35.jpg';
import men11 from '../assets/men_shirt30.jpg';
import men12 from '../assets/men_shirt31.jpg';
import men13 from '../assets/men_shirt33.jpg';
import men14 from '../assets/men_trouser1.jpg';
import men15 from '../assets/men_trouser3.webp';
import men16 from '../assets/men_trouser9.webp';
import men17 from '../assets/men_jean7.jpg';
import men18 from '../assets/men_jean8.jpg';
import men19 from '../assets/men_jacket17.webp';
import men20 from '../assets/men_jacket1.jpg';

// Boys Collection
import boy1 from '../assets/boy_jean1.jpg';
import boy2 from '../assets/boy_jean2.jpg';
import boy3 from '../assets/boy_jean3.jpg';
import boy4 from '../assets/boy_jean4.jpg';
import boy5 from '../assets/boy_jean5.jpg';
import boy6 from '../assets/boy_jean6.jpg';
import boy7 from '../assets/boy_jean7.jpg';
import boy8 from '../assets/boy_jean8.jpg';
import boy9 from '../assets/boy_jean9.jpg';
import boy10 from '../assets/boy_jean10.jpg';
import boy11 from '../assets/boy_shirt1.jpg';
import boy12 from '../assets/boy_shirt2.jpg';
import boy13 from '../assets/boy_shirt3.jpg';
import boy14 from '../assets/boy_shirt4.jpg';
import boy15 from '../assets/boy_shirt5.jpg';
import boy16 from '../assets/boy_shirt6.jpg';
import boy17 from '../assets/boy_shirt7.jpg';
import boy18 from '../assets/boy_shirt8.jpg';
import boy19 from '../assets/boy_shirt9.jpg';
import boy20 from '../assets/boy_shirt10.jpg';

// Girls Collection
import girl1 from '../assets/girl_shirt1.jpg';
import girl2 from '../assets/girl_shirt2.jpg';
import girl3 from '../assets/girl_shirt3.jpg';
import girl4 from '../assets/girl_shirt4.jpg';
import girl5 from '../assets/girl_shirt5.jpg';
import girl6 from '../assets/girl_shirt6.jpg';
import girl7 from '../assets/girl_shirt7.jpg';
import girl8 from '../assets/girl_shirt8.jpg';
import girl9 from '../assets/girl_shirt9.jpg';
import girl10 from '../assets/girl_shirt10.jpg';
import girl11 from '../assets/girl_shirt11.jpg';
import girl12 from '../assets/girl_shirt12.jpg';
import girl13 from '../assets/girl_shirt13.jpg';
import girl14 from '../assets/girl_shirt14.jpg';
import girl15 from '../assets/girl_shirt15.jpg';
import girl16 from '../assets/girl_shirt16.jpg';
import girl17 from '../assets/girl_shirt17.jpg';
import girl18 from '../assets/girl_shirt18.jpg';
import girl19 from '../assets/girl_shirt19.jpg';
import girl20 from '../assets/girl_shirt20.jpg';

// Accessories Collection
import accessories1 from '../assets/bag8.jpg';
import accessories2 from '../assets/bag7.jpg';
import accessories3 from '../assets/bag3.webp';
import accessories4 from '../assets/bag9.jpg';
import accessories5 from '../assets/bag13.jpg';
import accessories6 from '../assets/hat11.jpg';
import accessories7 from '../assets/glasses17.jpg';
import accessories8 from '../assets/hat8.jpg';
import accessories9 from '../assets/hat4.webp';
import accessories10 from '../assets/hat5.webp';
import accessories11 from '../assets/watches1.webp';
import accessories12 from '../assets/watches2.webp';
import accessories13 from '../assets/watches3.webp';
import accessories14 from '../assets/watches4.webp';
import accessories15 from '../assets/watches5.webp';
import accessories16 from '../assets/glove1.webp';
import accessories17 from '../assets/glove2.webp';
import accessories18 from '../assets/glove3.jpg';
import accessories19 from '../assets/glove4.webp';
import accessories20 from '../assets/glove5.webp';
import accessories21 from '../assets/wallet1.webp';
import accessories22 from '../assets/wallet2.webp';
import accessories23 from '../assets/wallet3.jpg';
import accessories24 from '../assets/wallet4.webp';
import accessories25 from '../assets/wallet5.webp';
import accessories26 from '../assets/glasses1.webp';
import accessories27 from '../assets/glasses2.webp';
import accessories28 from '../assets/glasses3.webp';
import accessories29 from '../assets/glasses4.webp';
import accessories30 from '../assets/glasses5.webp';

// ================================
// 🗺️ COMPREHENSIVE IMAGE MAPPING
// ================================
const getAllProductImage = (product, index = 0) => {
  // Image arrays for each category
  const imageCollections = {
    women: [women1, women2, women3, women4, women5, women6, women7, women8, women9, women10, 
            women11, women12, women13, women14, women15, women16, women17, women18, women19, women20],
    men: [men1, men2, men3, men4, men5, men6, men7, men8, men9, men10,
          men11, men12, men13, men14, men15, men16, men17, men18, men19, men20],
    boys: [boy1, boy2, boy3, boy4, boy5, boy6, boy7, boy8, boy9, boy10,
           boy11, boy12, boy13, boy14, boy15, boy16, boy17, boy18, boy19, boy20],
    girls: [girl1, girl2, girl3, girl4, girl5, girl6, girl7, girl8, girl9, girl10,
            girl11, girl12, girl13, girl14, girl15, girl16, girl17, girl18, girl19, girl20],
    accessories: [accessories1, accessories2, accessories3, accessories4, accessories5, 
                  accessories6, accessories7, accessories8, accessories9, accessories10,
                  accessories11, accessories12, accessories13, accessories14, accessories15,
                  accessories16, accessories17, accessories18, accessories19, accessories20,
                  accessories21, accessories22, accessories23, accessories24, accessories25,
                  accessories26, accessories27, accessories28, accessories29, accessories30]
  };

  // Priority 1: Map by SKU (Database IDs)
  const skuImageMap = {
    // Map your database product SKUs to specific images
    'WTS001': women1,   // Women's Basic Tee
    'WB001': women3,    // Women's Cream Blouse  
    'WTS002': women2,   // Women's Textured Tee
    'MS001': men1,      // Men's Basic Tee
    'MS002': men2,      // Men's Pink Shirt
    'MS003': men3,      // Men's Cream Button-up
    'AB001': accessories21, // Accessories
    'AB002': accessories1,
  };

  if (product.sku && skuImageMap[product.sku]) {
    return skuImageMap[product.sku];
  }

  // Priority 2: Smart name-based mapping
  const name = product.name?.toLowerCase() || '';
  
  if (name.includes('cream blouse') || name.includes('cream') && name.includes('blouse')) return women3;
  if (name.includes('basic tee') || name.includes('basic') && name.includes('tee')) {
    if (product.gender === 'women') return women1;
    if (product.gender === 'men') return men1;
  }
  if (name.includes('pink shirt')) return men2;
  if (name.includes('cream button')) return men3;

  // Priority 3: Category-based with cycling for variety
  const category = product.category?.toLowerCase() || product.gender?.toLowerCase() || 'women';
  
  if (category.includes('women') || product.gender === 'women') {
    const images = imageCollections.women;
    return images[index % images.length];
  }
  
  if (category.includes('men') || product.gender === 'men') {
    const images = imageCollections.men;
    return images[index % images.length];
  }

  if (category.includes('accessories')) {
    const images = imageCollections.accessories;
    return images[index % images.length];
  }

  // Default fallback
  return imageCollections.women[index % imageCollections.women.length];
};

const Collection = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from database
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        
        // Fetch women's products from API
        const womenResponse = await apiService.get('/products', {
          params: {
            category: 'women',
            limit: 9, // Get first 9 products for collection
            featured: true // Only featured products
          }
        });

        // Fetch men's products from API  
        const menResponse = await apiService.get('/products', {
          params: {
            category: 'men',
            limit: 9,
            featured: true
          }
        });

        // Format data for collection display with static image imports
        const collectionsData = [
          {
            title: "Women's collection",
            products: womenResponse.products?.map((product, index) => ({
              id: product.id,
              name: product.name,
              color: product.colors?.[0] || 'Default',
              price: product.salePrice || product.price,
              originalPrice: product.originalPrice || product.price,
              image: getAllProductImage(product, index), // 🖼️ Static image mapping
              onSale: product.salePrice < product.originalPrice,
              colors: product.colors || [],
              sizes: product.sizes || [],
              stock: product.stock || 0,
              discount: product.discountPercentage || 0,
              category: product.category?.name || 'Women',
              gender: product.gender
            })) || []
          },
          {
            title: "Men's collection", 
            products: menResponse.products?.map((product, index) => ({
              id: product.id,
              name: product.name,
              color: product.colors?.[0] || 'Default',
              price: product.salePrice || product.price,
              originalPrice: product.originalPrice || product.price,
              image: getAllProductImage(product, index), // 🖼️ Static image mapping
              onSale: product.salePrice < product.originalPrice,
              colors: product.colors || [],
              sizes: product.sizes || [],
              stock: product.stock || 0,
              discount: product.discountPercentage || 0,
              category: product.category?.name || 'Men',
              gender: product.gender
            })) || []
          }
        ];

        setCollections(collectionsData);
        
      } catch (err) {
        console.error('Failed to fetch collections from database:', err);
        setError('Failed to load collections');
        
        // Fallback to static data if API fails
        setCollections(getStaticCollections());
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Static fallback data with comprehensive image imports
  const getStaticCollections = () => {
    return [
      {
        title: "Women's collection",
        products: [
          { 
            id: 1, 
            name: "Women's Basic Tee", 
            color: "White", 
            price: 19.99, 
            originalPrice: 29.99, 
            onSale: true,
            image: women1, // 🖼️ Static import
            colors: ["white", "red"],
            sizes: ["XS", "S", "M", "L", "XL"],
            stock: 10,
            discount: 33
          },
          { 
            id: 3, 
            name: "Women's Cream Blouse", 
            color: "Cream", 
            price: 23.99, 
            originalPrice: 33.99, 
            onSale: true,
            image: women3, // 🖼️ Static import
            colors: ["cream", "white"],
            sizes: ["XS", "S", "M", "L"],
            stock: 8,
            discount: 29
          },
          { 
            id: 2, 
            name: "Women's Textured Tee", 
            color: "Pink", 
            price: 21.99, 
            originalPrice: 31.99, 
            onSale: true,
            image: women2, // 🖼️ Static import
            colors: ["pink", "white"],
            sizes: ["XS", "S", "M", "L", "XL"],
            stock: 5,
            discount: 31
          },
          { 
            id: 4, 
            name: "Classic V-Neck", 
            color: "Beige", 
            price: 24.99, 
            originalPrice: 34.99, 
            onSale: true,
            image: women4, // 🖼️ Static import
            colors: ["beige", "white", "navy"],
            sizes: ["XS", "S", "M", "L", "XL"],
            stock: 12,
            discount: 29
          }
        ]
      },
      {
        title: "Men's collection",
        products: [
          { 
            id: 11, 
            name: "Men's Basic Tee", 
            color: "Burgundy", 
            price: 22.99, 
            originalPrice: 32.99, 
            onSale: true,
            image: men1, // 🖼️ Static import
            colors: ["burgundy", "white", "black"],
            sizes: ["S", "M", "L", "XL", "XXL"],
            stock: 15,
            discount: 30
          },
          { 
            id: 12, 
            name: "Men's Pink Shirt", 
            color: "Pink", 
            price: 24.99, 
            originalPrice: 34.99, 
            onSale: true,
            image: men2, // 🖼️ Static import  
            colors: ["pink", "white", "blue"],
            sizes: ["S", "M", "L", "XL", "XXL"],
            stock: 8,
            discount: 29
          },
          { 
            id: 13, 
            name: "Men's Cream Button-up", 
            color: "Cream", 
            price: 26.99, 
            originalPrice: 36.99, 
            onSale: true,
            image: men3, // 🖼️ Static import
            colors: ["cream", "white", "light blue"],
            sizes: ["S", "M", "L", "XL", "XXL"],
            stock: 6,
            discount: 27
          },
          { 
            id: 14, 
            name: "Men's Navy Polo", 
            color: "Navy", 
            price: 28.99, 
            originalPrice: 38.99, 
            onSale: true,
            image: men4, // 🖼️ Static import
            colors: ["navy", "white", "burgundy"],
            sizes: ["S", "M", "L", "XL"],
            stock: 9,
            discount: 26
          }
        ]
      }
    ];
  };

  const handleProductClick = (product, categoryTitle) => {
    navigate('/payment', {
      state: {
        product: {
          ...product,
          category: categoryTitle.toLowerCase().includes('women') ? 'women' : 'men'
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading collections from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h1>Our Collections</h1>
        <p>Discover our latest fashion trends and timeless classics</p>
      </div>

      {collections.map((category, index) => (
        <div key={index} className="category-section">
          <div className="category-header">
            <h2 className="category-title">{category.title}</h2>
            <span className="product-count">
              {category.products.length} {category.products.length === 1 ? 'item' : 'items'} available
            </span>
          </div>
          
          {category.products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🛍️</div>
              <h3>No products available</h3>
              <p>Check back soon for new arrivals in this category.</p>
            </div>
          ) : (
            <div className="products-grid">
              {category.products.map((product) => (
                <div 
                  key={product.id} 
                  className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
                  onClick={() => handleProductClick(product, category.title)}
                >
                  <div className="product-image-container">
                    {/* Sale Badge - exactly like your screenshot */}
                    {product.onSale && product.stock > 0 && (
                      <div className="sale-badge">
                        SALE
                      </div>
                    )}
                    
                    {/* Out of Stock Badge */}
                    {product.stock === 0 && (
                      <div className="stock-badge out-of-stock-badge">
                        OUT OF STOCK
                      </div>
                    )}
                    
                    {/* Low Stock Badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="stock-badge low-stock-badge">
                        ONLY {product.stock} LEFT
                      </div>
                    )}

                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        console.warn(`Failed to load image for ${product.name}`);
                        e.target.src = women1; // Fallback to first women's image
                      }}
                    />
                    
                    {/* Quick View Overlay */}
                    <div className="product-overlay">
                      <button className="quick-view-btn">
                        Quick View
                      </button>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <div className="price-container">
                      <span className="current-price">
                        ${product.price?.toFixed(2)}
                      </span>
                      {product.onSale && product.originalPrice > product.price && (
                        <span className="original-price">
                          ${product.originalPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="product-details">
                      {/* Color Options */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="color-options">
                          {product.colors.slice(0, 4).map((color, idx) => (
                            <div 
                              key={idx}
                              className="color-dot"
                              style={{ 
                                backgroundColor: color === 'white' ? '#f8f9fa' : color,
                                border: color === 'white' ? '1px solid #dee2e6' : 'none'
                              }}
                              title={color.charAt(0).toUpperCase() + color.slice(1)}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="more-colors">
                              +{product.colors.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Size Options Preview */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="size-info">
                          <span className="sizes-available">
                            Sizes: {product.sizes.slice(0, 3).join(', ')}
                            {product.sizes.length > 3 && '...'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Stock Status */}
                    <div className="stock-status">
                      {product.stock > 5 && (
                        <span className="in-stock">✓ In Stock</span>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="low-stock">
                          ⚠️ Only {product.stock} left
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="out-of-stock">❌ Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* Database Status Indicator */}
      <div className="database-status">
        <div className="status-indicator online">
          <span className="status-dot"></span>
          Connected to Database
        </div>
        <small>
          📊 Data from MySQL • 🖼️ Images from local assets • 🔄 Real-time sync
        </small>
      </div>
    </div>
  );
};

export default Collection;
