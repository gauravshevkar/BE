import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Landing and Auth Pages
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/admin/AdminLogin';
import CollegeLogin from './pages/college/CollegeLogin';
import CollegeRegister from './pages/college/CollegeRegister';
import StudentLogin from './pages/student/StudentLogin';
import CompanyLogin from './pages/company/CompanyLogin';
import CompanyRegister from './pages/company/CompanyRegister';

// Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageColleges from './pages/admin/ManageColleges';
import ViewCollegeStudents from './pages/admin/ViewCollegeStudents';

// College Portal
import CollegeDashboard from './pages/college/CollegeDashboard';
import UploadGRList from './pages/college/UploadGRList';
import CreateStudent from './pages/college/CreateStudent';
import ManageStudents from './pages/college/ManageStudents';
import UploadDocument from './pages/college/UploadDocument';
import ViewIssueReports from './pages/college/ViewIssueReports';

// Student Portal
import StudentDashboard from './pages/student/StudentDashboard';
import ViewDocuments from './pages/student/ViewDocuments';
import ReportIssue from './pages/student/ReportIssue';

// Company Portal
import CompanyDashboard from './pages/company/CompanyDashboard';
import VerifyDocument from './pages/company/VerifyDocument';
import VerificationHistory from './pages/company/VerificationHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/colleges" element={
              <ProtectedRoute role="admin">
                <ManageColleges />
              </ProtectedRoute>
            } />
            <Route path="/admin/college/:collegeId/students" element={
              <ProtectedRoute role="admin">
                <ViewCollegeStudents />
              </ProtectedRoute>
            } />
            
            {/* College Routes */}
            <Route path="/college/login" element={<CollegeLogin />} />
            <Route path="/college/register" element={<CollegeRegister />} />
            <Route path="/college/dashboard" element={
              <ProtectedRoute role="college">
                <CollegeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/college/upload-gr-list" element={
              <ProtectedRoute role="college">
                <UploadGRList />
              </ProtectedRoute>
            } />
            <Route path="/college/create-student" element={
              <ProtectedRoute role="college">
                <CreateStudent />
              </ProtectedRoute>
            } />
            <Route path="/college/students" element={
              <ProtectedRoute role="college">
                <ManageStudents />
              </ProtectedRoute>
            } />
            <Route path="/college/upload-document" element={
              <ProtectedRoute role="college">
                <UploadDocument />
              </ProtectedRoute>
            } />
            <Route path="/college/issue-reports" element={
              <ProtectedRoute role="college">
                <ViewIssueReports />
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/documents" element={
              <ProtectedRoute role="student">
                <ViewDocuments />
              </ProtectedRoute>
            } />
            <Route path="/student/report-issue" element={
              <ProtectedRoute role="student">
                <ReportIssue />
              </ProtectedRoute>
            } />
            
            {/* Company Routes */}
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route path="/company/register" element={<CompanyRegister />} />
            <Route path="/company/dashboard" element={
              <ProtectedRoute role="company">
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/company/verify" element={
              <ProtectedRoute role="company">
                <VerifyDocument />
              </ProtectedRoute>
            } />
            <Route path="/company/history" element={
              <ProtectedRoute role="company">
                <VerificationHistory />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
