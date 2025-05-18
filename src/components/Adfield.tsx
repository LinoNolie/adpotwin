import React from 'react';
import './AdField.css';

interface AdFieldProps {
  position: 'top' | 'sidebar' | 'bottom';
}

const AdField: React.FC<AdFieldProps> = ({ position }) => {
  return (
    <div className={`ad-field ${position}`}>
      {/* Ad content will be injected here */}
      <div className="ad-placeholder">
        Advertisement
      </div>
    </div>
  );
};

export default AdField;
