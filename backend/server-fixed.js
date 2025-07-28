const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database configuration
const { connectDB } = require('./config/database');

// Import models to ensure associations are set up
require('./models');

const app = express();

// Basic middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Clothing Store API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Basic API routes (import them safely)
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.log('Auth routes not loaded:', error.message);
}

try {
  const productRoutes = require('./routes/products');
  app.use('/api/products', productRoutes);
} catch (error) {
  console.log('Product routes not loaded:', error.message);
}

try {
  const categoryRoutes = require('./routes/categories');
  app.use('/api/categories', categoryRoutes);
} catch (error) {
  console.log('Category routes not loaded:', error.message);
}

try {
  const orderRoutes = require('./routes/orders');
  app.use('/api/orders', orderRoutes);
} catch (error) {
  console.log('Order routes not loaded:', error.message);
}

try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
} catch (error) {
  console.log('User routes not loaded:', error.message);
}

try {
  const cartRoutes = require('./routes/cart');
  app.use('/api/cart', cartRoutes);
} catch (error) {
  console.log('Cart routes not loaded:', error.message);
}

// Test routes with error handling
try {
  const testRoutes = require('./routes/test');
  app.use('/api/test', testRoutes);
} catch (error) {
  console.log('Test routes not loaded:', error.message);
  
  // Create a basic test route if the file has issues
  app.get('/api/test/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Basic test endpoint working',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    const PORT = process.env.PORT || 3001;
    
    const server = app.listen(PORT, () => {
      console.log('🎉 Server started successfully!');
      console.log(`🚀 Server URL: http://localhost:${PORT}`);
      console.log(`📚 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Frontend should connect to: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS allowed origin: ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('==========================================');
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Try: netstat -ano | findstr :3001');
        console.log('💡 Or change the PORT in .env file');
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

module.exports = app;
