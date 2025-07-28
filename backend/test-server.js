// Quick server test to check port availability
// File: backend/test-server.js

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Test server is running',
    port: PORT
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
  console.log(`✅ Test server is running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
