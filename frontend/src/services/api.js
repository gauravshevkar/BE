import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============ ADMIN API ============
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getColleges: (params) => api.get('/admin/colleges', { params }),
  getCollege: (id) => api.get(`/admin/college/${id}`),
  approveCollege: (id) => api.put(`/admin/college/approve/${id}`),
  blockCollege: (id) => api.put(`/admin/college/block/${id}`),
  deleteCollege: (id) => api.delete(`/admin/college/${id}`),
  getCollegeStudents: (collegeId, params) => api.get(`/admin/college/${collegeId}/students`, { params })
};

// ============ COLLEGE API ============
export const collegeAPI = {
  register: (data) => api.post('/college/register', data),
  login: (credentials) => api.post('/college/login', credentials),
  uploadGRList: (formData) => {
    return api.post('/college/gr-list/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getGRNumbers: (params) => api.get('/college/gr-numbers', { params }),
  createStudent: (data) => api.post('/college/student/create', data),
  uploadDocument: (formData) => {
    return api.post('/college/document/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getStudents: (params) => api.get('/college/students', { params }),
  getStudentDocuments: (studentId) => api.get(`/college/student/${studentId}/documents`),
  removeDocument: (documentId) => api.delete(`/college/document/${documentId}`),
  getIssueReports: (params) => api.get('/college/issue-reports', { params }),
   checkDocumentStatus: (documentId) => api.get(`/college/document/status/${documentId}`),
     retryVerification: (documentId) => api.post(`/college/document/retry-verification/${documentId}`)
};




// ============ STUDENT API ============
export const studentAPI = {
  login: (credentials) => api.post('/student/login', credentials),
  getDocuments: () => api.get('/student/documents'),
  reportIssue: (data) => api.post('/student/report-issue', data),
  getReports: () => api.get('/student/reports')
};

// ============ COMPANY API ============
export const companyAPI = {
  register: (data) => api.post('/company/register', data),
  login: (credentials) => api.post('/company/login', credentials),
  verifyDocument: (formData) => {
    return api.post('/company/verify-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getVerificationHistory: () => api.get('/company/verification-history')
};

// ============ GENERAL API ============
export const generalAPI = {
  healthCheck: () => api.get('/health')
};

export default api;
