import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏢</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Company Portal</h1>
              <p className="text-xs text-gray-500">{user?.companyName}</p>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.companyName}!</h2>
          <p className="text-orange-100">{user?.companyEmail}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => navigate('/company/verify')}
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-all text-left group">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600">Verify Certificate</h3>
            <p className="text-gray-600">Upload a student certificate for instant blockchain verification</p>
          </button>

          <button onClick={() => navigate('/company/history')}
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-all text-left group">
            <span className="text-5xl mb-4 block">📊</span>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600">Verification History</h3>
            <p className="text-gray-600">View your last 10 certificate verifications</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard