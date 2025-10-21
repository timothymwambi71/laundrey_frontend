// src/pages/PaymentsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    order: '',
    amount: '',
    payment_method: 'CASH',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        api.payments.list(),
        api.orders.list(),
      ]);
      setPayments(paymentsRes.data.results || paymentsRes.data);
      // Filter orders with outstanding balance
      const allOrders = ordersRes.data.results || ordersRes.data;
      const unpaidOrders = allOrders.filter(
        (order) => parseFloat(order.balance_due) > 0
      );
      setOrders(unpaidOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    setFormData({
      order: '',
      amount: '',
      payment_method: 'CASH',
      reference_number: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than zero');
      return;
    }

    const selectedOrder = orders.find((o) => o.id === parseInt(formData.order));
    if (parseFloat(formData.amount) > parseFloat(selectedOrder.balance_due)) {
      if (
        !window.confirm(
          'Payment amount exceeds balance due. Do you want to continue?'
        )
      ) {
        return;
      }
    }

    try {
      await api.payments.create(formData);
      alert('Payment recorded successfully!');
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert(error.response?.data?.error || 'Failed to record payment');
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      CASH: 'bg-green-100 text-green-800',
      CARD: 'bg-blue-100 text-blue-800',
      MOBILE_MONEY: 'bg-purple-100 text-purple-800',
      BANK_TRANSFER: 'bg-yellow-100 text-yellow-800',
    };
    return badges[method] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading payments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-600">
            Record and track payment transactions
          </p>
        </div>
        <button
          onClick={handleAddPayment}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          + Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Payments</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {payments.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Collected</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(
              payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">
            Orders with Balance
          </p>
          <p className="mt-2 text-3xl font-bold text-red-600">{orders.length}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No payments recorded yet
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/orders/${payment.order}`}>
                        Order #{payment.order}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadge(
                          payment.payment_method
                        )}`}
                      >
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.reference_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.received_by_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Record Payment
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Order <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.order}
                    onChange={(e) => {
                      const orderId = e.target.value;
                      const order = orders.find((o) => o.id === parseInt(orderId));
                      setFormData({
                        ...formData,
                        order: orderId,
                        amount: order ? order.balance_due : '',
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an order...</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.client_name} (Balance:{' '}
                        {formatCurrency(order.balance_due)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (UGX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reference_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction ID or reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes (optional)"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsList;