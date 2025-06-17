// src/App.js 
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Attendance from './pages/attendance';
import RegisterFace from './pages/RegisterFace';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import EmployeePage from './pages/EmployeePage';
import ApplicantPage from './pages/ApplicantPage';
import AddAccount from './pages/AddAccount';
import JoinUs from './pages/JoinUs';

// ✅ Newly Added Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import DecidePromotion from './pages/DecidePromotion';
import OpenPosition from './pages/OpenPosition';
import OpenPositionForm from './pages/OpenPositionForm';

import './App.css';

// ✅ Role-based Protected Route Component
const ProtectedRoute = ({ element: Component, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('🔐 Token:', token);
  console.log('👤 Role from storage:', userRole);
  console.log('✅ Allowed roles for route:', role);

  if (!token) return <Navigate to="/login" />;

  const normalizedUserRole = userRole?.toUpperCase();

  const isAuthorized = Array.isArray(role)
    ? role.map(r => r.toUpperCase()).includes(normalizedUserRole)
    : normalizedUserRole === role.toUpperCase();

  if (!isAuthorized) {
    console.warn('❌ Unauthorized access. Redirecting to home.');
    return <Navigate to="/" />;
  }

  return <Component />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/join" element={<JoinUs />} />
          <Route path="/register-face" element={<RegisterFace />} />

          {/* 🔒 Role-Based Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute element={AdminPage} role="Admin" />} />
          <Route path="/manager" element={<ProtectedRoute element={ManagerPage} role="Manager" />} />
          <Route path="/employee" element={<ProtectedRoute element={EmployeePage} role="Employee" />} />
          <Route path="/applicant" element={<ProtectedRoute element={ApplicantPage} role="Applicant" />} />
          <Route path="/add-account" element={<ProtectedRoute element={AddAccount} role="Admin" />} />

          {/* 🕒 Shared Attendance Route */}
          <Route
            path="/fill-attendance"
            element={<ProtectedRoute element={Attendance} role={['Admin', 'Employee', 'Manager']} />}
          />

          {/* 👥 Shared Employee/Manager Actions */}
          <Route
            path="/employee-dashboard"
            element={<ProtectedRoute element={EmployeeDashboard} role={['Employee', 'Manager']} />}
          />
          <Route
            path="/decide-promotion"
            element={<ProtectedRoute element={DecidePromotion} role={['Employee', 'Manager']} />}
          />
          <Route
            path="/open-position"
            element={<ProtectedRoute element={OpenPosition} role={['Employee', 'Manager']} />}
          />
          <Route
            path="/open-position-form"
            element={<ProtectedRoute element={OpenPositionForm} role={['Employee', 'Manager']} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;