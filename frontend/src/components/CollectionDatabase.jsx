import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productFilters, productApi } from "../services/productApi";
import "../styles/Collection.css";

// ================================
// 🖼️ STATIC IMAGE IMPORTS (UNCHANGED)
// ================================
// Women's Shirts & Blouses
import women_shirt1 from "../assets/women_shirt1.jpg";
import women_shirt2 from "../assets/women_shirt2.jpg";
import women_shirt3 from "../assets/women_shirt3.jpg";
import women_shirt4 from "../assets/women_shirt4.jpg";
import women_shirt5 from "../assets/women_shirt5.jpg";

// Men's Shirts
import boy_shirt1 from "../assets/boy_shirt1.jpg";
import boy_shirt2 from "../assets/boy_shirt2.jpg";
import boy_shirt3 from "../assets/boy_shirt3.jpg";

// Accessories
import bag1 from "../assets/bag1.webp";
import bag2 from "../assets/bag2.webp";
import belt1 from "../assets/belt1.webp";
import belt2 from "../assets/belt2.webp";

// ================================
// 🗺️ IMAGE MAPPING BY PRODUCT DATA
// ================================
const getProductImage = (product) => {
  // Try mapping by SKU first (most reliable)
  const skuImageMap = {
    WTS001: women_shirt1, // Regular Fitted Crop T-Shirt
    WTS002: women_shirt2, // Regular Crop Textured T-Shirt
    WB001: women_shirt3, // Women's Cream Blouse
    WTS003: women_shirt4, // Classic V-Neck T-Shirt
    WTS004: women_shirt5, // Summer Tank Top
    MS001: boy_shirt1, // Casual Cotton Shirt
    MS002: boy_shirt2, // Formal Button-Down Shirt
    MS003: boy_shirt3, // Polo Shirt
    AB001: belt1, // Classic Leather Belt
    AB002: bag1, // Canvas Crossbody Bag
  };

  if (product.sku && skuImageMap[product.sku]) {
    return skuImageMap[product.sku];
  }

  // Fallback: map by product name patterns
  const name = product.name?.toLowerCase() || "";

  if (name.includes("cream blouse")) return women_shirt3;
  if (name.includes("fitted crop")) return women_shirt1;
  if (name.includes("textured") && name.includes("crop")) return women_shirt2;
  if (name.includes("v-neck")) return women_shirt4;
  if (name.includes("tank")) return women_shirt5;
  if (name.includes("casual") && name.includes("cotton")) return boy_shirt1;
  if (name.includes("formal") || name.includes("button-down"))
    return boy_shirt2;
  if (name.includes("polo")) return boy_shirt3;
  if (name.includes("belt")) return belt1;
  if (name.includes("bag")) return bag1;

  // Category-based fallback
  if (
    product.gender === "women" ||
    product.category?.toLowerCase().includes("women")
  ) {
    return women_shirt1; // Default women's image
  }
  if (
    product.gender === "men" ||
    product.category?.toLowerCase().includes("men")
  ) {
    return boy_shirt1; // Default men's image
  }
  if (product.subcategory === "bag") return bag2;
  if (product.subcategory === "belt") return belt2;

  // Final fallback
  return women_shirt1;
};

const CollectionDatabase = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all products from the database
        const allProductsResponse = await productApi.getProducts({
          limit: 20,
        });

        // Use the same products for all collections for now
        const allProducts = allProductsResponse.products || [];

        // Split products into different collections
        const womenProducts = allProducts.slice(0, 6);
        const menProducts = allProducts.slice(3, 9);

        // Format collections data with static image imports
        const collectionsData = [
          {
            title: "Women's collection",
            products: womenProducts.map((product) => ({
              id: product.id,
              name: product.name,
              color: product.colors?.[0] || "Default",
              price: product.price,
              originalPrice: product.originalPrice,
              image: getProductImage(product), // 🖼️ Static import mapping
              onSale: product.onSale,
              colors: product.colors || [],
              sizes: product.sizes || [],
              category: product.category?.name || "Women",
              gender: product.gender,
              stock: product.stock,
              discount: product.discount,
            })),
          },
          {
            title: "Men's collection",
            products: menProducts.map((product) => ({
              id: product.id,
              name: product.name,
              color: product.colors?.[0] || "Default",
              price: product.price,
              originalPrice: product.originalPrice,
              image: getProductImage(product), // 🖼️ Static import mapping
              onSale: product.onSale,
              colors: product.colors || [],
              sizes: product.sizes || [],
              category: product.category?.name || "Men",
              gender: product.gender,
              stock: product.stock,
              discount: product.discount,
            })),
          },
        ];

        setCollections(collectionsData);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
        setError("Failed to load collections from database");

        // Fallback to static data if available
        setCollections(getStaticFallbackCollections());
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Static fallback data with static image imports
  const getStaticFallbackCollections = () => {
    return [
      {
        title: "Women's collection",
        products: [
          {
            id: "static-1",
            name: "Women's Cream Blouse",
            color: "Cream",
            price: 23.99,
            originalPrice: 33.99,
            image: women_shirt3, // 🖼️ Static import
            onSale: true,
            colors: ["cream", "white"],
            sizes: ["XS", "S", "M", "L"],
            stock: 10,
            discount: 29,
          },
          {
            id: "static-2",
            name: "Regular Fitted Crop T-Shirt",
            color: "White",
            price: 27.99,
            originalPrice: 39.99,
            image: women_shirt1, // 🖼️ Static import
            onSale: true,
            colors: ["white", "red"],
            sizes: ["XS", "S", "M", "L", "XL"],
            stock: 5,
            discount: 30,
          },
        ],
      },
      {
        title: "Men's collection",
        products: [
          {
            id: "static-3",
            name: "Casual Cotton Shirt",
            color: "White",
            price: 34.99,
            originalPrice: 49.99,
            image: boy_shirt1, // 🖼️ Static import
            onSale: true,
            colors: ["white", "blue", "gray"],
            sizes: ["S", "M", "L", "XL", "XXL"],
            stock: 8,
            discount: 30,
          },
        ],
      },
    ];
  };

  const handleProductClick = (product, categoryTitle) => {
    console.log("🏠 Homepage: Clicking product with data:", product);
    console.log("🏠 Homepage: Product price details:", {
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      onSale: product.onSale,
    });

    // Navigate to payment page with product data
    navigate("/payment", {
      state: {
        product: {
          ...product,
          category: categoryTitle.toLowerCase().includes("women")
            ? "women"
            : "men",
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="collection-loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading collections from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="collection-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>{error}</h3>
          <p>Using fallback data. Please check your backend connection.</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Retry Connection
          </button>
        </div>
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
              {category.products.length}{" "}
              {category.products.length === 1 ? "item" : "items"}
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
                  className={`product-card ${
                    product.stock === 0 ? "out-of-stock" : ""
                  }`}
                  onClick={() => handleProductClick(product, category.title)}
                >
                  <div className="product-image-container">
                    {/* Sale Badge */}
                    {product.onSale && product.stock > 0 && (
                      <div className="sale-badge">
                        {product.discount ? `${product.discount}%` : "SALE"}
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
                        e.target.src = "/placeholder-product.jpg"; // Fallback image
                        console.warn(
                          `Failed to load image for product ${product.id}: ${product.name}`
                        );
                      }}
                    />

                    {/* Quick View Overlay */}
                    <div className="product-overlay">
                      <button className="quick-view-btn">Quick View</button>
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
                      {product.onSale &&
                        product.originalPrice > product.price && (
                          <span className="original-price">
                            ${product.originalPrice?.toFixed(2)}
                          </span>
                        )}
                    </div>

                    <div className="product-details">
                      <div className="color-info">
                        <span className="color-label">Color: </span>
                        <span className="color-name">{product.color}</span>
                      </div>

                      {/* Color Options */}
                      {product.colors && product.colors.length > 1 && (
                        <div className="color-options">
                          {product.colors.slice(0, 4).map((color, idx) => (
                            <div
                              key={idx}
                              className="color-dot"
                              style={{
                                backgroundColor:
                                  color === "white" ? "#f8f9fa" : color,
                                border:
                                  color === "white"
                                    ? "1px solid #dee2e6"
                                    : "none",
                              }}
                              title={
                                color.charAt(0).toUpperCase() + color.slice(1)
                              }
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
                            Sizes: {product.sizes.slice(0, 3).join(", ")}
                            {product.sizes.length > 3 && "..."}
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
        <small>Data loaded from MySQL • Images from local assets</small>
      </div>
    </div>
  );
};

export default CollectionDatabase;
