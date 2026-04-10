import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [docsResponse, reportsResponse] = await Promise.all([
        studentAPI.getDocuments(),
        studentAPI.getReports()
      ]);

      setDocuments(docsResponse.data.documents || []);
      setReports(reportsResponse.data.reports || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

const stats = {
  totalDocuments: documents.length,
  verifiedDocuments: documents.filter(doc => doc.status === 'verified').length,
  pendingDocuments: documents.filter(doc => doc.status === 'uploaded').length,
  pendingReports: reports.filter(r => r.status === 'pending').length
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🎓</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                  <p className="text-xs text-gray-500">Certificate Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.studentName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.studentName}!</h2>
          <p className="text-green-100 mb-4">
            {user?.grNumber} | {user?.academicYear} | {user?.branch}
          </p>
          <p className="text-green-100">
            College: {user?.college}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Verified on Blockchain</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verifiedDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Verification</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingDocuments}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/student/documents')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600">
                  View My Documents
                </h3>
                <p className="text-gray-600">
                  Access all your verified certificates with blockchain hashes
                </p>
              </div>
              <span className="text-4xl group-hover:scale-110 transition-transform">📂</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/student/report-issue')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600">
                  Report an Issue
                </h3>
                <p className="text-gray-600">
                  Found a problem with a document? Let your college know
                </p>
              </div>
              <span className="text-4xl group-hover:scale-110 transition-transform">🚨</span>
            </div>
          </button>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Documents</h3>
            <button
              onClick={() => navigate('/student/documents')}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-500 mb-2">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">
                Your college will upload your certificates soon
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📄</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                    </span>
                    <button
                      onClick={() => navigate('/student/documents')}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <span className="text-3xl mr-4">🔐</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Blockchain Verification</h3>
              <p className="text-blue-800 text-sm">
                All your documents are secured using SHA-256 cryptographic hashing and stored on the Ethereum blockchain. 
                This ensures that your certificates are tamper-proof and can be instantly verified by employers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;