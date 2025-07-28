const { Product, Category, Review, User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 📋 Get all products with advanced filters and pagination
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      gender,
      minPrice,
      maxPrice,
      onSale,
      featured,
      inStock,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      colors,
      sizes
    } = req.query;

    // Build where conditions
    const whereConditions = {
      isActive: true
    };

    // Category filter (by slug)
    if (category) {
      const categoryRecord = await Category.findOne({ where: { slug: category } });
      if (categoryRecord) {
        whereConditions.categoryId = categoryRecord.id;
      }
    }

    // Subcategory filter
    if (subcategory) {
      whereConditions.subcategory = subcategory;
    }

    // Gender filter
    if (gender) {
      whereConditions.gender = gender;
    }

    // Price range filter (check both salePrice and originalPrice)
    if (minPrice || maxPrice) {
      const priceConditions = [];
      
      // For products with sale price
      const saleCondition = { salePrice: { [Op.not]: null } };
      if (minPrice) saleCondition.salePrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) saleCondition.salePrice[Op.lte] = parseFloat(maxPrice);
      priceConditions.push(saleCondition);
      
      // For products without sale price
      const originalCondition = { 
        salePrice: null,
        originalPrice: {}
      };
      if (minPrice) originalCondition.originalPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) originalCondition.originalPrice[Op.lte] = parseFloat(maxPrice);
      priceConditions.push(originalCondition);
      
      whereConditions[Op.or] = priceConditions;
    }

    // On sale filter
    if (onSale === 'true') {
      whereConditions.salePrice = { [Op.not]: null };
    }

    // Featured filter
    if (featured === 'true') {
      whereConditions.isFeatured = true;
    }

    // In stock filter
    if (inStock === 'true') {
      whereConditions.stock = { [Op.gt]: 0 };
    }

    // Search filter
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Color filter (JSON contains)
    if (colors) {
      const colorArray = colors.split(',').map(c => c.trim());
      whereConditions.colors = {
        [Op.contains]: colorArray
      };
    }

    // Size filter (JSON contains)
    if (sizes) {
      const sizeArray = sizes.split(',').map(s => s.trim());
      whereConditions.sizes = {
        [Op.contains]: sizeArray
      };
    }

    // Sorting options
    const validSortFields = ['name', 'originalPrice', 'salePrice', 'createdAt', 'stock', 'discountPercentage'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with includes
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [[orderField, orderDirection]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Transform products for frontend (no image paths)
    const transformedProducts = products.map(product => {
      const productData = product.toJSON();
      
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        slug: productData.slug,
        
        // Pricing calculations
        originalPrice: parseFloat(productData.originalPrice),
        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : null,
        price: productData.salePrice ? parseFloat(productData.salePrice) : parseFloat(productData.originalPrice),
        discount: productData.discountPercentage || calculateDiscount(productData.originalPrice, productData.salePrice),
        onSale: !!(productData.salePrice && productData.salePrice < productData.originalPrice),
        
        // Product attributes
        colors: productData.colors || [],
        sizes: productData.sizes || [],
        material: productData.material,
        brand: productData.brand,
        tags: productData.tags || [],
        
        // Inventory
        stock: productData.stock,
        inStock: productData.stock > 0,
        lowStock: productData.stock <= 5,
        
        // Category information
        category: productData.Category ? {
          id: productData.Category.id,
          name: productData.Category.name,
          slug: productData.Category.slug
        } : null,
        subcategory: productData.subcategory,
        gender: productData.gender,
        
        // Status flags
        isFeatured: productData.isFeatured,
        isActive: productData.isActive,
        
        // SEO
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
        
        // Timestamps
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt
      };
    });

    // Response with comprehensive pagination
    res.json({
      success: true,
      message: `Found ${count} products`,
      products: transformedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalProducts: count,
        productsPerPage: parseInt(limit),
        hasNextPage: offset + parseInt(limit) < count,
        hasPreviousPage: parseInt(page) > 1,
        startIndex: offset + 1,
        endIndex: Math.min(offset + parseInt(limit), count)
      },
      appliedFilters: {
        category,
        subcategory,
        gender,
        priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
        onSale: onSale === 'true',
        featured: featured === 'true',
        inStock: inStock === 'true',
        search,
        colors: colors ? colors.split(',') : null,
        sizes: sizes ? sizes.split(',') : null,
        sortBy: orderField,
        sortOrder: orderDirection
      }
    });

  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// 🎯 Get featured products (for homepage)
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8, category, gender } = req.query;
    
    const whereConditions = {
      isActive: true,
      isFeatured: true,
      stock: { [Op.gt]: 0 }
    };

    if (category) {
      const categoryRecord = await Category.findOne({ where: { slug: category } });
      if (categoryRecord) {
        whereConditions.categoryId = categoryRecord.id;
      }
    }

    if (gender) {
      whereConditions.gender = gender;
    }

    const products = await Product.findAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const transformedProducts = products.map(product => {
      const productData = product.toJSON();
      
      return {
        id: productData.id,
        name: productData.name,
        originalPrice: parseFloat(productData.originalPrice),
        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : null,
        price: productData.salePrice ? parseFloat(productData.salePrice) : parseFloat(productData.originalPrice),
        discount: calculateDiscount(productData.originalPrice, productData.salePrice),
        onSale: !!(productData.salePrice && productData.salePrice < productData.originalPrice),
        colors: productData.colors || [],
        sizes: productData.sizes || [],
        category: productData.Category ? productData.Category.name : null,
        gender: productData.gender,
        stock: productData.stock
      };
    });

    res.json({
      success: true,
      message: `Found ${products.length} featured products`,
      products: transformedProducts
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// 🔍 Get single product by ID or slug
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let product = await Product.findOne({
      where: {
        [Op.or]: [
          { id: isNaN(id) ? -1 : parseInt(id) },
          { slug: id }
        ],
        isActive: true
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ],
          where: { isApproved: true },
          required: false,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productData = product.toJSON();

    // Calculate average rating
    const avgRating = productData.Reviews && productData.Reviews.length > 0
      ? productData.Reviews.reduce((sum, review) => sum + review.rating, 0) / productData.Reviews.length
      : 0;

    const transformedProduct = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      slug: productData.slug,
      
      // Pricing
      originalPrice: parseFloat(productData.originalPrice),
      salePrice: productData.salePrice ? parseFloat(productData.salePrice) : null,
      price: productData.salePrice ? parseFloat(productData.salePrice) : parseFloat(productData.originalPrice),
      discount: calculateDiscount(productData.originalPrice, productData.salePrice),
      onSale: !!(productData.salePrice && productData.salePrice < productData.originalPrice),
      
      // Product details
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      material: productData.material,
      brand: productData.brand,
      tags: productData.tags || [],
      
      // Inventory
      stock: productData.stock,
      inStock: productData.stock > 0,
      
      // Category
      category: productData.Category ? {
        id: productData.Category.id,
        name: productData.Category.name,
        slug: productData.Category.slug
      } : null,
      subcategory: productData.subcategory,
      gender: productData.gender,
      
      // Reviews
      reviews: productData.Reviews || [],
      reviewCount: productData.Reviews ? productData.Reviews.length : 0,
      averageRating: Math.round(avgRating * 10) / 10,
      
      // Status
      isFeatured: productData.isFeatured,
      
      // SEO
      metaTitle: productData.metaTitle,
      metaDescription: productData.metaDescription,
      
      // Timestamps
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };

    res.json({
      success: true,
      product: transformedProduct
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// 🛠️ Helper function to calculate discount percentage
const calculateDiscount = (originalPrice, salePrice) => {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// 📝 Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name, description, sku, originalPrice, salePrice, categoryId,
      colors, sizes, material, brand, tags, stock, subcategory, gender,
      isFeatured, metaTitle, metaDescription
    } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Calculate discount percentage
    const discountPercentage = calculateDiscount(originalPrice, salePrice);

    const product = await Product.create({
      name,
      description,
      sku,
      slug,
      originalPrice,
      salePrice,
      discountPercentage,
      categoryId,
      colors: JSON.stringify(colors || []),
      sizes: JSON.stringify(sizes || []),
      material,
      brand,
      tags: JSON.stringify(tags || []),
      stock: stock || 0,
      subcategory,
      gender: gender || 'unisex',
      isFeatured: isFeatured || false,
      metaTitle,
      metaDescription
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ✏️ Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update slug if name changed
    if (updates.name && updates.name !== product.name) {
      updates.slug = updates.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Recalculate discount if prices changed
    if (updates.originalPrice || updates.salePrice) {
      const originalPrice = updates.originalPrice || product.originalPrice;
      const salePrice = updates.salePrice || product.salePrice;
      updates.discountPercentage = calculateDiscount(originalPrice, salePrice);
    }

    await product.update(updates);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// 🗑️ Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    await product.update({ isActive: false });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ⭐ Add product review
const addReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { productId, userId }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await Review.create({
      productId,
      userId,
      rating,
      title,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
};
