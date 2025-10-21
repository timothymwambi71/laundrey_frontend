// src/pages/Reports.jsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function Reports() {
  const [period, setPeriod] = useState('monthly');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesReport, setSalesReport] = useState(null);
  const [outstandingDemands, setOutstandingDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');

  
  
  

  useEffect(() => {
    fetchReports();
  }, [period, customDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = period === 'daily' && customDate 
        ? { period, date: customDate }
        : { period };
      
      const [salesRes, demandsRes] = await Promise.all([
        api.orders.salesReport(params),
        api.orders.outstandingDemands(),
      ]);
      setSalesReport(salesRes.data);
      setOutstandingDemands(demandsRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${parseFloat(amount).toLocaleString('en-UG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          View sales reports and outstanding payments
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setActiveTab('outstanding')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'outstanding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Outstanding Demands
          </button>
        </nav>
      </div>

      {/* Sales Report Tab */}
      {activeTab === 'sales' && salesReport && (
        <div>
      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            {period === 'daily' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            <div className="text-sm text-gray-600">
              {formatDate(salesReport.start_date)} - {formatDate(salesReport.end_date)}
            </div>
            
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 print:hidden"
            >
              🖨️ Print Report
            </button>
          </div>
        </div>
      </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {salesReport.total_orders}
              </p>
              <p className="mt-1 text-xs text-green-600">
                {salesReport.completed_orders} completed
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(salesReport.total_revenue)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Payments Received</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {formatCurrency(salesReport.total_payments)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {formatCurrency(salesReport.outstanding_balance)}
              </p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white rounded-lg shadow print:hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Summary Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Average Order Value
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(salesReport.average_order_value)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Completion Rate
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {salesReport.total_orders > 0
                        ? (
                            (salesReport.completed_orders / salesReport.total_orders) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Payment Collection Rate
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {parseFloat(salesReport.total_revenue) > 0
                        ? (
                            (parseFloat(salesReport.total_payments) /
                              parseFloat(salesReport.total_revenue)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Period Type</span>
                    <span className="text-lg font-bold text-blue-600">
                      {period.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outstanding Demands Tab */}
      {activeTab === 'outstanding' && (
        <div>
          <div className="mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>{outstandingDemands.length} orders</strong> with outstanding
                    balance. Total outstanding:{' '}
                    <strong>
                      {formatCurrency(
                        outstandingDemands.reduce(
                          (sum, o) => sum + parseFloat(o.balance_due),
                          0
                        )
                      )}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Orders with Outstanding Balance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {outstandingDemands.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-lg font-medium">No outstanding demands!</p>
                        <p className="text-sm">All payments are up to date.</p>
                      </td>
                    </tr>
                  ) : (
                    outstandingDemands.map((order) => (
                      <tr
                        key={order.order_number}
                        className={order.is_overdue ? 'bg-red-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.client_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.client_phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(order.amount_paid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                          {formatCurrency(order.balance_due)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.due_date ? formatDate(order.due_date) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.is_overdue ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              PENDING
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;