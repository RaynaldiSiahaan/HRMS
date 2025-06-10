// src/pages/EmployeePage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Employee.css';

const EmployeePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h2>Welcome Employee</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Option</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Link to="/fill-attendance" className="action-button view">Fill Attendance</Link></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EmployeePage;