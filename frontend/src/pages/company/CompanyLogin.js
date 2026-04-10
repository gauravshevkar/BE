import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';








const CompanyLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ companyEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await companyAPI.login(formData);
      login(response.data.token, response.data.company, 'company');
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-red-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
            <span className="text-4xl">🏢</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Company Portal</h2>
          <p className="text-orange-200">Verify student certificates instantly</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
              <input name="companyEmail" type="email" required value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input name="password" type="password" required value={formData.password}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/company/register" className="text-orange-600 hover:text-orange-700 font-semibold">
              New company? Register here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-orange-200 hover:text-white">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin