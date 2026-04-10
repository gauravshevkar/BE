const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, College, Student } = require('../models');

/**
 * Admin Login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Get all colleges with pagination and filtering
 */
const getColleges = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { collegeName: { $regex: search, $options: 'i' } },
        { collegeCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const colleges = await College.find(filter)
      .select('-password')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('approvedBy', 'username email');

    const total = await College.countDocuments(filter);

    res.json({
      success: true,
      colleges,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Server error fetching colleges' });
  }
};

/**
 * Get college by ID with student count
 */
const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id)
      .select('-password')
      .populate('approvedBy', 'username email');

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Get student count
    const studentCount = await Student.countDocuments({ collegeId: id });

    res.json({
      success: true,
      college,
      studentCount
    });
  } catch (error) {
    console.error('Get college error:', error);
    res.status(500).json({ error: 'Server error fetching college' });
  }
};

/**
 * Approve college
 */
const approveCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    if (college.status === 'approved') {
      return res.status(400).json({ error: 'College is already approved' });
    }

    college.status = 'approved';
    college.approvedDate = new Date();
    college.approvedBy = req.user.id;
    await college.save();

    res.json({
      success: true,
      message: 'College approved successfully',
      college: {
        id: college._id,
        collegeName: college.collegeName,
        status: college.status,
        approvedDate: college.approvedDate
      }
    });
  } catch (error) {
    console.error('Approve college error:', error);
    res.status(500).json({ error: 'Server error approving college' });
  }
};

/**
 * Block college
 */
const blockCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    college.status = 'blocked';
    await college.save();

    res.json({
      success: true,
      message: 'College blocked successfully',
      college: {
        id: college._id,
        collegeName: college.collegeName,
        status: college.status
      }
    });
  } catch (error) {
    console.error('Block college error:', error);
    res.status(500).json({ error: 'Server error blocking college' });
  }
};

/**
 * Delete/Remove college
 */
const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Check if college has students
    const studentCount = await Student.countDocuments({ collegeId: id });
    if (studentCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete college with existing students',
        studentCount
      });
    }

    await College.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ error: 'Server error deleting college' });
  }
};

/**
 * Get students for a specific college
 */
const getCollegeStudents = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { year, branch, search, page = 1, limit = 20 } = req.query;

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Build filter
    const filter = { collegeId };
    if (year) filter.academicYear = year;
    if (branch) filter.branch = branch;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { grNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await Student.find(filter)
      .select('-password')
      .sort({ academicYear: 1, branch: 1, rollNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      college: {
        id: college._id,
        name: college.collegeName,
        code: college.collegeCode
      },
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get college students error:', error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalColleges = await College.countDocuments();
    const approvedColleges = await College.countDocuments({ status: 'approved' });
    const pendingColleges = await College.countDocuments({ status: 'pending' });
    const blockedColleges = await College.countDocuments({ status: 'blocked' });
    const totalStudents = await Student.countDocuments();

    // Get recent registrations
    const recentColleges = await College.find({ status: 'pending' })
      .select('collegeName email registrationDate')
      .sort({ registrationDate: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalColleges,
        approvedColleges,
        pendingColleges,
        blockedColleges,
        totalStudents
      },
      recentColleges
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
};

module.exports = {
  login,
  getColleges,
  getCollegeById,
  approveCollege,
  blockCollege,
  deleteCollege,
  getCollegeStudents,
  getDashboardStats
};
