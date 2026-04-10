import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeAPI } from '../../services/api';

const CreateStudent = () => {
  const navigate = useNavigate();
  const [grNumbers, setGrNumbers] = useState([]);
  const [formData, setFormData] = useState({
    grNumber: '',
    studentName: '',
    email: '',
    academicYear: 'FE',
    branch: '',
    rollNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchingGR, setFetchingGR] = useState(false);

  useEffect(() => {
    fetchGRNumbers();
  }, [formData.academicYear, formData.branch]);

  const fetchGRNumbers = async () => {
    if (!formData.academicYear || !formData.branch) return;
    setFetchingGR(true);
    try {
      const response = await collegeAPI.getGRNumbers({
        academicYear: formData.academicYear,
        branch: formData.branch
      });
      setGrNumbers(response.data.grNumbers || []);
    } catch (error) {
      console.error('Error fetching GR numbers:', error);
    } finally {
      setFetchingGR(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await collegeAPI.createStudent(formData);
      alert('Student credentials created successfully!');
      navigate('/college/students');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <button onClick={() => navigate('/college/dashboard')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Student Credentials</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="FE">FE (First Year)</option>
                  <option value="SE">SE (Second Year)</option>
                  <option value="TE">TE (Third Year)</option>
                  <option value="BE">BE (Fourth Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
                <input name="branch" type="text" required value={formData.branch} onChange={handleChange}
                  placeholder="e.g., Computer Engineering"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select GR Number *</label>
              {fetchingGR ? (
                <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full mx-auto"></div></div>
              ) : (
                <select name="grNumber" value={formData.grNumber} onChange={handleChange} required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select GR Number --</option>
                  {grNumbers.map((gr, idx) => (
                    <option key={idx} value={gr.grNumber}>{gr.grNumber}</option>
                  ))}
                </select>
              )}
              <p className="text-sm text-gray-500 mt-1">{grNumbers.length} available GR number(s)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                <input name="studentName" type="text" required value={formData.studentName} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input name="rollNumber" type="text" required value={formData.rollNumber} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div className="flex space-x-2">
                <input name="password" type="text" required value={formData.password} onChange={handleChange}
                  className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={generatePassword}
                  className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Generate
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" disabled={loading}
                className={`flex-1 py-3 rounded-lg font-semibold text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? 'Creating...' : 'Create Student'}
              </button>
              <button type="button" onClick={() => navigate('/college/students')}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStudent