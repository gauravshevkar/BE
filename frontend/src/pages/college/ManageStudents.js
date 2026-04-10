import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeAPI } from '../../services/api';


const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: '', branch: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [selectedStudent, setSelectedStudent] = useState(null);
const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [filters, pagination.page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await collegeAPI.getStudents({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setStudents(response.data.students || []);
      setPagination({ ...pagination, ...response.data.pagination });
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDocument = async (documentId) => {
  if (!window.confirm('Are you sure you want to remove this document?')) return;
  
  try {
    await collegeAPI.removeDocument(documentId);
    alert('Document removed successfully');
    // Refresh the documents
    viewDocuments(selectedStudent.id);
  } catch (error) {
    alert('Error removing document: ' + (error.response?.data?.error || error.message));
  }
};

const handleViewDocument = (documentId) => {
  // Open document in new tab
  const token = localStorage.getItem('token');
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/college/document/view/${documentId}`;
  window.open(url + '?token=' + token, '_blank');
};

 const viewDocuments = async (studentId) => {
  try {
    const response = await collegeAPI.getStudentDocuments(studentId);
    const documents = response.data.documents || [];
    
    if (documents.length === 0) {
      alert('No documents found for this student');
      return;
    }

    // Create modal content
    const student = response.data.student;
    setSelectedStudent({ ...student, documents });
    setShowDocumentsModal(true);
  } catch (error) {
    alert('Error fetching documents: ' + (error.response?.data?.error || error.message));
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <button onClick={() => navigate('/college/dashboard')} className="text-blue-600">← Dashboard</button>
          <button onClick={() => navigate('/college/create-student')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            + Add Student
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="px-4 py-2 border rounded-lg">
              <option value="">All Years</option>
              <option value="FE">FE</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>
            <input type="text" placeholder="Branch" value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              className="px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Search by name or GR" value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border rounded-lg" />
            <button onClick={fetchStudents} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Filter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GR Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.grNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.academicYear}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.branch}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => viewDocuments(student._id)} className="text-blue-600 hover:text-blue-800 mr-4">
                      View Docs ({student.documentCount || 0})
                    </button>
                    <button onClick={() => navigate('/college/upload-document', { state: { student } })}
                      className="text-green-600 hover:text-green-800">
                      Upload Doc
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Modal */}
{showDocumentsModal && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.name}'s Documents</h3>
            <p className="text-sm text-gray-500">GR: {selectedStudent.grNumber}</p>
          </div>
          <button
            onClick={() => setShowDocumentsModal(false)}
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6">
        {selectedStudent.documents.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedStudent.documents.map((doc) => (
              <div key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{doc.documentTitle}</h4>
                        <p className="text-sm text-gray-500">{doc.documentType}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 w-32">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 w-32">Uploaded:</span>
                        <span className="text-gray-900">{new Date(doc.uploadedAt).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 w-32">File Size:</span>
                        <span className="text-gray-900">{(doc.fileSize / 1024).toFixed(2)} KB</span>
                      </div>

                      <div className="flex items-start text-sm">
                        <span className="text-gray-600 w-32 flex-shrink-0">Hash:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800 break-all">
                          {doc.sha256Hash}
                        </code>
                      </div>

                      {doc.blockchainTxHash && (
                        <div className="flex items-start text-sm">
                          <span className="text-gray-600 w-32 flex-shrink-0">Blockchain TX:</span>
                          <code className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-800 break-all">
                            {doc.blockchainTxHash}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDocument(doc._id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    👁️ View Document
                  </button>
                  <button
                    onClick={() => handleRemoveDocument(doc._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    🗑️ Remove Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={() => setShowDocumentsModal(false)}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ManageStudents