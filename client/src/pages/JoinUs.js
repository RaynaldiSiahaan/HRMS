// src/components/JoinUs.js
import React, { useState } from 'react';
import './JoinUs.css';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    workExperience: null,
    schoolExperience: null,
    orgExperience: null,
    profileDescription: null,
    otherExperience: null,
    certificate: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally you'd send the form data to the backend here using FormData
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

        <label>Work Experience (PDF):
          <input type="file" name="workExperience" onChange={handleChange} accept=".pdf" required />
        </label>

        <label>School Experience (PDF):
          <input type="file" name="schoolExperience" onChange={handleChange} accept=".pdf" required />
        </label>

        <label>Organizational Experience (PDF):
          <input type="file" name="orgExperience" onChange={handleChange} accept=".pdf" required />
        </label>

        <label>Profile Description (PDF):
          <input type="file" name="profileDescription" onChange={handleChange} accept=".pdf" required />
        </label>

        <label>Other Experience (PDF):
          <input type="file" name="otherExperience" onChange={handleChange} accept=".pdf" required />
        </label>

        <label>Certificate (PDF):
          <input type="file" name="certificate" onChange={handleChange} accept=".pdf" required />
        </label>

        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
};

export default JoinUs;
