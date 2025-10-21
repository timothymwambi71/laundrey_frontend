// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function Dashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    readyOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch orders for stats
        const [allOrders, todayOrdersRes, lowStock] = await Promise.all([
          api.orders.list({ page_size: 1000 }),
          api.orders.list({ start_date: today, page_size: 1000 }),
          api.inventory.lowStock(),
        ]);

        const orders = allOrders.data.results || allOrders.data;
        const todayOrders = todayOrdersRes.data.results || todayOrdersRes.data;

        // Calculate stats
        const pending = orders.filter(o => o.status === 'PENDING').length;
        const ready = orders.filter(o => o.status === 'READY').length;
        const totalRev = orders.reduce((sum, o) => sum + parseFloat(o.amount_paid || 0), 0);

        setStats({
          todayOrders: todayOrders.length,
          pendingOrders: pending,
          readyOrders: ready,
          totalRevenue: totalRev,
        });

        // Get recent orders
        setRecentOrders(orders.slice(0, 5));
        setLowStockItems(lowStock.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: '📋',
      color: 'bg-blue-500',
      link: '/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-500',
      link: '/orders?status=PENDING',
    },
    {
      title: 'Ready for Pickup',
      value: stats.readyOrders,
      icon: '✅',
      color: 'bg-green-500',
      link: '/orders?status=READY',
    },
    {
      title: 'Total Revenue',
      value: `UGX ${stats.totalRevenue.toFixed(0)}`,
      icon: '💰',
      color: 'bg-purple-500',
      link: '/reports',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color} text-white text-2xl`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link
                to="/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.order_number}
                        </p>
                        <p className="text-sm text-gray-600">{order.client_name}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          UGX {parseFloat(order.total_amount).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
              <Link
                to="/inventory"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Manage →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-green-600 font-medium">✓ All items well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reorder: {item.reorder_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/orders/new"
            className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <span className="text-3xl mb-2">➕</span>
            <span className="text-sm font-medium text-gray-900">New Order</span>
          </Link>
          <Link
            to="/clients"
            className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <span className="text-3xl mb-2">👥</span>
            <span className="text-sm font-medium text-gray-900">Manage Clients</span>
          </Link>
          <Link
            to="/payments"
            className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
          >
            <span className="text-3xl mb-2">💰</span>
            <span className="text-sm font-medium text-gray-900">Record Payment</span>
          </Link>
          <Link
            to="/reports"
            className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
          >
            <span className="text-3xl mb-2">📈</span>
            <span className="text-sm font-medium text-gray-900">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;