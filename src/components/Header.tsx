import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="top-section">
        <div className="logo-container">
          <div className="logo">
            <img src="/logo192.png" alt="AdPot Logo" />
            <h1>ADPOT</h1>
          </div>
        </div>
        <nav className="nav-links">
          <a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Watch</a>
          <a>Pools</a>
          <a>Rewards</a>
          <a>Profile</a>
          <a>Imprint</a>
        </nav>
        <div className="auth-container">
          <button className="auth-icon" title="Login/Register">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
