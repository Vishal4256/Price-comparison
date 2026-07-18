import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ isAuthenticated }) => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Parse user from local storage
    const user = JSON.parse(localStorage.getItem('user'));

    // Check role based access
    if (!user || user.role !== 'admin') {
        // If not admin, redirect to normal dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
