import React, { memo, useMemo } from 'react';
import { useJackpot } from '../../contexts/JackpotContext';
import { PoolIcon } from './PoolIcon';
import './Pool.css';

interface PoolProps {
  type: 'hourly' | 'yearly' | 'random';
  timer?: string;
  entries: number;
  totalEntries: number;
  registeredContributors: number;
  totalContributors: number;
  onWin?: () => void;
}

const Pool = memo(({ 
  type, 
  timer,
  entries, 
  totalEntries, 
  registeredContributors, 
  totalContributors,
  onWin 
}: PoolProps) => {
  const { jackpots } = useJackpot();
  const poolData = jackpots[type];

  const chances = useMemo(() => {
    if (totalEntries === 0) return '0%';
    return ((entries / totalEntries) * 100).toFixed(2) + '%';
  }, [entries, totalEntries]);

  const stats = useMemo(() => [
    { label: 'Your Entries', value: entries.toLocaleString() },
    { label: 'Total Entries', value: totalEntries.toLocaleString() },
    { label: 'Your Chances', value: chances },
    { label: 'Registered Contributors', value: registeredContributors.toLocaleString() },
    { label: 'Total Contributors', value: totalContributors.toLocaleString() }
  ], [entries, totalEntries, chances, registeredContributors, totalContributors]);

  return (
    <div className="pool-card">
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Jackpot</h3>
      <div className="pool-icon">
        <PoolIcon type={type} />
      </div>
      
      <div className="amount-display">
        <span className="currency">$</span>
        <span className="amount">{poolData.amount.toLocaleString()}</span>
      </div>

      {timer && <div className="timer">{timer}</div>}
      {type === 'random' && <div className="players-count">{poolData.players} players</div>}

      <div className="pool-stats">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <div className="stat-item">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            {index === 2 && <div className="stat-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

Pool.displayName = 'Pool';

export default Pool;
