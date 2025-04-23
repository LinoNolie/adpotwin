import React, { useState } from 'react';
import './PayoutModal.css';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}

const PayoutModal: React.FC<PayoutModalProps> = ({ isOpen, onClose, balance }) => {
  const [amount, setAmount] = useState(balance.toString());
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with your payment processing system
    alert(`Payout of $${amount} requested via ${selectedMethod}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payout-overlay">
      <div className="payout-modal">
        <div className="payout-header">
          <h2>Request Payout</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="amount-field">
            <label>Amount ($)</label>
            <input
              type="number"
              max={balance}
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="payment-methods">
            <label>Select Payment Method</label>
            <div className="method-options">
              {['PayPal', 'Bank Transfer', 'Crypto'].map(method => (
                <div
                  key={method}
                  className={`payment-method ${selectedMethod === method ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method)}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!selectedMethod || !amount}
            className="submit-payout"
          >
            Confirm Payout
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayoutModal;
