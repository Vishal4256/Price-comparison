import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guard for authenticated users.
 * Redirects to /login if the user is not logged in.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redirect to login while keeping track of current page for post-login redirect
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}
