const express = require("express");
const { body } = require("express-validator");
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFeaturedProducts,
} = require("../controllers/productController");
const { auth, adminAuth } = require("../config/auth");

const router = express.Router();

// 📋 Public routes
router.get("/", getAllProducts); // GET /api/products?category=women&gender=women&page=1&limit=20
router.get("/featured", getFeaturedProducts); // GET /api/products/featured?limit=8
router.get("/:id", getProduct); // GET /api/products/123 or /api/products/womens-cream-blouse

// 📝 Protected routes (logged in users)
router.post(
  "/:id/reviews",
  auth,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Title cannot exceed 255 characters"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment cannot exceed 1000 characters"),
  ],
  addReview
);

// 🛠️ Admin routes (admin only)
router.post(
  "/",
  auth,
  adminAuth,
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Product name must be 2-255 characters"),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("sku")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("SKU is required and must be max 100 characters"),
    body("originalPrice")
      .isFloat({ min: 0.01 })
      .withMessage("Original price must be greater than 0"),
    body("salePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Sale price must be non-negative"),
    body("categoryId")
      .isInt({ min: 1 })
      .withMessage("Valid category ID is required"),
    body("colors").optional().isArray().withMessage("Colors must be an array"),
    body("sizes").optional().isArray().withMessage("Sizes must be an array"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be non-negative integer"),
    body("gender")
      .optional()
      .isIn(["men", "women", "unisex", "kids"])
      .withMessage("Invalid gender value"),
    body("material")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Material must be max 100 characters"),
    body("brand")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Brand must be max 100 characters"),
  ],
  createProduct
);

router.put(
  "/:id",
  auth,
  adminAuth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Product name must be 2-255 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("originalPrice")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Original price must be greater than 0"),
    body("salePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Sale price must be non-negative"),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be non-negative integer"),
  ],
  updateProduct
);

router.delete("/:id", auth, adminAuth, deleteProduct);

module.exports = router;
