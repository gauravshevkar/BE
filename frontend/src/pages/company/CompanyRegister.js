import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


const CompanyRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '', companyEmail: '', password: '', confirmPassword: '',
    contactPerson: '', contactNumber: '', address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await companyAPI.register(submitData);
      alert('Registration successful!');
      navigate('/company/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-red-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
            <span className="text-4xl">🏢</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Company Registration</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded"><p className="text-sm text-red-700">{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input name="companyName" type="text" required value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input name="contactPerson" type="text" required value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
              <input name="companyEmail" type="email" required value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
              <input name="contactNumber" type="tel" required value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea name="address" required value={formData.address} rows="3"
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input name="password" type="password" required value={formData.password}
                  onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input name="confirmPassword" type="password" required value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}>
              {loading ? 'Registering...' : 'Register Company'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/company/login" className="text-orange-600">Already registered? Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister