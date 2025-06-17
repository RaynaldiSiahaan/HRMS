import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ManagerPage.css';

const ManagerPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h2>Welcome Manager</h2>
      </div>

      <div className="employee-actions">
        <Link to="/employee-dashboard" className="employee-link">Dashboard</Link>
        <Link to="/fill-attendance" className="employee-link">Fill Attendance</Link> {/* ✅ New Button */}
        <Link to="/decide-promotion" className="employee-link">Decide Promotion</Link>
        <Link to="/open-position-form" className="employee-link">Open New Position</Link>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ManagerPage;