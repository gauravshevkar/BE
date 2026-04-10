import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI } from '../../services/api';


const VerificationHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await companyAPI.getVerificationHistory();
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <button onClick={() => navigate('/company/dashboard')} className="text-orange-600">← Dashboard</button>
          <button onClick={() => navigate('/company/verify')} className="px-4 py-2 bg-orange-600 text-white rounded-lg">
            + New Verification
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Verification History (Last 10)</h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.branch}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.academicYear}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.verificationResult === 'verified' ? 'bg-green-100 text-green-800' :
                      item.verificationResult === 'fake' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.verificationResult === 'verified' ? '✓ Verified' :
                       item.verificationResult === 'fake' ? '✗ Fake' : '⚠ Not Found'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.verifiedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-500">No verification history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VerificationHistory