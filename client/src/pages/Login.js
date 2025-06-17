import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch('http://localhost:5005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    // ✅ No lowercase conversion
    const role = data.user.role;
    const token = data.token;

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role); // "Admin", "Employee", or "Manager"
    localStorage.setItem('username', data.user.username);

    // ✅ Redirect based on role
    switch (role.toLowerCase()) {
      case 'admin':
        navigate('/admin');
        break;
      case 'employee':
        navigate('/employee');
        break;
      case 'manager':
        navigate('/manager');
        break;
      default:
        navigate('/');
    }
  } catch (err) {
    setError('Server error, try again later.');
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default Login;