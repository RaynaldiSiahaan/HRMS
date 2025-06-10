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

      // Save token and role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);

      // Redirect based on role
      switch (data.user.role) {
  case 'Admin':
    navigate('/admin');
    break;
  case 'Manager':
    navigate('/manager');
    break;
  case 'Employee': // <-- changed from 'Emp' to 'Employee'
    navigate('/employee');
    break;
  case 'Applicant':
    navigate('/applicant');
    break;
  default:
    navigate('/');
    break;
}
    } catch (err) {
      setError('Server error, try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default Login;