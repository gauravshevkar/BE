const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import controllers
const adminController = require('../controllers/adminController');
const collegeController = require('../controllers/collegeController');
const { 
  studentLogin, 
  getStudentDocuments, 
  reportIssue, 
  getStudentReports,
  companyRegister,
  companyLogin,
  verifyDocument,
  getVerificationHistory
} = require('../controllers/userControllers');

// Import middleware
const { 
  verifyToken, 
  isAdmin, 
  isCollege, 
  isStudent, 
  isCompany,
  isApprovedCollege 
} = require('../middleware/auth');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
const excelDir = path.join(uploadDir, 'excel');
const documentsDir = path.join(uploadDir, 'documents');

// Create directories if they don't exist
[uploadDir, excelDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Excel file storage
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const excelUpload = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Document storage
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==================== ADMIN ROUTES ====================
const adminRouter = express.Router();

adminRouter.post('/login', adminController.login);
adminRouter.get('/dashboard/stats', verifyToken, isAdmin, adminController.getDashboardStats);
adminRouter.get('/colleges', verifyToken, isAdmin, adminController.getColleges);
adminRouter.get('/college/:id', verifyToken, isAdmin, adminController.getCollegeById);
adminRouter.put('/college/approve/:id', verifyToken, isAdmin, adminController.approveCollege);
adminRouter.put('/college/block/:id', verifyToken, isAdmin, adminController.blockCollege);
adminRouter.delete('/college/:id', verifyToken, isAdmin, adminController.deleteCollege);
adminRouter.get('/college/:collegeId/students', verifyToken, isAdmin, adminController.getCollegeStudents);

// ==================== COLLEGE ROUTES ====================
const collegeRouter = express.Router();
 
collegeRouter.post('/register', collegeController.register);
collegeRouter.post('/login', collegeController.login);
collegeRouter.post('/gr-list/upload', verifyToken, isCollege, isApprovedCollege, excelUpload.single('file'), collegeController.uploadGRList);
collegeRouter.get('/gr-numbers', verifyToken, isCollege, isApprovedCollege, collegeController.getGRNumbers);
collegeRouter.post('/student/create', verifyToken, isCollege, isApprovedCollege, collegeController.createStudent);
collegeRouter.post('/document/upload', verifyToken, isCollege, isApprovedCollege, documentUpload.single('file'), collegeController.uploadDocument);
collegeRouter.get('/students', verifyToken, isCollege, isApprovedCollege, collegeController.getStudents);
collegeRouter.get('/student/:studentId/documents', verifyToken, isCollege, isApprovedCollege, collegeController.getStudentDocuments);
collegeRouter.delete('/document/:documentId', verifyToken, isCollege, isApprovedCollege, collegeController.removeDocument);
collegeRouter.get('/issue-reports', verifyToken, isCollege, isApprovedCollege, collegeController.getIssueReports);

// ==================== STUDENT ROUTES ====================
const studentRouter = express.Router();

studentRouter.post('/login', studentLogin);
studentRouter.get('/documents', verifyToken, isStudent, getStudentDocuments);
studentRouter.post('/report-issue', verifyToken, isStudent, reportIssue);
studentRouter.get('/reports', verifyToken, isStudent, getStudentReports);

// ==================== COMPANY ROUTES ====================
const companyRouter = express.Router();

companyRouter.post('/register', companyRegister);
companyRouter.post('/login', companyLogin);
collegeRouter.post('/document/retry-verification/:documentId', verifyToken, isCollege, isApprovedCollege, collegeController.retryBlockchainVerification);
collegeRouter.get('/document/status/:documentId', verifyToken, isCollege, isApprovedCollege, collegeController.checkDocumentStatus);
collegeRouter.get('/document/view/:documentId', verifyToken, isCollege, isApprovedCollege, collegeController.viewDocument);
companyRouter.post('/verify-document', verifyToken, isCompany, documentUpload.single('file'), verifyDocument);
companyRouter.get('/verification-history', verifyToken, isCompany, getVerificationHistory);

// Export all routers
module.exports = {
  adminRouter,
  collegeRouter,
  studentRouter,
  companyRouter
};
