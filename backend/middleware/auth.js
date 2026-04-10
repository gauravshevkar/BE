const jwt = require('jsonwebtoken');

// Verify JWT token and attach user to request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin authorization middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// College authorization middleware
const isCollege = (req, res, next) => {
  if (req.user.role !== 'college') {
    return res.status(403).json({ error: 'Access denied. College only.' });
  }
  next();
};

// Student authorization middleware
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student only.' });
  }
  next();
};

// Company authorization middleware
const isCompany = (req, res, next) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ error: 'Access denied. Company only.' });
  }
  next();
};

// Check if college is approved
const isApprovedCollege = async (req, res, next) => {
  try {
    const { College } = require('../models');
    const college = await College.findById(req.user.id);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }
    
    if (college.status !== 'approved') {
      return res.status(403).json({ 
        error: 'College not approved yet. Please wait for admin approval.',
        status: college.status
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isCollege,
  isStudent,
  isCompany,
  isApprovedCollege
};
