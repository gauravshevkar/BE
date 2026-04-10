import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeAPI } from '../../services/api';

const UploadGRList = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await collegeAPI.uploadGRList(formData);
      alert(`Success! ${response.data.count} GR numbers uploaded.`);
      navigate("/college/dashboard");
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => navigate("/college/dashboard")}
            className="text-blue-600"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">
            Upload GR Number Master List
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              Excel Format Required:
            </p>
            <table className="text-sm text-blue-700 w-full">
              <thead>
                <tr className="border-b border-blue-300">
                  <th className="text-left py-1">GR Number</th>
                  <th className="text-left py-1">Academic Year</th>
                  <th className="text-left py-1">Branch</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>GR001</td>
                  <td>FE</td>
                  <td>Computer Engineering</td>
                </tr>
                <tr>
                  <td>GR002</td>
                  <td>SE</td>
                  <td>Mechanical Engineering</td>
                </tr>
              </tbody>
            </table>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File (.xlsx, .xls)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full px-4 py-3 border-2 border-dashed rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${
                uploading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploading ? "Uploading..." : "Upload GR List"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadGRList;
