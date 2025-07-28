import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Heart } from "lucide-react";
import apiService from "../services/api";
import "../styles/CategoryProducts.css";
import "../styles/Homepage.css";

const CategoryProducts = () => {
  const { category: rawCategory, subcategory: rawSubcategory } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Handle legacy routes (e.g., /jacket -> women/jacket)
  let category, subcategory;

  if (rawCategory && rawSubcategory) {
    // Normal route: /women/t-shirt
    category = rawCategory;
    subcategory = rawSubcategory;
  } else if (rawCategory && !rawSubcategory) {
    // Legacy route: /jacket
    category = "women"; // Default legacy routes to women
    subcategory = rawCategory; // The path itself is the subcategory
  } else {
    // Fallback
    category = "women";
    subcategory = "t-shirt";
  }

  console.log(
    `🚀 CategoryProducts component loaded for: ${category}/${subcategory}`
  );
  console.log("🔍 Current URL:", window.location.href);
  console.log("🔍 Route params (raw):", { rawCategory, rawSubcategory });
  console.log("🔍 Route params (processed):", { category, subcategory });

  // Check if user is logged in
  useEffect(() => {
    console.log("🔐 CategoryProducts: Checking authentication state");
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    console.log("🔐 CategoryProducts: Token exists:", !!token);
    console.log("🔐 CategoryProducts: UserData exists:", !!userData);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("🔐 CategoryProducts: Setting user:", parsedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("🔐 CategoryProducts: Error parsing user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      console.log("🔐 CategoryProducts: No valid authentication found");
    }
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    navigate("/");
  };

  // Fetch products when component mounts or params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create search parameters based on category and subcategory
        const params = {};

        if (category) {
          // Map URL categories to database categories
          const categoryMap = {
            men: "Men",
            women: "Women",
            girls: "Girls",
            boys: "Boys",
            accessories: "Accessories",
          };
          params.category = categoryMap[category] || category;
        }

        if (subcategory) {
          // Map subcategories based on category context
          let mappedSubcategory = subcategory;

          if (subcategory === "clothing") {
            // Handle clothing subcategory based on parent category
            if (category === "girls") {
              mappedSubcategory = "Girls Clothing";
            } else if (category === "boys") {
              mappedSubcategory = "Boys Clothing";
            } else {
              mappedSubcategory = "Clothing";
            }
          } else if (subcategory === "shoes") {
            // Handle shoes subcategory based on parent category
            if (category === "girls") {
              mappedSubcategory = "Girls Shoes";
            } else if (category === "boys") {
              mappedSubcategory = "Boys Shoes";
            } else if (category === "men") {
              mappedSubcategory = "Men Shoes";
            } else if (category === "women") {
              mappedSubcategory = "Women Shoes";
            } else {
              mappedSubcategory = "Shoes";
            }
          } else {
            // Handle other subcategories with category prefix
            const subcategoryMap = {
              "t-shirt":
                category === "men"
                  ? "Men T-shirt"
                  : category === "women"
                  ? "Women T-shirt"
                  : "T-shirt",
              jeans:
                category === "men"
                  ? "Men Jeans"
                  : category === "women"
                  ? "Women Jeans"
                  : "Jeans",
              jacket:
                category === "men"
                  ? "Men Jacket"
                  : category === "women"
                  ? "Women Jacket"
                  : "Jacket",
              shirt:
                category === "men"
                  ? "Men Shirt"
                  : category === "women"
                  ? "Women Shirt"
                  : "Shirt",
              trouser:
                category === "men"
                  ? "Men Trouser"
                  : category === "women"
                  ? "Women Trouser"
                  : "Trouser",
              dress: category === "women" ? "Women Dress" : "Dress",
              skirt: category === "women" ? "Women Skirt" : "Skirt",
              shorts: category === "women" ? "Women Shorts" : "Shorts",
              belt: "Belt",
              bag: "Bag",
              glasses: "Glasses",
              watches: "Watches",
              gloves: "Gloves",
              hat: "Hat",
              wallet: "Wallet",
            };
            mappedSubcategory = subcategoryMap[subcategory] || subcategory;
          }

          params.subcategory = mappedSubcategory;
          console.log(
            `🏷️ Mapped subcategory: ${subcategory} → ${mappedSubcategory} (category: ${category})`
          );
        }

        console.log("Fetching products with params:", params);
        console.log(
          `🔍 API URL will be: /api/products?${new URLSearchParams(
            params
          ).toString()}`
        );
        const response = await apiService.getProducts(params);
        console.log("🔍 Raw API response:", response);

        if (response && response.products) {
          console.log("🏷️ Category API response products:", response.products);

          // Process products to ensure consistent price structure
          const processedProducts = response.products.map((product) => {
            // Convert string prices to numbers
            const originalPrice = parseFloat(product.originalPrice) || 0;
            const salePrice = product.salePrice
              ? parseFloat(product.salePrice)
              : null;

            // Calculate effective price (same logic as homepage)
            const effectivePrice = salePrice || originalPrice;

            // Debug: Log price processing for first product only
            if (product.id === response.products[0].id) {
              console.log(`🔧 Processing product ${product.name}:`, {
                rawOriginalPrice: product.originalPrice,
                rawSalePrice: product.salePrice,
                processedOriginalPrice: originalPrice,
                processedSalePrice: salePrice,
                calculatedEffectivePrice: effectivePrice,
              });
            }

            return {
              ...product,
              // Processed price fields
              originalPrice: originalPrice,
              salePrice: salePrice,
              price: effectivePrice, // This is the key field that was missing!
              // Parse JSON strings if needed
              images:
                typeof product.images === "string"
                  ? JSON.parse(product.images)
                  : product.images || [],
              colors:
                typeof product.colors === "string"
                  ? JSON.parse(product.colors)
                  : product.colors || [],
              sizes:
                typeof product.sizes === "string"
                  ? JSON.parse(product.sizes)
                  : product.sizes || [],
            };
          });

          // Log first product's processed price details for debugging
          if (processedProducts.length > 0) {
            console.log("🏷️ First product processed price details:", {
              id: processedProducts[0].id,
              name: processedProducts[0].name,
              price: processedProducts[0].price,
              salePrice: processedProducts[0].salePrice,
              originalPrice: processedProducts[0].originalPrice,
              onSale: processedProducts[0].onSale,
            });
          }

          setProducts(processedProducts);
        } else {
          setProducts(response || []);
        }
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        console.error("❌ Error details:", {
          message: err.message,
          stack: err.stack,
          category: category,
          subcategory: subcategory,
          params: params,
        });
        setError(
          `Failed to load products for ${category}/${subcategory}. Please try again.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  const retryFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create search parameters based on category and subcategory
      const params = {};

      if (category) {
        // Map URL categories to database categories
        const categoryMap = {
          men: "Men",
          women: "Women",
          girls: "Girls",
          boys: "Boys",
          accessories: "Accessories",
        };
        params.category = categoryMap[category] || category;
      }

      if (subcategory) {
        // Map subcategories
        const subcategoryMap = {
          "t-shirt": "T-shirt",
          jeans: "Jeans",
          jacket: "Jacket",
          shirt: "Shirt",
          trouser: "Trouser",
          shoes: "Shoes",
          dress: "Dress",
          skirt: "Skirt",
          shorts: "Shorts",
          belt: "Belt",
          bag: "Bag",
          glasses: "Glasses",
          watches: "Watches",
          gloves: "Gloves",
          hat: "Hat",
          wallet: "Wallet",
          clothing: "Clothing",
        };
        params.subcategory = subcategoryMap[subcategory] || subcategory;
      }

      console.log("Fetching products with params:", params);
      const response = await apiService.getProducts(params);

      if (response && response.products) {
        setProducts(response.products);
      } else {
        setProducts(response || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    console.log("🏷️ Category page: Clicking product with data:", product);
    console.log("🏷️ Category page: Product price details:", {
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      onSale: product.onSale,
    });

    // Create the product data to pass to PaymentPage
    const productToPass = {
      ...product,
      category: category || "general",
    };

    console.log(
      "🏷️ Category page: Passing product to PaymentPage:",
      productToPass
    );
    console.log("🏷️ Category page: Final price check:", {
      price: productToPass.price,
      salePrice: productToPass.salePrice,
      originalPrice: productToPass.originalPrice,
      priceType: typeof productToPass.price,
      salePriceType: typeof productToPass.salePrice,
      originalPriceType: typeof productToPass.originalPrice,
    });

    // Navigate to payment page with product data (same as homepage)
    navigate("/payment", {
      state: {
        product: productToPass,
      },
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", product);
  };

  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    // TODO: Implement add to wishlist functionality
    console.log("Add to wishlist:", product);
  };

  const getCategoryTitle = () => {
    const categoryTitles = {
      men: "Men's",
      women: "Women's",
      girls: "Girls'",
      boys: "Boys'",
      accessories: "Accessories",
    };

    const categoryTitle = categoryTitles[category] || category;
    const subcategoryTitle = subcategory
      ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1)
      : "";

    return subcategoryTitle
      ? `${categoryTitle} ${subcategoryTitle}`
      : categoryTitle;
  };

  if (loading) {
    return (
      <div className="category-products-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-products-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={retryFetch} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-products-container">
      {/* Simple Authentication Header */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "10px 20px",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textDecoration: "none",
            color: "#333",
          }}
        >
          StyleStore
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#333", fontSize: "14px" }}>
                Welcome, {user.name}!
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                to="/login"
                style={{
                  background: "#007bff",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontSize: "12px",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: "#28a745",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontSize: "12px",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Header */}
      <div className="category-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="category-title">{getCategoryTitle()}</h1>
        <p className="products-count">{products.length} products found</p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="product-image-container">
                <img
                  src={product.images?.[0] || "/placeholder-image.jpg"}
                  alt={product.name}
                  className="product-image"
                />
                {product.discount > 0 && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
                <div className="product-actions">
                  <button
                    onClick={(e) => handleAddToWishlist(e, product)}
                    className="action-btn wishlist-btn"
                    title="Add to Wishlist"
                  >
                    <Heart size={18} />
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="action-btn cart-btn"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  <span className="sale-price">
                    ${(product.price || 0).toFixed(2)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > (product.price || 0) && (
                      <span className="original-price">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                </div>
                {product.colors && product.colors.length > 0 && (
                  <div className="product-colors">
                    {product.colors.slice(0, 3).map((color, index) => (
                      <span
                        key={index}
                        className="color-dot"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                    {product.colors.length > 3 && (
                      <span className="more-colors">
                        +{product.colors.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-products">
          <p>No products found in this category.</p>
          {(category === "girls" && subcategory === "clothing") ||
          (category === "boys" && subcategory === "clothing") ? (
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "15px",
                }}
              >
                Try browsing {category} shoes instead, or check out other
                categories.
              </p>
              <button
                onClick={() => navigate(`/${category}/shoes`)}
                className="continue-shopping-btn"
                style={{ marginRight: "10px" }}
              >
                Browse {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                Shoes
              </button>
            </div>
          ) : null}
          <button
            onClick={() => navigate("/")}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
