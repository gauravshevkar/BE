import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { collegeAPI } from "../../services/api";

const CollegeRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    collegeName: "",
    collegeCode: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    contactNumber: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      await collegeAPI.register(submitData);
      setSuccess(true);
      setTimeout(() => navigate("/college/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
        <h2 className="text-2xl font-bold">
          Registration Successful! Redirecting…
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <div className="bg-white p-8 rounded-xl max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-4">College Registration</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="collegeName"
            placeholder="College Name"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <input
            name="collegeCode"
            placeholder="College Code"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <input
            name="contactNumber"
            placeholder="Contact Number"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center">
          <Link to="/college/login" className="text-blue-600">
            Already registered? Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CollegeRegister;
