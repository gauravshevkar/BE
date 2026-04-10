import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

const ViewDocuments = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-refresh for pending documents
  useEffect(() => {
    const pendingDocs = documents.filter(doc => doc.status === 'uploaded');
    
    if (pendingDocs.length > 0 && !refreshing) {
      console.log(`Found ${pendingDocs.length} pending documents, auto-refreshing...`);
      const timer = setTimeout(() => {
        fetchDocuments(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [documents, refreshing]);

  const fetchDocuments = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      const response = await studentAPI.getDocuments();
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.type === filter;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.type))];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Hash copied to clipboard!');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return {
          class: 'bg-green-100 text-green-800',
          icon: '✅',
          text: 'Verified on Blockchain'
        };
      case 'uploaded':
        return {
          class: 'bg-yellow-100 text-yellow-800',
          icon: '🔄',
          text: 'Blockchain Verification Pending'
        };
      default:
        return {
          class: 'bg-gray-100 text-gray-800',
          icon: '⏳',
          text: 'Processing'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-gray-900">My Documents</h1>
            </div>
            <div className="flex items-center space-x-4">
              {refreshing && (
                <span className="text-sm text-blue-600 flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking verification...
                </span>
              )}
              <button
                onClick={() => fetchDocuments()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Refresh
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Academic Documents</h2>
          <p className="text-gray-600">
            All documents are secured and verified on the Ethereum blockchain
          </p>
        </div>

        {/* Status Alert for Pending Documents */}
        {documents.some(doc => doc.status === 'uploaded') && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⏳</span>
              <div>
                <p className="font-semibold text-yellow-800">Blockchain Verification in Progress</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Some documents are being verified on the blockchain. This usually takes a few seconds. 
                  The page will auto-refresh.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Documents ({documents.length})
            </button>
            {documentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type} ({documents.filter(d => d.type === type).length})
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Your college has not uploaded any documents yet'
                : `No ${filter} documents available`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((doc, index) => {
              const statusInfo = getStatusBadge(doc.status);
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-200"
                >
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Uploaded:</span>{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Blockchain Hash */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔐 Blockchain Hash (SHA-256)
                    </label>
                    <div className="bg-gray-900 rounded-lg p-3 relative group">
                      <code className="text-green-400 text-xs font-mono break-all block">
                        {doc.hash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(doc.hash)}
                        className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Blockchain Info */}
                  {doc.blockchainHash && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📜 Transaction Hash
                      </label>
                      <code className="text-xs bg-blue-50 text-blue-800 p-2 rounded block break-all">
                        {doc.blockchainHash}
                      </code>
                    </div>
                  )}

                  {/* Blockchain Timestamp */}
                  {doc.blockchainTimestamp && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Blockchain Verification:</span>{' '}
                        {new Date(doc.blockchainTimestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/student/report-issue', { state: { document: doc } })}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <span className="text-3xl mr-4">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About Blockchain Verification</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Each document has a unique SHA-256 hash stored on the Ethereum blockchain</li>
                <li>• This hash acts as a digital fingerprint that proves authenticity</li>
                <li>• Employers can verify your certificates instantly using the hash</li>
                <li>• Documents cannot be tampered with once verified on the blockchain</li>
                <li>• Verification usually completes within 10-30 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Document Detail Modal - Same as before */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Document Details</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                <p className="text-lg font-semibold text-gray-900">{selectedDoc.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                <p className="text-gray-900">{selectedDoc.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                {(() => {
                  const statusInfo = getStatusBadge(selectedDoc.status);
                  return (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">SHA-256 Hash</label>
                <div className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-400 text-xs font-mono break-all block">
                    {selectedDoc.hash}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedDoc.hash)}
                  className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  📋 Copy Hash
                </button>
              </div>

              {selectedDoc.blockchainHash && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Hash</label>
                  <code className="text-xs bg-blue-50 text-blue-800 p-2 rounded block break-all">
                    {selectedDoc.blockchainHash}
                  </code>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Uploaded On</label>
                <p className="text-gray-900">
                  {new Date(selectedDoc.uploadedAt).toLocaleString()}
                </p>
              </div>

              {selectedDoc.blockchainTimestamp && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Verified On Blockchain</label>
                  <p className="text-gray-900">
                    {new Date(selectedDoc.blockchainTimestamp * 1000).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  navigate('/student/report-issue', { state: { document: selectedDoc } });
                }}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-medium"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;