// src/components/DashboardLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'New Order', path: '/orders/new', icon: '➕' },
    { name: 'Orders', path: '/orders', icon: '📋' },
    { name: 'Clients', path: '/clients', icon: '👥' },
    { name: 'Services', path: '/services', icon: '🧺' },
    { name: 'Payments', path: '/payments', icon: '💰' },
    { name: 'Inventory', path: '/inventory', icon: '📦' },
    { name: 'Reports', path: '/reports', icon: '📈' },
  ];

  const isActive = (path) => {
    if (path === '/orders' && location.pathname.startsWith('/orders')) {
      return location.pathname === '/orders';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
            <h1 className="text-xl font-bold">Laundry MS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  👤
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Staff User</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <span className="text-xl">🔔</span>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <span className="text-xl">⚙️</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;