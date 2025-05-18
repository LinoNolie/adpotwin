import React from 'react';
import './home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Welcome to AdPot</h1>
        <p>The Next Generation Lottery Platform</p>
      </section>
      
      <section className="active-pools">
        <h2>Active Pools</h2>
        <div className="pools-grid">
          {/* Pool cards will be mapped here */}
        </div>
      </section>
      
      <section className="statistics">
        <h2>Platform Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Players</h3>
            <p>10,234</p>
          </div>
          <div className="stat-card">
            <h3>Total Prize Pool</h3>
            <p>$1,234,567</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
