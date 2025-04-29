import React, { useEffect, useState } from 'react';
import './ConnectionStatus.css';

interface Props {
  status: 'connected' | 'disconnected' | 'failed';
  pendingRequests?: number;
}

const ConnectionStatus: React.FC<Props> = ({ status, pendingRequests = 0 }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusText = () => {
    if (!isOnline) return 'Working Offline';
    if (status === 'connected') return pendingRequests > 0 ? `Syncing ${pendingRequests} items...` : 'Online';
    if (status === 'disconnected') return 'Connecting...';
    return 'Connection Failed';
  };

  if (status === 'connected' && pendingRequests === 0 && isOnline) return null;

  return (
    <div className={`connection-status ${status} ${!isOnline ? 'offline' : ''}`}>
      <div className="status-icon"></div>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};

export default ConnectionStatus;
