import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch accounts data from backend
    axios.get('http://localhost:5005/api/accounts')
      .then(response => {
        setAccounts(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch accounts');
        setLoading(false);
      });
  }, []);

  const toggleStatus = (id) => {
    axios.put(`http://localhost:5005/api/accounts/${id}/status`)
      .then(() => {
        // Refresh accounts after status toggle
        setAccounts(prev =>
          prev.map(acc =>
            acc.ID === id ? { ...acc, IsActive: acc.IsActive ? 0 : 1 } : acc
          )
        );
      })
      .catch(() => alert('Failed to update status'));
  };

  return (
    <div className="admin-container">
      <h2>Admin Page - Manage Accounts</h2>

      <div className="links-bar">
        <div className="links-left">
          <a href="/add-account" className="add-account-link">Add Account</a>
        </div>
        <div className="links-right">
          <a href="/attendance">Fill Attendance</a>
          <a href="/fill-attendance">Register Face</a>
          <a href="/logout">Logout</a>
        </div>
      </div>

      {loading && <p>Loading accounts...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {accounts.length === 0 ? (
            <p>No accounts found.</p>
          ) : (
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Toggle Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.ID}>
                    <td>{account.ID}</td>
                    <td>{account.FullName}</td>
                    <td>{account.Role}</td>
                    <td>{account.Username}</td>
                    <td>{account.Email}</td>
                    <td>{account.IsActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button
                        className="toggle-btn"
                        onClick={() => toggleStatus(account.ID)}
                      >
                        {account.IsActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;