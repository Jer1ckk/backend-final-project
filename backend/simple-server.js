// Simple server test
const express = require('express');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is working!',
    port: process.env.PORT || 3001,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API Health Check Successful',
    database: 'Ready to connect',
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3001;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🎉 Simple test server running on http://localhost:${port}`);
    console.log(`📚 Test: http://localhost:${port}/api/health`);
    console.log('🔗 Copy this URL to Firefox to test!');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use!`);
      const nextPort = port + 1;
      if (nextPort <= 3010) {
        console.log(`� Trying port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('❌ No available ports found');
      }
    } else {
      console.error('❌ Server error:', err);
    }
  });
};

startServer(PORT);
