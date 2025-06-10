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
    <div className="manager-page">
      <h2>Welcome Manager</h2>
      <ul>
        <li><Link to="/save-employee-file">Employee Performance</Link></li>
        <li><Link to="/fill-attendance">Fill Attendance</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </div>
  );
};

export default ManagerPage;