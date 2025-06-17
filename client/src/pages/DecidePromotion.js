// src/pages/DecidePromotion.js
import React, { useEffect, useState } from 'react';
import './DecidePromotion.css';

const DecidePromotion = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('7'); // Default filter

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/employee/performance?days=${filter}`);
        const json = await res.json();

        if (Array.isArray(json)) {
          setData(json);
          setError('');
        } else {
          setError('Unexpected response format');
          setData([]);
        }
      } catch (err) {
        console.error('Failed to fetch performance data:', err);
        setError('Failed to load data');
      }
    };

    fetchPerformance();
  }, [filter]);

  return (
    <div className="promotion-container">
      <h2>Employee Performance & Promotion Recommendations</h2>

      <div className="filter-section">
        <label htmlFor="filter">View Performance for: </label>
        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && data.length === 0 && (
        <p>No performance data available for the selected period.</p>
      )}

      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Attendance (%)</th>
              <th>Work Completion (%)</th>
              <th>Late Tasks</th>
              <th>Satisfaction Score</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((emp, index) => (
              <tr key={index}>
                <td>{emp.username}</td>
                <td>{emp.fullName}</td>
                <td>{emp.Attendance}</td>
                <td>{emp.WorkCompletion}</td>
                <td>{emp.LateCompletion}</td>
                <td>{emp.satisfaction_score}</td>
                <td>{emp.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DecidePromotion;
