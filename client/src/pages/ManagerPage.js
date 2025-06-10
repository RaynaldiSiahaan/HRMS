// src/pages/ManagerPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ManagerPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div>
      <h2>Welcome Manager</h2>
      <ul>
        <li><Link to="/save-employee-file">Save Employee File</Link></li>
        <li><Link to="/fill-attendance">Fill Attendance</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </div>
  );
};

export default ManagerPage;
