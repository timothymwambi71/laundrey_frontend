// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import OrdersList from './pages/OrdersList';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import ClientsList from './pages/ClientsList';
import ServicesList from './pages/ServicesList';
import PaymentsList from './pages/PaymentsList';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import { api, getCsrfToken } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Ensure CSRF token is loaded first
        await getCsrfToken();
        
        // Try to fetch user data to verify session
        await api.auth.checkSession();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes - Wrapped in DashboardLayout */}
        {isAuthenticated ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/new" element={<NewOrder />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* Catch all - redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;