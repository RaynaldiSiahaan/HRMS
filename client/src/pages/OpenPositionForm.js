import React, { useState } from 'react';
import './OpenPositionForm.css'; // Reuse the styles

const OpenPositionForm = () => {
  const [form, setForm] = useState({
    position: '',
    maxAge: '',
    minAge: '',
    gender: '',
    education: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    alert('Position successfully opened!');
  };

  return (
    <div className="employee-container">
      <h2>Open New Job Position</h2>
      <form onSubmit={handleSubmit} style={{ width: '80%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Position Opened:</label>
          <select name="position" value={form.position} onChange={handleChange} required className="employee-dropdown" style={{ width: '100%' }}>
            <option value="">-- Select Position --</option>
            <option value="Admin">Admin</option>
            <option value="Network Engineer">Network Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Researcher">Researcher</option>
            <option value="General Affairs">General Affairs</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Maximum Age:</label>
          <input
            type="number"
            name="maxAge"
            value={form.maxAge}
            onChange={handleChange}
            required
            className="employee-dropdown"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Minimum Age:</label>
          <input
            type="number"
            name="minAge"
            value={form.minAge}
            onChange={handleChange}
            required
            className="employee-dropdown"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Gender:</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="employee-dropdown"
            style={{ width: '100%' }}
          >
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Education:</label>
          <select
            name="education"
            value={form.education}
            onChange={handleChange}
            required
            className="employee-dropdown"
            style={{ width: '100%' }}
          >
            <option value="">-- Select Education --</option>
            <option value="HighSchool">High School</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="Doctoral">Doctoral</option>
          </select>
        </div>

        <button type="submit" className="employee-link" style={{ width: '100%' }}>Get CV</button>
      </form>
    </div>
  );
};

export default OpenPositionForm;
