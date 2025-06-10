import React, { useState } from 'react';
import axios from 'axios';
import './AddAccount.css'; // Make sure to create this CSS file

const AddAccount = ({ onAccountAdded }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: '',
    username: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5005/api/auth/register', formData);
      setMessage(res.data.message);
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        role: '',
        username: '',
        password: '',
      });
      if(onAccountAdded) onAccountAdded(); // callback to refresh Admin page list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add account');
    }
  };

  return (
    <div className="add-account-container">
      <h2>Add New Account</h2>
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="add-account-form">
        <label>Full Name*</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />

        <label>Phone Number</label>
        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />

        <label>Email*</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Role*</label>
        <input type="text" name="role" value={formData.role} onChange={handleChange} required />

        <label>Username*</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required />

        <label>Password*</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit" className="btn-submit">Add Account</button>
      </form>
    </div>
  );
};

export default AddAccount;
