import React, { useState } from "react";
import { Heart, Bell, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Women_T_shirt.css";
import Footer from "../components/Footer";

import accessories_watches1 from "../assets/watches1.webp";
import accessories_watches2 from "../assets/watches2.webp";
import accessories_watches3 from "../assets/watches3.webp";
import accessories_watches4 from "../assets/watches4.webp";
import accessories_watches5 from "../assets/watches5.webp";
import accessories_watches6 from "../assets/watches6.webp";

const categories = [
  {
    name: "Women",
    items: [
      { name: "T-shirt", link: "/women/t-shirt" },
      { name: "Shirt", link: "/women/shirt" },
      { name: "Jacket", link: "/women/jacket" },
      { name: "Skirt", link: "/women/skirt" },
      { name: "Shorts", link: "/women/shorts" },
      { name: "Jeans", link: "/women/jeans" },
      { name: "Trouser", link: "/women/trouser" },
      { name: "Dress", link: "/women/dress" },
      { name: "Shoes", link: "/women/shoes" },
    ],
  },
  {
    name: "Men",
    items: [
      { name: "T-shirt", link: "/men/t-shirt" },
      { name: "Jeans", link: "/men/jeans" },
      { name: "Jacket", link: "/men/jacket" },
      { name: "Trouser", link: "/men/trouser" },
      { name: "Shirt", link: "/men/shirt" },
      { name: "Shoes", link: "/men/shoes" },
    ],
  },
  {
    name: "Girls",
    items: [
      { name: "Clothing", link: "/girls/clothing" },
      { name: "Shoes", link: "/girls/shoes" },
    ],
  },
  {
    name: "Boys",
    items: [
      { name: "Clothing", link: "/boys/clothing" },
      { name: "Shoes", link: "/boys/shoes" },
    ],
  },
  {
    name: "Accessories",
    items: [
      { name: "Glasses", link: "/accessories/glasses" },
      { name: "Watches", link: "/accessories/watches" },
      { name: "Gloves", link: "/accessories/gloves" },
      { name: "Belt", link: "/accessories/belt" },
      { name: "Hat", link: "/accessories/hat" },
      { name: "Bag", link: "/accessories/bag" },
      { name: "Wallet", link: "/accessories/wallet" },
    ],
  },
];

const products = [
  {
    id: 1,
    name: "Classic Analog Watch",
    originalPrice: 149.99,
    salePrice: 29.99,
    discount: 80,
    image: accessories_watches1,
    colors: ["black", "silver"],
  },
  {
    id: 2,
    name: "Digital Sports Watch",
    originalPrice: 129.99,
    salePrice: 25.99,
    discount: 80,
    image: accessories_watches2,
    colors: ["blue", "grey"],
  },
  {
    id: 3,
    name: "Luxury Leather Strap Watch",
    originalPrice: 199.99,
    salePrice: 39.99,
    discount: 80,
    image: accessories_watches3,
    colors: ["brown", "gold"],
  },
  {
    id: 4,
    name: "Minimalist Quartz Watch",
    originalPrice: 139.99,
    salePrice: 27.99,
    discount: 80,
    image: accessories_watches4,
    colors: ["white", "rose gold"],
  },
  {
    id: 5,
    name: "Smart Fitness Watch",
    originalPrice: 179.99,
    salePrice: 35.99,
    discount: 80,
    image: accessories_watches5,
    colors: ["black", "green"],
  },
  {
    id: 6,
    name: "Elegant Dress Watch",
    originalPrice: 159.99,
    salePrice: 31.99,
    discount: 80,
    image: accessories_watches6,
    colors: ["silver", "navy"],
  },
];

const Accessories_watches = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleProductClick = (product) => {
    // Navigate to payment page with product information
    navigate("/payment", { state: { product } });
  };

  return (
    <div>
      <div className="homepage-container">
        <div className="header">
          <div className="logo-container">
            <Link to="/" className="logo-bg">
              <span className="logo-text">
                <span className="logo-star">★</span>
                StyleStore
              </span>
            </Link>
          </div>
          <div className="header-right">
            <div className="header-row">
              <input
                type="text"
                placeholder="Search"
                className="search-input"
              />
              <div className="icons-area">
                <Bell size={20} className="text-black" />
                <Heart size={20} className="text-black" />
                <div className="shopping-bag-rel">
                  <ShoppingBag size={22} className="text-black" />
                  <span className="shopping-bag-badge">0</span>
                </div>
                <Link to="/login" className="login-link">
                  LOGIN
                </Link>
                <Link to="/register" className="register-link">
                  REGISTER
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="category-nav">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`category-group${
                openDropdown === cat.name ? " open" : ""
              }`}
              onMouseEnter={() => cat.items && setOpenDropdown(cat.name)}
              onMouseLeave={() => cat.items && setOpenDropdown(null)}
            >
              <button
                className={`category-btn${
                  cat.name === "Women" ? " women" : ""
                }`}
                style={{ fontWeight: 700 }}
                onClick={() =>
                  setOpenDropdown(cat.name === openDropdown ? null : cat.name)
                }
                type="button"
              >
                {cat.name}
              </button>
              {cat.items && (
                <div className="dropdown">
                  <ul>
                    {cat.items.map((item) => (
                      <li key={item.name}>
                        <Link to={item.link}>{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="women-tshirt-container">
          <div className="sale-banner">
            <div className="banner-content">
              <div className="sale-text">
                <span className="up-to">UP TO</span>
                <span className="percentage">80% OFF</span>
                <span className="sale-subtitle">ON MID-YEAR SALE</span>
              </div>
            </div>
          </div>
          <div className="women-tshirt-title">Watches</div>

          {/* Product Grid */}
          <div className="products-grids">
            {products.map((product) => (
              <div key={product.id} className="product-cards">
                <div className="product-image-containers">
                  <div className="discount-badge">{product.discount}%</div>
                  <button
                    className={`favorite-btn ${
                      favorites.has(product.id) ? "active" : ""
                    }`}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      size={16}
                      fill={favorites.has(product.id) ? "#ef4444" : "none"}
                    />
                  </button>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-images"
                    onClick={() => handleProductClick(product)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="price-container">
                    <span className="sale-price">US ${product.salePrice}</span>
                    <span className="original-price">
                      US ${product.originalPrice}
                    </span>
                  </div>
                  <div className="color-options">
                    {product.colors.map((color, index) => (
                      <div key={index} className={`color-dot ${color}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="Footer">
        <Footer />
      </div>
    </div>
  );
};

export default Accessories_watches;
