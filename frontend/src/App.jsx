import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home')); // This is the AI Dashboard
const Search = lazy(() => import('./pages/Search'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Compare = lazy(() => import('./pages/Compare'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Insights = lazy(() => import('./pages/Insights'));

// Components
import Navbar from './components/Navbar';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AIAssistantWidget from './components/assistant/AIAssistantWidget';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-[#0B1E36] font-bold">Loading PriceWise...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading module...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />
              
              {/* Guest Routes (Only accessible if NOT logged in) */}
              <Route element={<GuestRoute isAuthenticated={isAuthenticated} />}>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes (Only accessible if logged in) */}
              <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Admin Routes (Only accessible to role = admin) */}
              <Route element={<AdminRoute isAuthenticated={isAuthenticated} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global AI Assistant Widget (Only for Authenticated Users) */}
        {isAuthenticated && <AIAssistantWidget />}
      </div>
    </BrowserRouter>
  );
}

export default App;
