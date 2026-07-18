import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Route guard for guests (unauthenticated users).
 * Redirects to /dashboard if the user is already logged in.
 */
export default function GuestRoute({ isAuthenticated }) {
  const token = localStorage.getItem('token');

  if (token || isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
