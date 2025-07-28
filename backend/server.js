const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import database configuration
const { connectDB } = require("./config/database");
// Import models to ensure associations are set up
require("./models");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payments");
const testRoutes = require("./routes/test"); // Test routes for payment testing
const debugRoutes = require("./routes/debug"); // Debug routes for development

// New verification routes
const userProfileRoutes = require("./routes/userProfile");
const orderVerificationRoutes = require("./routes/orderVerification");

const app = express();

// Middleware
app.use(helmet());
app.use(morgan("combined"));

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    "http://localhost:3000", // React default port
    "http://localhost:5173", // Vite default port
    "http://localhost:5174", // Your current frontend port
    "http://localhost:5175", // Alternative frontend port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://localhost:3001", // Backend port (for testing)
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "Cache-Control",
    "X-Access-Token",
  ],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`🔄 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`📍 Origin: ${req.headers.origin}`);
  if (req.method === "POST" && req.body) {
    console.log(`📦 Body received:`, Object.keys(req.body));
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/test", testRoutes);

// New verification routes
app.use("/api/user", userProfileRoutes);
app.use("/api/verification", orderVerificationRoutes);

// Debug routes (development only)
if (process.env.NODE_ENV === "development") {
  app.use("/api/debug", debugRoutes);
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Clothing Store API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Database connection and server start
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`🚀 Server URL: http://localhost:${PORT}`);
      console.log(`📚 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(
        `🔗 Frontend should connect to: http://localhost:${PORT}/api`
      );
      console.log(
        `🌐 CORS allowed origin: ${
          process.env.CORS_ORIGIN || "http://localhost:5174"
        }`
      );
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
