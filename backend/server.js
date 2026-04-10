const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const { adminRouter, collegeRouter, studentRouter, companyRouter } = require('./routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', adminRouter);
app.use('/api/college', collegeRouter);
app.use('/api/student', studentRouter);
app.use('/api/company', companyRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    // Check blockchain connection
    const { checkBlockchainConnection } = require('./utils/blockchain');
    const blockchainStatus = await checkBlockchainConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: dbStatus,
      blockchain: blockchainStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Certificate Verification System API',
    version: '1.0.0',
    endpoints: {
      admin: '/api/admin',
      college: '/api/college',
      student: '/api/student',
      company: '/api/company',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB connected successfully');
    
    // Create default admin if doesn't exist
    await createDefaultAdmin();
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const { Admin } = require('./models');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await Admin.findOne({ username: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@certificateverification.com'
      });
      
      await admin.save();
      console.log('✓ Default admin created (username: admin, password: admin123)');
      console.log('⚠ Please change the default password immediately!');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  Certificate Verification System API  ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
    console.log(`\nAvailable Portals:`);
    console.log(`  - Admin:   http://localhost:${PORT}/api/admin`);
    console.log(`  - College: http://localhost:${PORT}/api/college`);
    console.log(`  - Student: http://localhost:${PORT}/api/student`);
    console.log(`  - Company: http://localhost:${PORT}/api/company`);
    console.log(`\n────────────────────────────────────────\n`);
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

startServer();

module.exports = app;
