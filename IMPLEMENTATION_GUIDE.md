# Implementation Guide - Multi-Portal Academic Document Verification System

This guide will walk you through setting up and running the complete blockchain-based certificate verification system.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- MetaMask wallet (for blockchain interaction)
- Ganache (for local Ethereum blockchain testing)

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
# Install blockchain dependencies
cd blockchain
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup MongoDB

Start MongoDB service:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Step 3: Setup Local Blockchain

Open a new terminal and start Ganache:
```bash
npx ganache-cli
```

This will:
- Start a local Ethereum blockchain at `http://127.0.0.1:8545`
- Create 10 test accounts with 100 ETH each
- Display account addresses and private keys

**Important**: Copy the first account's private key for the next step.

### Step 4: Deploy Smart Contract

In the blockchain directory:

```bash
cd blockchain

# Compile the smart contract
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

**Important**: Copy the deployed contract address from the output.

### Step 5: Configure Backend Environment

Create `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate-verification
JWT_SECRET=your_random_secret_key_here_change_this
ETHEREUM_NETWORK=http://localhost:8545
CONTRACT_ADDRESS=<paste_deployed_contract_address_here>
PRIVATE_KEY=<paste_ganache_private_key_here>
```

### Step 6: Configure Frontend Environment

Create `.env` file in the frontend directory:

```bash
cd frontend
nano .env
```

Add:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=<paste_deployed_contract_address_here>
```

### Step 7: Start the Application

Open three separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials immediately after first login!

## 📝 Usage Workflow

### For Admin:

1. Login at `/admin/login`
2. View pending college registrations
3. Approve or block colleges
4. View college-wise student lists
5. Monitor system statistics

### For Colleges:

1. **Register**: `/college/register`
   - Fill registration form
   - Wait for admin approval

2. **After Approval**:
   - Login at `/college/login`
   - Upload GR Number master list (Excel format)
   - Create student credentials using GR dropdown
   - Upload student documents
   - View and manage students

3. **Excel Format for GR List**:
   ```
   | GR Number | Academic Year | Branch              |
   |-----------|---------------|---------------------|
   | GR001     | FE            | Computer Engineering|
   | GR002     | SE            | Mechanical Engineering|
   | GR003     | TE            | Electronics Engineering|
   ```

### For Students:

1. Login at `/student/login` (credentials provided by college)
2. View your uploaded documents
3. See blockchain hash for each document
4. Report issues with documents if needed

### For Companies:

1. **Register**: `/company/register`
2. **Login**: `/company/login`
3. **Verify Documents**:
   - Upload student certificate
   - System generates hash and compares with blockchain
   - Get instant verification result (Original/Fake/Not Found)
4. View last 10 verification history

## 🔧 Technical Architecture

### Backend Structure
```
backend/
├── controllers/        # Business logic
│   ├── adminController.js
│   ├── collegeController.js
│   └── userControllers.js
├── models/            # MongoDB schemas
├── routes/            # API endpoints
├── middleware/        # Auth & validation
├── utils/             # Blockchain utilities
└── server.js          # Express server
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Portal pages
│   │   ├── admin/
│   │   ├── college/
│   │   ├── student/
│   │   └── company/
│   ├── services/      # API integration
│   ├── context/       # State management
│   └── App.js         # Main app & routing
```

### Blockchain Structure
```
blockchain/
├── contracts/         # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/              # Contract tests
└── hardhat.config.js  # Hardhat configuration
```

## 📊 Database Collections

### Colleges
- collegeName, collegeCode, email, password
- status (pending/approved/blocked)
- ethereumAddress (optional)

### Students
- grNumber, studentName, email, password
- academicYear (FE/SE/TE/BE)
- branch, rollNumber, collegeId

### Documents
- studentId, collegeId
- documentTitle, documentType
- sha256Hash, blockchainTxHash
- filePath, uploadedAt

### GRNumbers
- collegeId, grNumber
- academicYear, branch
- isUsed (boolean)

### VerificationHistory
- companyId, studentName
- documentHash, verificationResult
- verifiedAt

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based auth for all portals
2. **Role-Based Access Control**: Strict permission system
3. **Password Hashing**: bcrypt with salt rounds
4. **Blockchain Immutability**: Tamper-proof record storage
5. **SHA-256 Hashing**: Cryptographic document fingerprinting
6. **File Validation**: Type and size restrictions
7. **Input Sanitization**: Protection against injection attacks

## 🧪 Testing the System

### Test Document Upload Flow:

1. **Admin**: Approve a college
2. **College**: 
   - Upload Excel with GR numbers
   - Create student credentials
   - Upload a test PDF certificate
3. **Student**: Login and view the uploaded document
4. **Company**: Upload the same PDF and verify it

### Expected Results:
- Document upload generates unique SHA-256 hash
- Hash stored on blockchain with transaction hash
- Student can see hash in their portal
- Company verification shows "Verified - Original"
- Uploading different file shows "Fake" or "Not Found"

## 📱 API Endpoints Reference

### Admin Endpoints
```
POST   /api/admin/login
GET    /api/admin/dashboard/stats
GET    /api/admin/colleges
PUT    /api/admin/college/approve/:id
DELETE /api/admin/college/:id
```

### College Endpoints
```
POST   /api/college/register
POST   /api/college/login
POST   /api/college/gr-list/upload
POST   /api/college/student/create
POST   /api/college/document/upload
GET    /api/college/students
```

### Student Endpoints
```
POST   /api/student/login
GET    /api/student/documents
POST   /api/student/report-issue
```

### Company Endpoints
```
POST   /api/company/register
POST   /api/company/login
POST   /api/company/verify-document
GET    /api/company/verification-history
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB status
mongosh
# or
sudo systemctl status mongod
```

### Blockchain Connection Error
- Ensure Ganache is running on port 8545
- Verify CONTRACT_ADDRESS in .env
- Check PRIVATE_KEY is correct

### CORS Errors
- Verify ALLOWED_ORIGINS in backend .env
- Ensure frontend is running on correct port

### File Upload Errors
- Check uploads directory exists and has write permissions
- Verify file size is under 10MB
- Ensure correct file types (.pdf, .jpg, .png, .doc, .docx)

## 📈 Production Deployment

### Backend (Node.js)
1. Use PM2 for process management
2. Set up nginx reverse proxy
3. Configure SSL certificates
4. Use environment-specific .env files

### Frontend (React)
1. Build production bundle: `npm run build`
2. Serve static files via nginx
3. Configure CDN for assets

### Blockchain
1. Deploy to Ethereum testnet (Sepolia) or mainnet
2. Update CONTRACT_ADDRESS in both backend and frontend
3. Fund wallet with sufficient ETH for gas fees

### MongoDB
1. Use MongoDB Atlas for cloud hosting
2. Set up database backups
3. Configure connection pooling

## 🎯 Features Summary

✅ Admin can approve/block/remove colleges
✅ College uploads GR list and creates student credentials
✅ College uploads documents → SHA-256 hash → Ethereum blockchain
✅ Students view their documents with blockchain hash
✅ Students can report document issues
✅ Companies verify documents with instant hash comparison
✅ Privacy-preserving design (Admin can't see documents)
✅ Searchable and filterable student tables
✅ Verification history tracking (last 10)
✅ Role-based authentication and authorization

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs: `backend/logs/`
3. Check blockchain transaction on Ganache UI
4. Verify MongoDB collections have correct data

## 📜 License

MIT License - See LICENSE file for details
