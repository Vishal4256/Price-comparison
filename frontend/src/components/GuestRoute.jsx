import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route guard for guests (unauthenticated users).
 * Redirects to /dashboard if the user is already logged in.
 */
export default function GuestRoute({ children }) {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
