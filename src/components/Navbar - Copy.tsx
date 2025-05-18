import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          ADPOT.WIN
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/pools">Pools</Link>
          <Link to="/rewards">Rewards</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
