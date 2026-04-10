const crypto = require('crypto');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Generate SHA-256 hash from file buffer
 */
const generateFileHash = (fileBuffer) => {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

/**
 * Generate SHA-256 hash from file path
 */
const generateFileHashFromPath = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return generateFileHash(fileBuffer);
};

const initializeBlockchain = () => {
  try {
    console.log('🔗 Initializing blockchain...');
    
    // Try to load contract data from deployed file
    const contractDataPath = path.join(
      __dirname,
      '../../blockchain/artifacts/deployed/CertificateVerification.json'
    );
    
    let contractData;
    if (fs.existsSync(contractDataPath)) {
      console.log('✅ Found deployed contract file');
      contractData = JSON.parse(fs.readFileSync(contractDataPath, 'utf8'));
      console.log('📄 Contract Address from file:', contractData.address);
    } else {
      console.log('⚠️ Deployed contract file not found, using environment variables');
      
      // Fallback to environment variable
      if (!process.env.CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS not found in environment variables. Please deploy the contract first.');
      }
      
      // Load ABI from compiled contract
      const compiledContractPath = path.join(
        __dirname,
        '../../blockchain/artifacts/contracts/CertificateVerification.sol/CertificateVerification.json'
      );
      
      if (fs.existsSync(compiledContractPath)) {
        const compiledContract = JSON.parse(fs.readFileSync(compiledContractPath, 'utf8'));
        contractData = {
          address: process.env.CONTRACT_ADDRESS,
          abi: compiledContract.abi
        };
        console.log('📄 Using ABI from compiled contract');
      } else {
        throw new Error('Contract ABI not found. Please compile the contract first: npx hardhat compile');
      }
    }

    console.log('🌐 Connecting to network:', process.env.ETHEREUM_NETWORK || 'http://localhost:8545');
    
    // Initialize provider
    const provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_NETWORK || 'http://localhost:8545'
    );

    console.log('🔑 Loading wallet...');
    
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }

    // Initialize wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('📝 Wallet address:', wallet.address);

    // Initialize contract
    const contract = new ethers.Contract(
      contractData.address,
      contractData.abi,
      wallet
    );

    console.log('✅ Blockchain initialized successfully');
    console.log('   Contract:', contractData.address);
    console.log('   Network:', process.env.ETHEREUM_NETWORK || 'http://localhost:8545');

    return { provider, wallet, contract, contractAddress: contractData.address };
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error.message);
    throw error;
  }
};

/**
 * Store document hash on blockchain
 */
/**
 * Store document hash on blockchain
 */
const storeHashOnBlockchain = async (studentId, documentId, documentHash) => {
  try {
    console.log('🔗 Initializing blockchain connection...');
    const { contract } = initializeBlockchain();
    
    console.log('📤 Sending transaction to blockchain...');
    console.log('   Student ID:', studentId);
    console.log('   Document ID:', documentId);
    console.log('   Hash:', documentHash);
    
    // Call smart contract function
    const tx = await contract.storeDocumentHash(
      studentId.toString(),
      documentId.toString(),
      documentHash
    );
    
    console.log('⏳ Transaction sent, hash:', tx.hash);
    console.log('   Waiting for confirmation...');
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    console.log('✅ Transaction confirmed!');
    console.log('   Block number:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('❌ Blockchain storage error:', error.message);
    console.error('   Full error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


/**
 * Verify document hash from blockchain
 */
const verifyHashFromBlockchain = async (studentId, documentId, providedHash) => {
  try {
    const { contract } = initializeBlockchain();
    
    // Call smart contract function
    const [isValid, timestamp] = await contract.verifyDocument(
      studentId.toString(),
      documentId.toString(),
      providedHash
    );
    
    return {
      success: true,
      isValid,
      timestamp: timestamp ? Number(timestamp) : 0,
      blockchainVerified: true
    };
  } catch (error) {
    console.error('Blockchain verification error:', error.message);
    return {
      success: false,
      error: error.message,
      blockchainVerified: false
    };
  }
};

/**
 * Get document hash from blockchain
 */
const getHashFromBlockchain = async (studentId, documentId) => {
  try {
    const { contract } = initializeBlockchain();
    
    // Call smart contract function
    const [documentHash, timestamp, exists] = await contract.getDocumentHash(
      studentId.toString(),
      documentId.toString()
    );
    
    if (!exists) {
      return {
        success: false,
        error: 'Document not found on blockchain'
      };
    }
    
    return {
      success: true,
      hash: documentHash,
      timestamp: Number(timestamp),
      exists
    };
  } catch (error) {
    console.error('Blockchain fetch error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if blockchain is connected
 */
const checkBlockchainConnection = async () => {
  try {
    const { provider } = initializeBlockchain();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    return {
      connected: true,
      network: network.name,
      chainId: Number(network.chainId),
      blockNumber
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  generateFileHash,
  generateFileHashFromPath,
  initializeBlockchain,
  storeHashOnBlockchain,
  verifyHashFromBlockchain,
  getHashFromBlockchain,
  checkBlockchainConnection
};
