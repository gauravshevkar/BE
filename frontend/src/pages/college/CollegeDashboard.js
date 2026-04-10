import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collegeAPI } from '../../services/api';

const CollegeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    documentsUploaded: 0,
    pendingIssues: 0,
    grNumbersAvailable: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [studentsRes, issuesRes] = await Promise.all([
        collegeAPI.getStudents({ page: 1, limit: 1 }),
        collegeAPI.getIssueReports({ status: 'pending' })
      ]);

      setStats({
        totalStudents: studentsRes.data.pagination?.total || 0,
        pendingIssues: issuesRes.data.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Upload GR List', icon: '📋', desc: 'Upload Excel file with GR numbers', route: '/college/upload-gr-list', color: 'blue' },
    { title: 'Create Student', icon: '👨‍🎓', desc: 'Add student credentials', route: '/college/create-student', color: 'green' },
    { title: 'Manage Students', icon: '📊', desc: 'View and manage all students', route: '/college/students', color: 'purple' },
    { title: 'Upload Document', icon: '📄', desc: 'Upload certificate to blockchain', route: '/college/upload-document', color: 'orange' },
    { title: 'Issue Reports', icon: '🚨', desc: 'View student-reported issues', route: '/college/issue-reports', color: 'red' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏛️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">College Portal</h1>
                <p className="text-xs text-gray-500">{user?.collegeName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.collegeName}!</h2>
          <p className="text-blue-100">College Code: {user?.collegeCode} | Status: {user?.status}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👨‍🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingIssues}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button key={index} onClick={() => navigate(action.route)}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{action.icon}</span>
                <span className={`px-3 py-1 bg-${action.color}-100 text-${action.color}-600 rounded-full text-xs font-medium`}>
                  Quick Action
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;