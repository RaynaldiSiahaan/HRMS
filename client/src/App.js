// src/App.js 
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import EmployeePage from './pages/EmployeePage';
import ApplicantPage from './pages/ApplicantPage';
import AddAccount from './pages/AddAccount';  // <-- Import AddAccount
import JoinUs from './pages/JoinUs';          // <-- Import JoinUs
import './App.css';

// Role-based Protected Route Component
const ProtectedRoute = ({ element: Component, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" />;
  if (userRole !== role) return <Navigate to="/" />;

  return <Component />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/join" element={<JoinUs />} /> {/* <-- Added JoinUs route */}

          {/* Role-based protected routes */}
          <Route path="/admin" element={<ProtectedRoute element={AdminPage} role="Admin" />} />
          <Route path="/manager" element={<ProtectedRoute element={ManagerPage} role="Manager" />} />
          <Route path="/employee" element={<ProtectedRoute element={EmployeePage} role="Employee" />} />
          <Route path="/applicant" element={<ProtectedRoute element={ApplicantPage} role="Applicant" />} />

          {/* AddAccount route, protected for Admin only */}
          <Route path="/add-account" element={<ProtectedRoute element={AddAccount} role="Admin" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;