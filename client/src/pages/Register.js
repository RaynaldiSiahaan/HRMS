import React, { useState } from 'react';

const Register = () => {
  const [role, setRole] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form>
        <input type="text" placeholder="Full Name" required /><br />
        <input type="text" placeholder="Address" required /><br />
        <input type="tel" placeholder="Phone Number" required pattern="[0-9]{10}" title="Enter 10 digit phone number" /><br />
        <select value={role} onChange={handleRoleChange} required>
          <option value="" disabled>Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">manager</option>
          <option value="user">Employee</option>
          <option value="analyst">Personnel</option>
        </select><br />
        <input type="email" placeholder="Email" required /><br />
        <input type="password" placeholder="Password" required /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;