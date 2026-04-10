import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI } from '../../services/api';

const VerifyDocument = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file to verify');
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await companyAPI.verifyDocument(formData);
      setResult(response.data.verification);
    } catch (error) {
      alert('Error verifying document: ' + (error.response?.data?.error || error.message));
    } finally {
      setVerifying(false);
    }
  };

  const getResultColor = (result) => {
    if (result === 'verified') return 'bg-green-50 border-green-500 text-green-900';
    if (result === 'fake') return 'bg-red-50 border-red-500 text-red-900';
    return 'bg-yellow-50 border-yellow-500 text-yellow-900';
  };

  const getResultIcon = (result) => {
    if (result === 'verified') return '✅';
    if (result === 'fake') return '❌';
    return '⚠️';
  };

  const getResultMessage = (result) => {
    if (result === 'verified') return 'Document Verified - Original Certificate';
    if (result === 'fake') return 'Verification Failed - Fake or Tampered Document';
    return 'Document Not Found - Not in Blockchain Database';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/company/dashboard')}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/company/history')}
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Certificate Verification
          </h1>
          <p className="text-lg text-gray-600">
            Upload a student certificate to verify its authenticity using blockchain technology
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">How Verification Works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>System generates SHA-256 hash from your uploaded document</li>
                  <li>Hash is compared with blockchain-stored hashes</li>
                  <li>If hashes match, document is verified as original</li>
                  <li>If no match found, document may be fake or not registered</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Certificate to Verify
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
              />
              {file && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                verifying
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {verifying ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying with Blockchain...
                </span>
              ) : (
                '🔐 Verify Certificate'
              )}
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {result && (
          <div className={`rounded-xl shadow-lg p-8 border-4 ${getResultColor(result.result)}`}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getResultIcon(result.result)}</div>
              <h2 className="text-3xl font-bold mb-2">
                {getResultMessage(result.result)}
              </h2>
            </div>

            {/* Hash Information */}
            <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Document Hash (SHA-256)</h3>
              <code className="block bg-gray-900 text-green-400 p-3 rounded font-mono text-sm break-all">
                {result.hash}
              </code>
            </div>

            {/* Student Information (if verified) */}
            {result.result === 'verified' && result.studentInfo && (
              <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">Certificate Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-semibold">{result.studentInfo.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Academic Year</p>
                    <p className="font-semibold">{result.studentInfo.academicYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="font-semibold">{result.studentInfo.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Document Type</p>
                    <p className="font-semibold">{result.studentInfo.documentType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Document Title</p>
                    <p className="font-semibold">{result.studentInfo.documentTitle}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Verification */}
            {result.blockchainVerification && (
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🔗 Blockchain Verification</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <span className="font-semibold">
                      {result.blockchainVerification.blockchainVerified ? '✅ Verified on Blockchain' : '❌ Not Verified'}
                    </span>
                  </div>
                  {result.blockchainVerification.timestamp > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Stored On:</span>
                      <span className="font-semibold">
                        {new Date(result.blockchainVerification.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  document.querySelector('input[type="file"]').value = '';
                }}
                className="flex-1 py-3 px-6 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Verify Another Document
              </button>
              <button
                onClick={() => navigate('/company/history')}
                className="flex-1 py-3 px-6 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
              >
                View Verification History
              </button>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Certificate Verification Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold text-orange-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Document Upload</h3>
                <p className="text-gray-600 text-sm">
                  Upload the certificate you want to verify. Supported formats include PDF, JPG, PNG, DOC, and DOCX.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold text-orange-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hash Generation</h3>
                <p className="text-gray-600 text-sm">
                  The system generates a unique SHA-256 cryptographic hash from the uploaded document.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold text-orange-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Blockchain Comparison</h3>
                <p className="text-gray-600 text-sm">
                  The generated hash is compared with hashes stored on the Ethereum blockchain by verified colleges.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold text-orange-600">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Result</h3>
                <p className="text-gray-600 text-sm">
                  Get immediate verification results with student details (if document is verified and original).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocument;
