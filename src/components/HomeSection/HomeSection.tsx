import React, { useState } from 'react';
import './HomeSection.css';

const HomeSection: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="home-section">
      <header className="cyberpunk-header">
        <button className="nav-burger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className="logo">
          <img src="/logo192.png" alt="AdPot" />
        </div>
        <div className="title-container">
          <h1 className="title">ADPOT</h1>
          <p className="slogan">Watch Ads, Win Jackpots</p>
        </div>
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      {/* ...existing code... */}
    </div>
  );
};

export default HomeSection;