import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';

import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

// Lazy load all route components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetailsPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

const LoginPage = React.lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./features/auth/pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./features/auth/pages/ForgotPasswordPage'));

const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminMarketPage = React.lazy(() => import('./pages/admin/AdminMarketPage'));
const AdminScrapersPage = React.lazy(() => import('./pages/admin/AdminScrapersPage'));
const AdminJobsPage = React.lazy(() => import('./pages/admin/AdminJobsPage'));
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));

const AlertsPage = React.lazy(() => import('./pages/AlertsPage'));
const AssistantPage = React.lazy(() => import('./pages/AssistantPage'));
const FloatingAssistant = React.lazy(() => import('./components/FloatingAssistant'));

// A global fallback for route transitions
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* --- ADMIN ROUTES --- */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<AdminDashboardPage />} />
                          <Route path="/market" element={<AdminMarketPage />} />
                          <Route path="/scrapers" element={<AdminScrapersPage />} />
                          <Route path="/jobs" element={<AdminJobsPage />} />
                          <Route path="*" element={<div className="p-20 text-center">Admin 404 - Not Found</div>} />
                        </Routes>
                      </Suspense>
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />

              {/* --- CONSUMER ROUTES --- */}
              <Route 
                path="/*" 
                element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/product/:id" element={<ProductDetailsPage />} />
                        <Route path="/compare" element={<ComparePage />} />
                        <Route path="/assistant" element={<AssistantPage />} />
                        
                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        
                        {/* Protected Routes */}
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/alerts" 
                          element={
                            <ProtectedRoute>
                              <AlertsPage />
                            </ProtectedRoute>
                          } 
                        />
                        
                        <Route path="*" element={<div className="p-20 text-center text-neutral-100">404 - Not Found</div>} />
                      </Routes>
                    </Suspense>
                  </MainLayout>
                } 
              />
            </Routes>
            <Suspense fallback={null}>
              <FloatingAssistant />
            </Suspense>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
