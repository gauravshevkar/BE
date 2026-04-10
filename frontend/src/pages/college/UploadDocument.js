import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeAPI } from '../../services/api';

const UploadDocument = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    documentTitle: '',
    documentType: 'Semester Result',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [year, branch]);

  const fetchStudents = async () => {
    try {
      const response = await collegeAPI.getStudents({ year, branch });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.file) {
      alert('Please select a student and upload a file');
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      data.append('studentId', formData.studentId);
      data.append('documentTitle', formData.documentTitle);
      data.append('documentType', formData.documentType);
      data.append('file', formData.file);

      const response = await collegeAPI.uploadDocument(data);
      
      alert('Document uploaded successfully! SHA-256 hash generated and stored on blockchain.');
      
      // Reset form
      setFormData({
        studentId: '',
        documentTitle: '',
        documentType: 'Semester Result',
        file: null
      });
      document.getElementById('fileInput').value = '';
      
    } catch (error) {
      alert('Error uploading document: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    'Semester Result',
    'Degree Certificate',
    'Hackathon Certificate',
    'Competition Certificate',
    'Course Certificate',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/college/dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">📄 Upload Document</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Student Document</h2>
          
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Document Upload Process:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>SHA-256 hash is automatically generated for the uploaded file</li>
                  <li>Hash and metadata are stored on Ethereum blockchain</li>
                  <li>This ensures tamper-proof verification of certificates</li>
                  <li>Companies can instantly verify authenticity using the hash</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  <option value="FE">FE (First Year)</option>
                  <option value="SE">SE (Second Year)</option>
                  <option value="TE">TE (Third Year)</option>
                  <option value="BE">BE (Fourth Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., Computer Engineering"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.studentName} - {student.grNumber} - {student.academicYear} - {student.branch}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {students.length} student(s) found
              </p>
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={formData.documentTitle}
                onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
                placeholder="e.g., Semester 5 Result 2024"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document *
              </label>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
              {formData.file && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading & Storing on Blockchain...
                  </span>
                ) : (
                  '🔐 Upload & Store on Blockchain'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/college/students')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Blockchain Info */}
          <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🔗 Blockchain Integration</h3>
            <p className="text-sm text-purple-800">
              Once uploaded, the document's SHA-256 hash will be permanently stored on the Ethereum blockchain.
              This hash serves as a unique fingerprint that can be used to verify the document's authenticity.
              The blockchain transaction hash will be saved for reference and verification purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
