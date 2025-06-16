import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { FaUserCircle } from 'react-icons/fa';
import AuthIcon from './AuthIcon';
import './navbar.css';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <span className="brand-name">A D P O T</span>
          </Link>
        </div>

        <div className="right-section">
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/pools">Pools</Link>
            <Link to="/rewards">Rewards</Link>
            <Link to="/about">About</Link>
          </nav>
          
          <div className="controls">
            <LanguageSwitcher />
            <AuthIcon />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;