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

  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/match-cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: form.position,
          min_age: parseInt(form.minAge),
          max_age: parseInt(form.maxAge),
          gender: form.gender,
          education: form.education,
        }),
      });

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch CVs:", error);
      alert("Error fetching matching CVs.");
    }
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
          <input type="number" name="maxAge" value={form.maxAge} onChange={handleChange} required className="employee-dropdown" style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Minimum Age:</label>
          <input type="number" name="minAge" value={form.minAge} onChange={handleChange} required className="employee-dropdown" style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Gender:</label>
          <select name="gender" value={form.gender} onChange={handleChange} required className="employee-dropdown" style={{ width: '100%' }}>
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Education:</label>
          <select name="education" value={form.education} onChange={handleChange} required className="employee-dropdown" style={{ width: '100%' }}>
            <option value="">-- Select Education --</option>
            <option value="HighSchool">High School</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="Doctoral">Doctoral</option>
          </select>
        </div>

        <button type="submit" className="employee-link" style={{ width: '100%' }}>Get CV</button>
      </form>

      {results.length > 0 && (
        <>
          <h3 style={{ marginTop: '40px' }}>Top 10 Matching CVs</h3>
          <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Birth Date</th>
                <th>Predicted Job</th>
                <th>Predicted Education</th>
              </tr>
            </thead>
            <tbody>
              {results.map((cv, index) => (
                <tr key={index}>
                  <td>{cv.full_name}</td>
                  <td>{cv.gender}</td>
                  <td>{cv.birth_date}</td>
                  <td>{cv.predicted_job}</td>
                  <td>{cv.predicted_education}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default OpenPositionForm;
