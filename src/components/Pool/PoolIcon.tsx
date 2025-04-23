import React, { memo } from 'react';

interface PoolIconProps {
  type: 'hourly' | 'yearly' | 'random';
}

export const PoolIcon = memo(({ type }: PoolIconProps) => {
  switch (type) {
    case 'hourly':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'yearly':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'random':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 15v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
          <circle cx="12" cy="7" r="3" />
          <path d="M17 11l1 4l1-4" />
          <circle cx="19" cy="8" r="1" />
        </svg>
      );
  }
});

PoolIcon.displayName = 'PoolIcon';
