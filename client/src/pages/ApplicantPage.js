// src/pages/ApplicantPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ApplicantPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div>
      <h2>Welcome Applicant</h2>
      <ul>
        <li><Link to="/apply">Apply for Job</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </div>
  );
};

export default ApplicantPage;
