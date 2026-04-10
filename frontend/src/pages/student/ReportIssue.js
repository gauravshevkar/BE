import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const ReportIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    documentId: '',
    issueDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDocuments();
    
    // Pre-select document if passed from ViewDocuments
    if (location.state?.document) {
      setFormData(prev => ({
        ...prev,
        documentId: location.state.document.id
      }));
    }
  }, [location]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getDocuments();
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.documentId || !formData.issueDescription.trim()) {
      alert('Please select a document and describe the issue');
      return;
    }

    setSubmitting(true);

    try {
      await studentAPI.reportIssue(formData);
      setSuccess(true);
      
      // Reset form after 2 seconds and redirect
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (error) {
      alert('Error submitting report: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDocument = documents.find(doc => doc.id === formData.documentId);

  const issueTemplates = [
    'Incorrect information in the document',
    'Document appears to be corrupted or unreadable',
    'Wrong document uploaded for me',
    'Missing or incomplete information',
    'Document title does not match content',
    'Request for document removal',
    'Other issue (please describe below)'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your issue has been reported to your college. They will review and respond soon.
          </p>
          <div className="animate-pulse text-green-600 font-medium">
            Redirecting to dashboard...
          </div>
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
              <h1 className="text-xl font-bold text-gray-900">Report an Issue</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Report Document Issue</h2>
          <p className="text-gray-600">
            Found a problem with one of your documents? Let your college know and they'll address it.
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <span className="text-orange-500 text-2xl mr-3">⚠️</span>
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">Before reporting an issue:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure the issue is with the document content, not the blockchain verification</li>
                <li>Provide detailed description to help your college understand the problem</li>
                <li>Your report will be visible only to your college administration</li>
                <li>You'll be notified once the issue is resolved</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document *
              </label>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : (
                <select
                  name="documentId"
                  value={formData.documentId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Select a document --</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} ({doc.type})
                    </option>
                  ))}
                </select>
              )}
              {documents.length === 0 && !loading && (
                <p className="mt-2 text-sm text-red-600">
                  No documents available. Please contact your college if you believe this is an error.
                </p>
              )}
            </div>

            {/* Selected Document Preview */}
            {selectedDocument && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Selected Document:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-medium">Title:</span> {selectedDocument.title}</p>
                  <p><span className="font-medium">Type:</span> {selectedDocument.type}</p>
                  <p><span className="font-medium">Uploaded:</span> {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> {selectedDocument.status}</p>
                </div>
              </div>
            )}

            {/* Issue Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Common Issues (Click to use as template)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {issueTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, issueDescription: template })}
                    className="text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe the Issue *
              </label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Please describe the issue in detail. Include any relevant information that will help your college understand and resolve the problem..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              ></textarea>
              <p className="mt-2 text-sm text-gray-500">
                {formData.issueDescription.length} characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.documentId || !formData.issueDescription.trim()}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  submitting || !formData.documentId || !formData.issueDescription.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Report...
                  </span>
                ) : (
                  '🚨 Submit Issue Report'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Need More Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">●</span>
              <p>
                <strong>Response Time:</strong> Your college typically responds to reports within 2-3 business days
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">●</span>
              <p>
                <strong>Tracking:</strong> You can check the status of your reports from your dashboard
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">●</span>
              <p>
                <strong>Privacy:</strong> Your report is confidential and visible only to authorized college staff
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">●</span>
              <p>
                <strong>Contact:</strong> For urgent issues, contact your college administration directly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;