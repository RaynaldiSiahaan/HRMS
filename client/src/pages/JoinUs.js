// src/components/JoinUs.js
import React, { useState } from 'react';
import './JoinUs.css';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    workExperience: '',
    schoolExperience: '',
    orgExperience: '',
    profileDescription: '',
    otherExperience: '',
    certificate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    alert('Application submitted successfully!');
  };

  return (
    <div className="joinus-container">
      <h2>Job Seeker Application Form</h2>
      <form onSubmit={handleSubmit} className="joinus-form">
        <label>Full Name:
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </label>

        <label>Address:
          <input type="text" name="address" value={formData.address} onChange={handleChange} required />
        </label>

        <label>Work Experience:
          <input type="text" name="workExperience" value={formData.workExperience} onChange={handleChange} required />
        </label>

        <label>School Experience:
          <input type="text" name="schoolExperience" value={formData.schoolExperience} onChange={handleChange} required />
        </label>

        <label>Organizational Experience:
          <input type="text" name="orgExperience" value={formData.orgExperience} onChange={handleChange} required />
        </label>

        <label>Profile Description:
          <input type="text" name="profileDescription" value={formData.profileDescription} onChange={handleChange} required />
        </label>

        <label>Other Experience:
          <input type="text" name="otherExperience" value={formData.otherExperience} onChange={handleChange} required />
        </label>

        <label>Certificate:
          <input type="text" name="certificate" value={formData.certificate} onChange={handleChange} required />
        </label>

        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
};

export default JoinUs;