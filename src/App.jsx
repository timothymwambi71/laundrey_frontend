// src/App.jsx - Fixed version without CSRF token
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ServicesList from './pages/ServicesList';
import OrdersList from './pages/OrdersList';
import OrderDetail from './pages/OrderDetail';
import NewOrder from './pages/NewOrder';
import PaymentsList from './pages/PaymentsList';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import { api } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // console.log('Checking auth...'); // Debug log
      const token = localStorage.getItem('access_token');
      // console.log('Token exists:', !!token); // Debug log
      
      if (token) {
        try {
          // Verify token is valid by making a test request
          await api.clients.list({ page_size: 1 });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token invalid:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // console.log('Rendering app, isAuthenticated:', isAuthenticated); // Debug log

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

        {/* Protected Routes */}
        {isAuthenticated ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/new" element={<NewOrder />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;