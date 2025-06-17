import React, { useState } from 'react';
import './JoinUs.css';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5005/api/joinus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message || 'CV submitted successfully!');
    } catch (error) {
      alert('Submission failed. Check your server.');
      console.error(error);
    }
  };

  return (
    <div className="joinus-container">
      <h2>Job Seeker Application Form</h2>
      <form onSubmit={handleSubmit} className="joinus-form">
        <label>Full Name:
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </label>

        <label>Birth Date:
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
        </label>

        <label>Gender:
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>

        <label>Work Experience:
          <textarea name="workExperience" value={formData.workExperience} onChange={handleChange} required />
        </label>

        <label>School Experience:
          <textarea name="schoolExperience" value={formData.schoolExperience} onChange={handleChange} required />
        </label>

        <label>Organizational Experience:
          <textarea name="orgExperience" value={formData.orgExperience} onChange={handleChange} required />
        </label>

        <label>Profile Description:
          <textarea name="profileDescription" value={formData.profileDescription} onChange={handleChange} required />
        </label>

        <label>Other Experience:
          <textarea name="otherExperience" value={formData.otherExperience} onChange={handleChange} required />
        </label>
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
};

export default JoinUs;
