import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isAdmin?: boolean;
  children: React.ReactNode;
}

export default function ProtectedRoute({ isAdmin: requireAdmin, children }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
