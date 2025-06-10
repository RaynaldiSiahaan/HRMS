import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => (
  <div className="home-container">
    <h1>Welcome to the HRMS</h1>
    <div className="home-links">
      <Link to="/login" className="home-link">Login</Link>
      <Link to="/register" className="home-link">Register</Link>
      <Link to="/about" className="home-link">About Us</Link>
      <Link to="/contact" className="home-link">Contact Us</Link>
      <Link to="/join" className="home-link">Join Us</Link>
    </div>
  </div>
);

export default Home;
