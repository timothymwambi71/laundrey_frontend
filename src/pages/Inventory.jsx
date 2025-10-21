// src/pages/Inventory.jsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'DETERGENT',
    quantity: '',
    unit: 'pieces',
    reorder_level: '',
    cost_per_unit: '',
  });

  const categories = [
    { value: 'DETERGENT', label: 'Detergent' },
    { value: 'SOFTENER', label: 'Fabric Softener' },
    { value: 'BAG', label: 'Plastic Bag' },
    { value: 'HANGER', label: 'Hanger' },
    { value: 'STARCH', label: 'Starch' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.inventory.list();
      setItems(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'DETERGENT',
      quantity: '',
      unit: 'pieces',
      reorder_level: '',
      cost_per_unit: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorder_level,
      cost_per_unit: item.cost_per_unit || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await api.inventory.update(editingItem.id, formData);
        alert('Inventory item updated successfully!');
      } else {
        await api.inventory.create(formData);
        alert('Inventory item added successfully!');
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert(error.response?.data?.error || 'Failed to save inventory item');
    }
  };

  const handleRestock = (item) => {
    setRestockItem(item);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(restockQuantity) <= 0) {
      alert('Quantity must be greater than zero');
      return;
    }

    try {
      await api.inventory.restock(restockItem.id, {
        quantity: restockQuantity,
      });
      alert('Stock added successfully!');
      setShowRestockModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error restocking item:', error);
      alert('Failed to add stock');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      await api.inventory.delete(id);
      alert('Inventory item deleted successfully!');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `UGX ${parseFloat(amount).toLocaleString()}`;
  };

  const filteredItems = filterCategory
    ? items.filter((item) => item.category === filterCategory)
    : items;

  const lowStockCount = items.filter((item) => item.needs_reorder).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage consumable supplies
            {lowStockCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                ⚠️ {lowStockCount} item{lowStockCount > 1 ? 's' : ''} low on stock
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          + Add Item
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filterCategory === ''
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filterCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Per Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 ${
                      item.needs_reorder ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.quantity).toFixed(2)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {parseFloat(item.reorder_level).toFixed(2)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.cost_per_unit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(item.total_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.needs_reorder ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleRestock(item)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      <option value="pieces">Pieces</option>
                      <option value="liters">Liters</option>
                      <option value="kg">Kilograms</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.reorder_level}
                      onChange={(e) =>
                        setFormData({ ...formData, reorder_level: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Per Unit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_per_unit}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_per_unit: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
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

      {/* Restock Modal */}
      {showRestockModal && restockItem && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Restock: {restockItem.name}
              </h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(restockItem.quantity).toFixed(2)} {restockItem.unit}
                </p>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Add <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                  {restockQuantity && (
                    <p className="mt-2 text-sm text-gray-600">
                      New stock will be:{' '}
                      <span className="font-semibold">
                        {(
                          parseFloat(restockItem.quantity) +
                          parseFloat(restockQuantity)
                        ).toFixed(2)}{' '}
                        {restockItem.unit}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRestockModal(false)}
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

export default Inventory;