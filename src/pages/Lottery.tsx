import React from 'react';

const Lottery = () => {
  return (
    <div className="lottery">
      <h1>Current Lottery</h1>
      <div className="pot-info">
        <h2>Current Pot</h2>
        <p className="pot-amount">$5,000</p>
        <div className="timer">Next Draw: 12:00:00</div>
      </div>
      <div className="ticket-section">
        <h3>Buy Tickets</h3>
        <div className="ticket-controls">
          <button className="btn primary">Buy 1 Ticket ($10)</button>
          <button className="btn secondary">Buy 5 Tickets ($45)</button>
        </div>
      </div>
    </div>
  );
};

export default Lottery;
