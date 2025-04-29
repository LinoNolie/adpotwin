import React, { memo } from 'react';
import './JackpotCard.css';

interface JackpotCardProps {
  type: 'hourly' | 'yearly' | 'random';
  amount: number;
  timer?: string;
  players?: number;
  entries: number;
  totalEntries: number;
  registeredContributors: number;
  totalContributors: number;
}

export const JackpotCard = memo(({
  type,
  amount,
  timer,
  players,
  entries,
  totalEntries,
  registeredContributors,
  totalContributors
}: JackpotCardProps) => {
  const calculateChances = () => {
    if (totalEntries === 0) return '0%';
    return ((entries / totalEntries) * 100).toFixed(2) + '%';
  };

  return (
    <div className="jackpot-card">
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Jackpot</h3>
      <div className="amount-wrapper">
        <span className="currency">$</span>
        <span className="amount">{amount.toLocaleString()}</span>
      </div>
      {timer && <div className="timer">{timer}</div>}
      {players && <div className="players-count">{players} players</div>}
      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">Your Entries</span>
          <span className="stat-value">{entries.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Entries</span>
          <span className="stat-value">{totalEntries.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Chances</span>
          <span className="stat-value">{calculateChances()}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">Registered Contributors</span>
          <span className="stat-value">{registeredContributors.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Contributors</span>
          <span className="stat-value">{totalContributors.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
});

JackpotCard.displayName = 'JackpotCard';

export default JackpotCard;
