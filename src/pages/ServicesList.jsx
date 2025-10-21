// src/pages/ServicesList.jsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'piece',
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.services.list();
      setServices(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      unit: 'piece',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      unit: service.unit,
      is_active: service.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.price) <= 0) {
      alert('Price must be greater than zero');
      return;
    }

    try {
      if (editingService) {
        await api.services.update(editingService.id, formData);
        alert('Service updated successfully!');
      } else {
        await api.services.create(formData);
        alert('Service added successfully!');
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert(error.response?.data?.error || 'Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await api.services.delete(id);
      alert('Service deleted successfully!');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const toggleActive = async (service) => {
    try {
      await api.services.update(service.id, {
        ...service,
        is_active: !service.is_active,
      });
      fetchServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Failed to update service status');
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading services...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-2 text-sm text-gray-600">Manage laundry service types and pricing</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          + Add Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No services found</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-lg shadow p-6 ${
                !service.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.description || 'No description'}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    service.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    per {service.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(service)}
                  className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100"
                >
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Shirt Washing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the service"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (UGX) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram</option>
                      <option value="load">Load</option>
                      <option value="pair">Pair</option>
                      <option value="set">Set</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Service is active
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    {editingService ? 'Update Service' : 'Add Service'}
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

export default ServicesList;