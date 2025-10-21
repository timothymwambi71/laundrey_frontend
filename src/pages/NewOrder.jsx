// src/pages/NewOrder.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function NewOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    clientName: '',
    status: 'PENDING',
    pickup_date: '',
    due_date: '',
    assigned_driver: '',
    notes: '',
  });

  const [orderItems, setOrderItems] = useState([
    { service: '', quantity: 1, unit_price: 0, service_name: '' },
  ]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes, driversRes] = await Promise.all([
          api.clients.list(),
          api.services.list(),
          api.staff.drivers(),
        ]);
        setClients(clientsRes.data.results || clientsRes.data);
        setServices(servicesRes.data.results || servicesRes.data);
        setDrivers(driversRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Please refresh the page.');
      }
    };
    fetchData();
  }, []);

  // Filter clients based on search
  const filteredClients = clients.filter((client) =>
    `${client.first_name} ${client.last_name} ${client.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Handle client selection
  const handleClientSelect = (client) => {
    setFormData({
      ...formData,
      client: client.id,
      clientName: `${client.first_name} ${client.last_name} - ${client.phone}`,
    });
    setSearchTerm(`${client.first_name} ${client.last_name}`);
    setShowClientDropdown(false);
  };

  // Handle service selection in order item
  const handleServiceChange = (index, serviceId) => {
    const selectedService = services.find((s) => s.id === parseInt(serviceId));
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      service: serviceId,
      unit_price: selectedService ? selectedService.price : 0,
      service_name: selectedService ? selectedService.name : '',
    };
    setOrderItems(newItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index, quantity) => {
    const newItems = [...orderItems];
    newItems[index].quantity = parseFloat(quantity) || 0;
    setOrderItems(newItems);
  };

  // Add new item row
  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { service: '', quantity: 1, unit_price: 0, service_name: '' },
    ]);
  };

  // Remove item row
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + item.quantity * item.unit_price;
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.client) {
      alert('Please select a client');
      return;
    }

    const validItems = orderItems.filter((item) => item.service && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid order item');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        client: formData.client,
        status: formData.status,
        pickup_date: formData.pickup_date || null,
        due_date: formData.due_date || null,
        assigned_driver: formData.assigned_driver || null,
        notes: formData.notes,
        items: validItems.map((item) => ({
          service: item.service,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const response = await api.orders.create(orderData);
      alert('Order created successfully!');
      navigate(`/orders/${response.data.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
        <p className="mt-2 text-sm text-gray-600">Create a new laundry order</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {/* Client Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Search client by name or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showClientDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {formData.clientName && (
            <div className="mt-2 text-sm text-green-600">
              Selected: {formData.clientName}
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY">Ready for Pickup</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Driver
            </label>
            <select
              value={formData.assigned_driver}
              onChange={(e) => setFormData({ ...formData, assigned_driver: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No driver assigned</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.first_name} {driver.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Date
            </label>
            <input
              type="date"
              value={formData.pickup_date}
              onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            <button
              type="button"
              onClick={addOrderItem}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Service
                  </label>
                  <select
                    value={item.service}
                    onChange={(e) => handleServiceChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select service...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - UGX {service.price}/{service.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="text"
                    value={`UGX ${item.unit_price}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm"
                  />
                </div>

                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Subtotal
                  </label>
                  <input
                    type="text"
                    value={`UGX ${(item.quantity * item.unit_price).toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-sm"
                  />
                </div>

                {orderItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOrderItem(index)}
                    className="mt-6 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Display */}
        <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-3xl font-bold text-blue-600">
              UGX {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Add any special instructions or notes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewOrder;