// src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await api.orders.get(id);
      setOrder(response.data);
      setPaymentAmount(response.data.balance_due);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.orders.updateStatus(id, newStatus);
      alert('Order status updated successfully!');
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (parseFloat(paymentAmount) <= 0) {
      alert('Payment amount must be greater than zero');
      return;
    }

    try {
      await api.payments.create({
        order: id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        reference_number: paymentReference,
      });
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchOrderDetail();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <div className="text-lg text-gray-600">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link to="/orders" className="text-blue-600 hover:text-blue-800 mt-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link
              to="/orders"
              className="text-gray-600 hover:text-gray-900 print:hidden"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Order {order.order_number}
            </h1>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Created on {formatDateTime(order.order_date)}
          </p>
        </div>
        {order.balance_due > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Record Payment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Client Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {order.client.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{order.client.phone}</p>
              </div>
              {order.client.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {order.client.email}
                  </p>
                </div>
              )}
              {order.client.address && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {order.client.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Service
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.service_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity} {item.service_unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment History
              </h2>
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(payment.payment_date)}
                      </p>
                      {payment.reference_number && (
                        <p className="text-xs text-gray-500">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadge(
                        payment.payment_method
                      )}`}
                    >
                      {payment.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Financial Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(order.amount_paid)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Balance Due:</span>
                <span
                  className={`font-bold text-lg ${
                    order.balance_due > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(order.balance_due)}
                </span>
              </div>
              {order.is_paid && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg text-center">
                  <span className="text-green-800 font-semibold">✓ Fully Paid</span>
                </div>
              )}
              {order.is_overdue && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg text-center">
                  <span className="text-red-800 font-semibold">
                    ⚠️ Payment Overdue
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Pickup Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(order.pickup_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(order.due_date)}
                </p>
              </div>
              {order.completed_date && (
                <div>
                  <p className="text-sm text-gray-600">Completed Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(order.completed_date)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="font-medium text-gray-900">
                  {order.created_by_name || 'N/A'}
                </p>
              </div>
              {order.assigned_driver_name && (
                <div>
                  <p className="text-sm text-gray-600">Assigned Driver</p>
                  <p className="font-medium text-gray-900">
                    {order.assigned_driver_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-lg shadow p-6 print:hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <div className="space-y-2">
              {['PENDING', 'IN_PROGRESS', 'READY', 'COMPLETED'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={order.status === status}
                    className={`w-full px-4 py-3 text-sm font-medium rounded-lg ${
                      order.status === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {order.status === status ? '✓ ' : ''}
                    {status.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6 print:hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                🖨️ Print Receipt
              </button>
              <Link
                to={`/orders/${id}/edit`}
                className="block w-full px-4 py-3 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 text-center"
              >
                ✏️ Edit Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Record Payment
              </h2>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Order Total:</span>
                  <span className="font-semibold">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Already Paid:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(order.amount_paid)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-sm font-semibold text-gray-900">
                    Balance Due:
                  </span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(order.balance_due)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount (UGX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
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
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction ID (optional)"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
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
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default OrderDetail;