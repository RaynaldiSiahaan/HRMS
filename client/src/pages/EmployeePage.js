import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmployeePage.css';

const ManagerPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="manager-page">
      <h2>Welcome Employee</h2>
      <ul>
        <li><Link to="/fill-attendance">Fill Attendance</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </div>
  );
};

export default ManagerPage;