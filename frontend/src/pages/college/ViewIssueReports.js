import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeAPI } from '../../services/api';


const ViewIssueReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await collegeAPI.getIssueReports({ status: filter });
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/college/dashboard')} className="text-blue-600">← Dashboard</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Issue Reports</h2>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex space-x-2">
            {['pending', 'resolved', 'all'].map((status) => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {reports.map((report, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{report.studentId?.studentName}</h3>
                  <p className="text-sm text-gray-500">Document: {report.documentId?.documentTitle}</p>
                  <p className="text-gray-700 mt-2">{report.issueDescription}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-4">Reported: {new Date(report.reportedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewIssueReports