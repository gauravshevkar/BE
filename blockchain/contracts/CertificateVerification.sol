// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateVerification
 * @dev Smart contract for storing and verifying academic document hashes
 */
contract CertificateVerification {
    
    // Structure to store document information
    struct Document {
        string documentHash;
        uint256 timestamp;
        address uploadedBy;
        bool exists;
    }
    
    // Mapping: studentId => documentId => Document
    mapping(string => mapping(string => Document)) private documents;
    
    // Mapping: collegeAddress => authorized status
    mapping(address => bool) private authorizedColleges;
    
    // Owner of the contract (admin)
    address public owner;
    
    // Events
    event DocumentStored(
        string indexed studentId,
        string indexed documentId,
        string documentHash,
        uint256 timestamp,
        address uploadedBy
    );
    
    event CollegeAuthorized(address indexed collegeAddress);
    event CollegeRevoked(address indexed collegeAddress);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedColleges[msg.sender] || msg.sender == owner,
            "Not authorized to perform this action"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Authorize a college address to store documents
     * @param collegeAddress Address of the college to authorize
     */
    function authorizeCollege(address collegeAddress) external onlyOwner {
        require(collegeAddress != address(0), "Invalid address");
        authorizedColleges[collegeAddress] = true;
        emit CollegeAuthorized(collegeAddress);
    }
    
    /**
     * @dev Revoke authorization from a college
     * @param collegeAddress Address of the college to revoke
     */
    function revokeCollege(address collegeAddress) external onlyOwner {
        authorizedColleges[collegeAddress] = false;
        emit CollegeRevoked(collegeAddress);
    }
    
    /**
     * @dev Store document hash on blockchain
     * @param studentId Unique student identifier
     * @param documentId Unique document identifier
     * @param documentHash SHA-256 hash of the document
     */
    function storeDocumentHash(
        string memory studentId,
        string memory documentId,
        string memory documentHash
    ) external onlyAuthorized {
        require(bytes(studentId).length > 0, "Student ID cannot be empty");
        require(bytes(documentId).length > 0, "Document ID cannot be empty");
        require(bytes(documentHash).length == 64, "Invalid hash length");
        
        documents[studentId][documentId] = Document({
            documentHash: documentHash,
            timestamp: block.timestamp,
            uploadedBy: msg.sender,
            exists: true
        });
        
        emit DocumentStored(
            studentId,
            documentId,
            documentHash,
            block.timestamp,
            msg.sender
        );
    }
    
    /**
     * @dev Get document hash from blockchain
     * @param studentId Unique student identifier
     * @param documentId Unique document identifier
     * @return documentHash The stored hash
     * @return timestamp When the document was stored
     * @return exists Whether the document exists
     */
    function getDocumentHash(
        string memory studentId,
        string memory documentId
    ) external view returns (
        string memory documentHash,
        uint256 timestamp,
        bool exists
    ) {
        Document memory doc = documents[studentId][documentId];
        return (doc.documentHash, doc.timestamp, doc.exists);
    }
    
    /**
     * @dev Verify if a provided hash matches the stored hash
     * @param studentId Unique student identifier
     * @param documentId Unique document identifier
     * @param providedHash Hash to verify
     * @return isValid Whether the hash matches
     * @return timestamp When the document was originally stored
     */
    function verifyDocument(
        string memory studentId,
        string memory documentId,
        string memory providedHash
    ) external view returns (bool isValid, uint256 timestamp) {
        Document memory doc = documents[studentId][documentId];
        
        if (!doc.exists) {
            return (false, 0);
        }
        
        bool hashMatches = keccak256(bytes(doc.documentHash)) == 
                          keccak256(bytes(providedHash));
        
        return (hashMatches, doc.timestamp);
    }
    
    /**
     * @dev Check if a college is authorized
     * @param collegeAddress Address to check
     * @return authorized Whether the address is authorized
     */
    function isAuthorized(address collegeAddress) external view returns (bool) {
        return authorizedColleges[collegeAddress];
    }
    
    /**
     * @dev Check if a document exists
     * @param studentId Unique student identifier
     * @param documentId Unique document identifier
     * @return exists Whether the document exists
     */
    function documentExists(
        string memory studentId,
        string memory documentId
    ) external view returns (bool) {
        return documents[studentId][documentId].exists;
    }
}
