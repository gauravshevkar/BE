const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const { College, GRNumber, Student, Document, IssueReport } = require('../models');
const { generateFileHash, storeHashOnBlockchain } = require('../utils/blockchain');
const fs = require('fs').promises;
const path = require('path');

/**
 * College Registration
 */
const register = async (req, res) => {
  try {
    const { collegeName, collegeCode, email, password, address, contactNumber } = req.body;

    // Validate input
    if (!collegeName || !collegeCode || !email || !password || !address || !contactNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if college already exists
    const existingCollege = await College.findOne({ 
      $or: [{ email }, { collegeCode }] 
    });
    
    if (existingCollege) {
      return res.status(400).json({ error: 'College with this email or code already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create college
    const college = new College({
      collegeName,
      collegeCode,
      email,
      password: hashedPassword,
      address,
      contactNumber,
      status: 'pending'
    });

    await college.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      college: {
        id: college._id,
        collegeName: college.collegeName,
        collegeCode: college.collegeCode,
        status: college.status
      }
    });
  } catch (error) {
    console.error('College registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * College Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const college = await College.findOne({ email });
    if (!college) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if college is approved
    if (college.status === 'pending') {
      return res.status(403).json({ 
        error: 'Your registration is pending admin approval',
        status: 'pending'
      });
    }

    if (college.status === 'blocked') {
      return res.status(403).json({ 
        error: 'Your account has been blocked. Contact admin.',
        status: 'blocked'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, college.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: college._id, role: 'college' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      college: {
        id: college._id,
        collegeName: college.collegeName,
        collegeCode: college.collegeCode,
        email: college.email,
        status: college.status
      }
    });
  } catch (error) {
    console.error('College login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Upload GR Number Master List (Excel)
 */
const uploadGRList = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Excel file is required' });
    }

    const collegeId = req.user.id;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const grNumbers = [];
    const errors = [];

    // Process each worksheet (could be year-wise or branch-wise)
    workbook.eachSheet((worksheet, sheetId) => {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const grNumber = row.getCell(1).value?.toString().trim();
        const academicYear = row.getCell(2).value?.toString().trim();
        const branch = row.getCell(3).value?.toString().trim();

        if (!grNumber || !academicYear || !branch) {
          errors.push(`Row ${rowNumber}: Missing required fields`);
          return;
        }

        if (!['FE', 'SE', 'TE', 'BE'].includes(academicYear)) {
          errors.push(`Row ${rowNumber}: Invalid academic year (must be FE/SE/TE/BE)`);
          return;
        }

        grNumbers.push({
          collegeId,
          grNumber,
          academicYear,
          branch
        });
      });
    });

    if (errors.length > 0) {
      await fs.unlink(req.file.path); // Delete uploaded file
      return res.status(400).json({ 
        error: 'Invalid data in Excel file',
        errors: errors.slice(0, 10) // Show first 10 errors
      });
    }

    // Delete existing GR numbers for this college (re-upload scenario)
    await GRNumber.deleteMany({ collegeId });

    // Insert new GR numbers
    const insertedGRs = await GRNumber.insertMany(grNumbers, { ordered: false });

    // Delete the uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      message: 'GR list uploaded successfully',
      count: insertedGRs.length
    });
  } catch (error) {
    console.error('Upload GR list error:', error);
    
    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({ error: 'Server error uploading GR list' });
  }
};

/**
 * Get GR Numbers for dropdown (filtered by year and branch)
 */
const getGRNumbers = async (req, res) => {
  try {
    const { academicYear, branch } = req.query;
    const collegeId = req.user.id;

    const filter = { collegeId, isUsed: false };
    if (academicYear) filter.academicYear = academicYear;
    if (branch) filter.branch = branch;

    const grNumbers = await GRNumber.find(filter)
      .select('grNumber academicYear branch')
      .sort({ academicYear: 1, branch: 1, grNumber: 1 });

    res.json({
      success: true,
      grNumbers
    });
  } catch (error) {
    console.error('Get GR numbers error:', error);
    res.status(500).json({ error: 'Server error fetching GR numbers' });
  }
};

/**
 * Create Student Credentials
 */
const createStudent = async (req, res) => {
  try {
    const { grNumber, studentName, email, academicYear, branch, rollNumber, password } = req.body;
    const collegeId = req.user.id;

    // Validate input
    if (!grNumber || !studentName || !email || !academicYear || !branch || !rollNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if GR number exists and is unused
    const grRecord = await GRNumber.findOne({ 
      collegeId, 
      grNumber, 
      isUsed: false 
    });

    if (!grRecord) {
      return res.status(400).json({ 
        error: 'GR number not found or already used' 
      });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = new Student({
      collegeId,
      grNumber,
      studentName,
      email,
      password: hashedPassword,
      academicYear,
      branch,
      rollNumber
    });

    await student.save();

    // Mark GR number as used
    grRecord.isUsed = true;
    await grRecord.save();

    res.status(201).json({
      success: true,
      message: 'Student credentials created successfully',
      student: {
        id: student._id,
        grNumber: student.grNumber,
        studentName: student.studentName,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Server error creating student' });
  }
};

//*** Upload Document for Student - WITH SYNCHRONOUS BLOCKCHAIN VERIFICATION */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    const { studentId, documentTitle, documentType } = req.body;
    const collegeId = req.user.id;

    // Validate student belongs to this college
    const student = await Student.findOne({ _id: studentId, collegeId });
    if (!student) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Student not found or does not belong to your college' });
    }

    // Generate SHA-256 hash
    const fileBuffer = await fs.readFile(req.file.path);
    const sha256Hash = generateFileHash(fileBuffer);

    // Check for duplicate hash
    const existingDoc = await Document.findOne({ sha256Hash });
    if (existingDoc) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        error: 'Document with identical hash already exists (duplicate)' 
      });
    }

    // Create document entry
    const document = new Document({
      studentId,
      collegeId,
      documentTitle,
      documentType,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      sha256Hash,
      uploadedBy: collegeId,
      status: 'uploaded'
    });

    await document.save();

    console.log('📄 Document saved to MongoDB, now storing on blockchain...');

    // CRITICAL FIX: Store on blockchain SYNCHRONOUSLY (wait for completion)
    try {
      const blockchainResult = await storeHashOnBlockchain(
        studentId, 
        document._id.toString(), 
        sha256Hash
      );

      if (blockchainResult.success) {
        console.log('✅ Blockchain storage successful:', blockchainResult.transactionHash);
        
        // Update document with blockchain info and mark as verified
        document.blockchainTxHash = blockchainResult.transactionHash;
        document.blockchainTimestamp = Math.floor(Date.now() / 1000);
        document.status = 'verified'; // MARK AS VERIFIED
        await document.save();

        console.log('✅ Document marked as verified in MongoDB');

        return res.status(201).json({
          success: true,
          message: 'Document uploaded and verified on blockchain successfully!',
          document: {
            id: document._id,
            documentTitle: document.documentTitle,
            sha256Hash: document.sha256Hash,
            uploadedAt: document.uploadedAt,
            status: 'verified',
            blockchainTxHash: blockchainResult.transactionHash,
            blockchainTimestamp: Math.floor(Date.now() / 1000)
          }
        });
      } else {
        console.error('❌ Blockchain storage failed:', blockchainResult.error);
        
        return res.status(201).json({
          success: true,
          message: 'Document uploaded but blockchain verification failed. Will retry automatically.',
          document: {
            id: document._id,
            documentTitle: document.documentTitle,
            sha256Hash: document.sha256Hash,
            uploadedAt: document.uploadedAt,
            status: 'uploaded'
          },
          warning: 'Blockchain verification failed: ' + blockchainResult.error
        });
      }
    } catch (blockchainError) {
      console.error('❌ Blockchain error:', blockchainError);
      
      return res.status(201).json({
        success: true,
        message: 'Document uploaded but blockchain verification encountered an error.',
        document: {
          id: document._id,
          documentTitle: document.documentTitle,
          sha256Hash: document.sha256Hash,
          uploadedAt: document.uploadedAt,
          status: 'uploaded'
        },
        warning: 'Blockchain error: ' + blockchainError.message
      });
    }
  } catch (error) {
    console.error('Upload document error:', error);
    
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({ error: 'Server error uploading document' });
  }
};


/**
 * Retry Blockchain Verification for Uploaded Document
 */
const retryBlockchainVerification = async (req, res) => {
  try {
    const { documentId } = req.params;
    const collegeId = req.user.id;

    // Find document
    const document = await Document.findOne({ _id: documentId, collegeId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if already verified
    if (document.status === 'verified' && document.blockchainTxHash) {
      return res.json({
        success: true,
        message: 'Document is already verified on blockchain',
        document: {
          status: 'verified',
          blockchainTxHash: document.blockchainTxHash,
          blockchainTimestamp: document.blockchainTimestamp
        }
      });
    }

    console.log('Retrying blockchain verification for document:', documentId);

    // Retry blockchain storage
    const blockchainResult = await storeHashOnBlockchain(
      document.studentId.toString(),
      document._id.toString(),
      document.sha256Hash
    );

    if (blockchainResult.success) {
      // Update document
      document.blockchainTxHash = blockchainResult.transactionHash;
      document.blockchainTimestamp = blockchainResult.timestamp;
      document.status = 'verified';
      await document.save();

      return res.json({
        success: true,
        message: 'Document successfully verified on blockchain!',
        document: {
          status: 'verified',
          blockchainTxHash: blockchainResult.transactionHash,
          blockchainTimestamp: blockchainResult.timestamp
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Blockchain verification failed: ' + blockchainResult.error
      });
    }
  } catch (error) {
    console.error('Retry verification error:', error);
    res.status(500).json({ error: 'Server error retrying verification' });
  }
};


/**
 * Check and Update Document Verification Status
 */
const checkDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;
    const collegeId = req.user.id;

    const document = await Document.findOne({ _id: documentId, collegeId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // If already verified, return status
    if (document.status === 'verified' && document.blockchainTxHash) {
      return res.json({
        success: true,
        status: 'verified',
        blockchainTxHash: document.blockchainTxHash,
        blockchainTimestamp: document.blockchainTimestamp
      });
    }

    // Check blockchain status
    const blockchainCheck = await getHashFromBlockchain(
      document.studentId.toString(),
      document._id.toString()
    );

    if (blockchainCheck.success && blockchainCheck.exists) {
      // Update document status
      document.status = 'verified';
      document.blockchainTimestamp = blockchainCheck.timestamp;
      await document.save();

      return res.json({
        success: true,
        status: 'verified',
        blockchainTimestamp: blockchainCheck.timestamp
      });
    }

    res.json({
      success: true,
      status: document.status
    });
  } catch (error) {
    console.error('Check document status error:', error);
    res.status(500).json({ error: 'Server error checking status' });
  }
};


/**
 * Get Students (searchable and filterable)
 */
const getStudents = async (req, res) => {
  try {
    const collegeId = req.user.id;
    const { year, branch, search, page = 1, limit = 20 } = req.query;

    const filter = { collegeId };
    if (year) filter.academicYear = year;
    if (branch) filter.branch = branch;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { grNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await Student.find(filter)
      .select('-password')
      .sort({ academicYear: 1, branch: 1, rollNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get document count for each student
    const studentsWithDocCount = await Promise.all(
      students.map(async (student) => {
        const docCount = await Document.countDocuments({ 
          studentId: student._id,
          status: { $ne: 'removed' }
        });
        return {
          ...student.toObject(),
          documentCount: docCount
        };
      })
    );

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      students: studentsWithDocCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

/**
 * Get Documents for a Student
 */
const getStudentDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const collegeId = req.user.id;

    // Verify student belongs to college
    const student = await Student.findOne({ _id: studentId, collegeId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const documents = await Document.find({ 
      studentId, 
      status: { $ne: 'removed' }
    }).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.studentName,
        grNumber: student.grNumber
      },
      documents
    });
  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({ error: 'Server error fetching documents' });
  }
};

/**
 * Remove Document
 */
const removeDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const collegeId = req.user.id;

    const document = await Document.findOne({ _id: documentId, collegeId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = 'removed';
    await document.save();

    // Optionally delete physical file
    await fs.unlink(document.filePath).catch(() => {});

    res.json({
      success: true,
      message: 'Document removed successfully'
    });
  } catch (error) {
    console.error('Remove document error:', error);
    res.status(500).json({ error: 'Server error removing document' });
  }
};

/**
 * Get Issue Reports
 */
const getIssueReports = async (req, res) => {
  try {
    const collegeId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { collegeId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await IssueReport.find(filter)
      .populate('studentId', 'studentName grNumber email')
      .populate('documentId', 'documentTitle documentType')
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await IssueReport.countDocuments(filter);

    res.json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get issue reports error:', error);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
};

const viewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const collegeId = req.user.id;

    const document = await Document.findOne({ _id: documentId, collegeId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Send file
    res.sendFile(document.filePath, { root: '/' });
  } catch (error) {
    console.error('View document error:', error);
    res.status(500).json({ error: 'Server error viewing document' });
  }
};

module.exports = {
  register,
  login,
  uploadGRList,
  getGRNumbers,
  createStudent,
  uploadDocument,
  getStudents,
  getStudentDocuments,
  removeDocument,
  getIssueReports,
  viewDocument,
  checkDocumentStatus,
  retryBlockchainVerification 
};
