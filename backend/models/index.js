const mongoose = require('mongoose');

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// College Schema
const collegeSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true
  },
  collegeCode: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  ethereumAddress: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: 'pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// GR Number Schema (Master List)
const grNumberSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  grNumber: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    enum: ['FE', 'SE', 'TE', 'BE']
  },
  branch: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure GR number is unique per college
grNumberSchema.index({ collegeId: 1, grNumber: 1 }, { unique: true });

// Student Schema
const studentSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  grNumber: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    enum: ['FE', 'SE', 'TE', 'BE']
  },
  branch: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Compound index for college-specific GR number uniqueness
studentSchema.index({ collegeId: 1, grNumber: 1 }, { unique: true });

// Document Schema
const documentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  documentTitle: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'Semester Result',
      'Degree Certificate',
      'Hackathon Certificate',
      'Competition Certificate',
      'Course Certificate',
      'Other'
    ]
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  sha256Hash: {
    type: String,
    required: true,
    unique: true
  },
  blockchainTxHash: {
    type: String
  },
  blockchainTimestamp: {
    type: Number
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  },
  status: {
    type: String,
    enum: ['uploaded', 'verified', 'removed'],
    default: 'uploaded'
  }
});

// Issue Report Schema
const issueReportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  issueDescription: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'],
    default: 'pending'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String
  }
});

// Company Schema
const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  companyEmail: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Verification History Schema
const verificationHistorySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  documentHash: {
    type: String,
    required: true
  },
  verificationResult: {
    type: String,
    enum: ['verified', 'fake', 'not_found'],
    required: true
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  },
  documentTitle: {
    type: String
  },
  matchedDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }
});

// Create and export models
const Admin = mongoose.model('Admin', adminSchema);
const College = mongoose.model('College', collegeSchema);
const GRNumber = mongoose.model('GRNumber', grNumberSchema);
const Student = mongoose.model('Student', studentSchema);
const Document = mongoose.model('Document', documentSchema);
const IssueReport = mongoose.model('IssueReport', issueReportSchema);
const Company = mongoose.model('Company', companySchema);
const VerificationHistory = mongoose.model('VerificationHistory', verificationHistorySchema);

module.exports = {
  Admin,
  College,
  GRNumber,
  Student,
  Document,
  IssueReport,
  Company,
  VerificationHistory
};
