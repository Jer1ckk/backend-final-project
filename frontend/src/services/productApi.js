// 🔄 Enhanced API Service for Products
// File: frontend/src/services/productApi.js

import apiService from "./api";

// 📋 Product API endpoints
export const productApi = {
  // 🛍️ Get all products with filters
  async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await apiService.get(
        `/products?${queryParams.toString()}`
      );
      return {
        success: true,
        products: response.products || [],
        pagination: response.pagination || {},
        appliedFilters: response.appliedFilters || {},
      };
    } catch (error) {
      console.error("Get products error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch products",
      };
    }
  },

  // 🎯 Get featured products
  async getFeaturedProducts(limit = 8, category = null, gender = null) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());
      if (category) queryParams.append("category", category);
      if (gender) queryParams.append("gender", gender);

      const response = await apiService.get(
        `/products/featured?${queryParams.toString()}`
      );
      return {
        success: true,
        products: response.products || [],
      };
    } catch (error) {
      console.error("Get featured products error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch featured products",
      };
    }
  },

  // 🔍 Get single product
  async getProduct(id) {
    try {
      const response = await apiService.get(`/products/${id}`);
      return {
        success: true,
        product: response.product || null,
      };
    } catch (error) {
      console.error("Get product error:", error);
      return {
        success: false,
        product: null,
        error: error.message || "Failed to fetch product",
      };
    }
  },

  // 🔍 Search products
  async searchProducts(searchTerm, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: searchTerm,
        limit: filters.limit || 20,
      };

      return await this.getProducts(searchFilters);
    } catch (error) {
      console.error("Search products error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to search products",
      };
    }
  },

  // 👗 Get products by category
  async getProductsByCategory(category, subcategory = null, options = {}) {
    try {
      const filters = {
        category,
        ...(subcategory && { subcategory }),
        ...options,
      };

      return await this.getProducts(filters);
    } catch (error) {
      console.error("Get products by category error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch category products",
      };
    }
  },

  // 👤 Get products by gender
  async getProductsByGender(gender, options = {}) {
    try {
      const filters = {
        gender,
        ...options,
      };

      return await this.getProducts(filters);
    } catch (error) {
      console.error("Get products by gender error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch gender products",
      };
    }
  },

  // 💰 Get products on sale
  async getSaleProducts(options = {}) {
    try {
      const filters = {
        onSale: true,
        ...options,
      };

      return await this.getProducts(filters);
    } catch (error) {
      console.error("Get sale products error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch sale products",
      };
    }
  },

  // 🎨 Get products by color
  async getProductsByColor(colors, options = {}) {
    try {
      const filters = {
        colors: Array.isArray(colors) ? colors : [colors],
        ...options,
      };

      return await this.getProducts(filters);
    } catch (error) {
      console.error("Get products by color error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch products by color",
      };
    }
  },

  // 📏 Get products by size
  async getProductsBySize(sizes, options = {}) {
    try {
      const filters = {
        sizes: Array.isArray(sizes) ? sizes : [sizes],
        ...options,
      };

      return await this.getProducts(filters);
    } catch (error) {
      console.error("Get products by size error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch products by size",
      };
    }
  },

  // 💵 Get products by price range
  async getProductsByPriceRange(minPrice, maxPrice, options = {}) {
    try {
      const filters = {
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...options,
      };

      return await this.getProducts(filters);
    } catch (error) {
      console.error("Get products by price range error:", error);
      return {
        success: false,
        products: [],
        error: error.message || "Failed to fetch products by price range",
      };
    }
  },

  // ⭐ Add product review
  async addProductReview(productId, reviewData) {
    try {
      const response = await apiService.post(
        `/products/${productId}/reviews`,
        reviewData
      );
      return {
        success: true,
        review: response.review || null,
        message: response.message || "Review added successfully",
      };
    } catch (error) {
      console.error("Add product review error:", error);
      return {
        success: false,
        error: error.message || "Failed to add review",
      };
    }
  },
};

// 🛠️ Helper functions for common filter combinations
export const productFilters = {
  // Women's products
  women: {
    tshirts: () => productApi.getProductsByCategory("women", "t-shirt"),
    shirts: () => productApi.getProductsByCategory("women", "shirt"),
    dresses: () => productApi.getProductsByCategory("women", "dress"),
    jeans: () => productApi.getProductsByCategory("women", "jeans"),
    jackets: () => productApi.getProductsByCategory("women", "jacket"),
    all: (options = {}) => productApi.getProductsByGender("women", options),
  },

  // Men's products
  men: {
    shirts: () => productApi.getProductsByCategory("men", "shirt"),
    jeans: () => productApi.getProductsByCategory("men", "jeans"),
    jackets: () => productApi.getProductsByCategory("men", "jacket"),
    all: (options = {}) => productApi.getProductsByGender("men", options),
  },

  // Special collections
  featured: (limit = 8) => productApi.getFeaturedProducts(limit),
  sale: (options = {}) => productApi.getSaleProducts(options),
  newArrivals: (options = {}) =>
    productApi.getProducts({
      ...options,
      sortBy: "createdAt",
      sortOrder: "DESC",
    }),

  // Price ranges
  priceRanges: {
    under25: (options = {}) =>
      productApi.getProductsByPriceRange(0, 25, options),
    from25to50: (options = {}) =>
      productApi.getProductsByPriceRange(25, 50, options),
    from50to100: (options = {}) =>
      productApi.getProductsByPriceRange(50, 100, options),
    over100: (options = {}) =>
      productApi.getProductsByPriceRange(100, null, options),
  },
};

// 📊 Advanced filter builder
export class ProductFilterBuilder {
  constructor() {
    this.filters = {};
  }

  category(category) {
    this.filters.category = category;
    return this;
  }

  subcategory(subcategory) {
    this.filters.subcategory = subcategory;
    return this;
  }

  gender(gender) {
    this.filters.gender = gender;
    return this;
  }

  priceRange(min, max) {
    if (min) this.filters.minPrice = min;
    if (max) this.filters.maxPrice = max;
    return this;
  }

  colors(colors) {
    this.filters.colors = Array.isArray(colors) ? colors : [colors];
    return this;
  }

  sizes(sizes) {
    this.filters.sizes = Array.isArray(sizes) ? sizes : [sizes];
    return this;
  }

  onSale(isOnSale = true) {
    this.filters.onSale = isOnSale;
    return this;
  }

  featured(isFeatured = true) {
    this.filters.featured = isFeatured;
    return this;
  }

  inStock(inStock = true) {
    this.filters.inStock = inStock;
    return this;
  }

  search(searchTerm) {
    this.filters.search = searchTerm;
    return this;
  }

  sort(sortBy, sortOrder = "DESC") {
    this.filters.sortBy = sortBy;
    this.filters.sortOrder = sortOrder;
    return this;
  }

  page(page, limit = 20) {
    this.filters.page = page;
    this.filters.limit = limit;
    return this;
  }

  async build() {
    return await productApi.getProducts(this.filters);
  }

  getFilters() {
    return { ...this.filters };
  }

  reset() {
    this.filters = {};
    return this;
  }
}

export default productApi;

// 📝 Usage Examples:
/*
// Basic usage:
const products = await productApi.getProducts();

// With filters:
const womensTshirts = await productApi.getProductsByCategory('women', 't-shirt');

// Featured products:
const featured = await productApi.getFeaturedProducts(8);

// Search:
const searchResults = await productApi.searchProducts('blouse');

// Advanced filtering with builder:
const builder = new ProductFilterBuilder();
const results = await builder
  .gender('women')
  .category('women')
  .priceRange(20, 50)
  .colors(['white', 'cream'])
  .onSale(true)
  .sort('price', 'ASC')
  .page(1, 12)
  .build();

// Using helper filters:
const womensTshirts = await productFilters.women.tshirts();
const saleProducts = await productFilters.sale();
const under25 = await productFilters.priceRanges.under25();
*/
