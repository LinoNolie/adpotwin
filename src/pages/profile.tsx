import React from 'react';

const Profile = () => {
  return (
    <div className="profile">
      <h1>Profile</h1>
      <div className="profile-stats">
        <div className="stat-item">
          <h3>Tickets Purchased</h3>
          <p>25</p>
        </div>
        <div className="stat-item">
          <h3>Total Winnings</h3>
          <p>$1,200</p>
        </div>
      </div>
      <div className="profile-actions">
        <button className="btn primary">Withdraw Winnings</button>
        <button className="btn secondary">Transaction History</button>
      </div>
    </div>
  );
};

export default Profile;
