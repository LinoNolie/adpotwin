import React, { memo } from 'react';
import './Loading.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export const Loading = memo(({ 
  size = 'medium', 
  color = '#e3d5ca',
  text = 'Loading...'
}: LoadingProps) => (
  <div className={`loading-container ${size}`}>
    <div 
      className="loading-spinner"
      style={{ borderColor: color }}
    />
    {text && <div className="loading-text">{text}</div>}
  </div>
));

Loading.displayName = 'Loading';

export default Loading;
