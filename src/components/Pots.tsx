import React, { useState, useEffect } from 'react';
import './Pots.css';

interface PotProps {
  id: number;
  amount: number;
  players: number;
  timeLeft: string;
}

const Pots: React.FC = () => {
  const [pots, setPots] = useState<PotProps[]>([]);
  const [selectedPot, setSelectedPot] = useState<PotProps | null>(null);
  
  useEffect(() => {
    // Load pots data
    const loadPots = async () => {
      // ...existing pot loading logic...
    };
    loadPots();
  }, []);

  return (
    <div className="pots-container">
      <div className="pots-grid">
        {pots.map(pot => (
          <div className="pot-card" key={pot.id}>
            <div className="pot-header">
              <h3>Pot #{pot.id}</h3>
              <span className="pot-amount">${pot.amount.toFixed(2)}</span>
            </div>
            <div className="pot-info">
              <span>Players: {pot.players}</span>
              <span>Time Left: {pot.timeLeft}</span>
            </div>
            <button onClick={() => setSelectedPot(pot)}>Join Pot</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pots;
