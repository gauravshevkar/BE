const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, Document, IssueReport, Company, VerificationHistory } = require('../models');
const { generateFileHash, verifyHashFromBlockchain } = require('../utils/blockchain');
const fs = require('fs').promises;

// ============ STUDENT CONTROLLER ============

/**
 * Student Login
 */
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const student = await Student.findOne({ email }).populate('collegeId', 'collegeName');
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      student: {
        id: student._id,
        studentName: student.studentName,
        grNumber: student.grNumber,
        email: student.email,
        academicYear: student.academicYear,
        branch: student.branch,
        college: student.collegeId.collegeName
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Get Student's Documents
 */
const getStudentDocuments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const documents = await Document.find({ 
      studentId, 
      status: { $in: ['uploaded', 'verified'] }
    })
    .select('documentTitle documentType sha256Hash uploadedAt blockchainTxHash blockchainTimestamp status')
    .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.documentTitle,
        type: doc.documentType,
        hash: doc.sha256Hash,
        uploadedAt: doc.uploadedAt,
        blockchainHash: doc.blockchainTxHash,
        blockchainTimestamp: doc.blockchainTimestamp,
        status: doc.status
      }))
    });
  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({ error: 'Server error fetching documents' });
  }
};

/**
 * Report Issue with Document
 */
const reportIssue = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { documentId, issueDescription } = req.body;

    if (!documentId || !issueDescription) {
      return res.status(400).json({ error: 'Document ID and issue description are required' });
    }

    // Verify document belongs to student
    const document = await Document.findOne({ _id: documentId, studentId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Create issue report
    const report = new IssueReport({
      studentId,
      documentId,
      collegeId: document.collegeId,
      issueDescription,
      status: 'pending'
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      report: {
        id: report._id,
        status: report.status,
        reportedAt: report.reportedAt
      }
    });
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({ error: 'Server error reporting issue' });
  }
};

/**
 * Get Student's Issue Reports
 */
const getStudentReports = async (req, res) => {
  try {
    const studentId = req.user.id;

    const reports = await IssueReport.find({ studentId })
      .populate('documentId', 'documentTitle documentType')
      .sort({ reportedAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
};

// ============ COMPANY CONTROLLER ============

/**
 * Company Registration
 */
const companyRegister = async (req, res) => {
  try {
    const { companyName, companyEmail, password, contactPerson, contactNumber, address } = req.body;

    if (!companyName || !companyEmail || !password || !contactPerson || !contactNumber || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if company exists
    const existingCompany = await Company.findOne({ companyEmail });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const company = new Company({
      companyName,
      companyEmail,
      password: hashedPassword,
      contactPerson,
      contactNumber,
      address
    });

    await company.save();

    res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      company: {
        id: company._id,
        companyName: company.companyName,
        companyEmail: company.companyEmail
      }
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * Company Login
 */
const companyLogin = async (req, res) => {
  try {
    const { companyEmail, password } = req.body;

    if (!companyEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const company = await Company.findOne({ companyEmail });
    if (!company) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    company.lastLogin = new Date();
    await company.save();

    const token = jwt.sign(
      { id: company._id, role: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      company: {
        id: company._id,
        companyName: company.companyName,
        companyEmail: company.companyEmail
      }
    });
  } catch (error) {
    console.error('Company login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Verify Document
 */
const verifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    const companyId = req.user.id;

    // Generate hash of uploaded document
    const fileBuffer = await fs.readFile(req.file.path);
    const uploadedHash = generateFileHash(fileBuffer);

    // Search for document with matching hash
    const matchedDocument = await Document.findOne({ 
      sha256Hash: uploadedHash,
      status: { $in: ['uploaded', 'verified'] }
    }).populate('studentId', 'studentName academicYear branch');

    let verificationResult;
    let studentInfo = null;
    let blockchainVerification = null;

    if (!matchedDocument) {
      verificationResult = 'not_found';
    } else {
      studentInfo = {
        studentName: matchedDocument.studentId.studentName,
        academicYear: matchedDocument.studentId.academicYear,
        branch: matchedDocument.studentId.branch,
        documentTitle: matchedDocument.documentTitle,
        documentType: matchedDocument.documentType
      };

      // Verify on blockchain
      const blockchainResult = await verifyHashFromBlockchain(
        matchedDocument.studentId._id.toString(),
        matchedDocument._id.toString(),
        uploadedHash
      );

      blockchainVerification = blockchainResult;

      if (blockchainResult.success && blockchainResult.isValid) {
        verificationResult = 'verified';
      } else {
        verificationResult = 'fake';
      }
    }

    // Save verification history
    const history = new VerificationHistory({
      companyId,
      studentName: studentInfo?.studentName || 'Unknown',
      branch: studentInfo?.branch || 'Unknown',
      academicYear: studentInfo?.academicYear || 'Unknown',
      documentHash: uploadedHash,
      verificationResult,
      documentTitle: studentInfo?.documentTitle,
      matchedDocument: matchedDocument?._id
    });

    await history.save();

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(() => {});

    res.json({
      success: true,
      verification: {
        result: verificationResult,
        hash: uploadedHash,
        studentInfo,
        blockchainVerification,
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Verify document error:', error);
    
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({ error: 'Server error during verification' });
  }
};

/**
 * Get Verification History (Last 10)
 */
const getVerificationHistory = async (req, res) => {
  try {
    const companyId = req.user.id;

    const history = await VerificationHistory.find({ companyId })
      .select('studentName branch academicYear verificationResult verifiedAt documentTitle')
      .sort({ verifiedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({ error: 'Server error fetching history' });
  }
};

module.exports = {
  // Student exports
  studentLogin,
  getStudentDocuments,
  reportIssue,
  getStudentReports,
  
  // Company exports
  companyRegister,
  companyLogin,
  verifyDocument,
  getVerificationHistory
};
