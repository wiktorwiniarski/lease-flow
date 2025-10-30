import { useState } from 'react';
import { useEntity } from '../hooks/useEntity';
import { apartmentEntityConfig } from '../entities/Apartment';
import { Building2, Plus, Trash2, Edit2, X } from 'lucide-react';

type Apartment = {
  id: number;
  name: string;
  address: string;
  building_entrance: string;
  apartment_number: string;
  floor: string;
  size: number;
  parking_space: string;
  entrance_code: string;
  land_register_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export default function Apartments() {
  const { items: apartments, loading, create, update, remove } = useEntity<Apartment>(apartmentEntityConfig);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    building_entrance: '',
    apartment_number: '',
    floor: '',
    size: '',
    parking_space: '',
    entrance_code: '',
    land_register_number: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim() || !formData.apartment_number.trim()) {
      alert('Please fill in all required fields (Name, Address, Apartment Number)');
      return;
    }

    try {
      if (editingId) {
        await update(editingId, {
          ...formData,
          size: parseFloat(formData.size) || 0,
        });
        setEditingId(null);
      } else {
        await create({
          ...formData,
          size: parseFloat(formData.size) || 0,
        });
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving apartment:', error);
      alert('Failed to save apartment');
    }
  };

  const handleEdit = (apartment: Apartment) => {
    setFormData({
      name: apartment.name,
      address: apartment.address,
      building_entrance: apartment.building_entrance,
      apartment_number: apartment.apartment_number,
      floor: apartment.floor,
      size: apartment.size.toString(),
      parking_space: apartment.parking_space,
      entrance_code: apartment.entrance_code,
      land_register_number: apartment.land_register_number,
      notes: apartment.notes || '',
    });
    setEditingId(apartment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this apartment?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting apartment:', error);
        alert('Failed to delete apartment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      building_entrance: '',
      apartment_number: '',
      floor: '',
      size: '',
      parking_space: '',
      entrance_code: '',
      land_register_number: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          Apartments
        </h2>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add Apartment
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-2 border-gray-200 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto sm:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Apartment' : 'Add New Apartment'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-semibold">Apartment Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Apartment A1"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-semibold">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full street address"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Building Entrance */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-semibold">Building Entrance</label>
                <input
                  type="text"
                  name="building_entrance"
                  value={formData.building_entrance}
                  onChange={handleInputChange}
                  placeholder="e.g., A, 1, Main"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Apartment Number */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-semibold">Apartment Number *</label>
                <input
                  type="text"
                  name="apartment_number"
                  value={formData.apartment_number}
                  onChange={handleInputChange}
                  placeholder="e.g., 5A, 101"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Floor and Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-semibold">Floor</label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    placeholder="e.g., 3, Ground"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-semibold">Size (m²)</label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 65"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Parking and Entrance Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-semibold">Parking Space</label>
                  <input
                    type="text"
                    name="parking_space"
                    value={formData.parking_space}
                    onChange={handleInputChange}
                    placeholder="e.g., 12A"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-semibold">Entrance Code</label>
                  <input
                    type="text"
                    name="entrance_code"
                    value={formData.entrance_code}
                    onChange={handleInputChange}
                    placeholder="Door code"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Land Register Number */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-semibold">Land & Mortgage Register Number</label>
                <input
                  type="text"
                  name="land_register_number"
                  value={formData.land_register_number}
                  onChange={handleInputChange}
                  placeholder="Register number"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-semibold">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95"
                >
                  {editingId ? 'Save Changes' : 'Add Apartment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300 hover:bg-gray-300 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apartments Grid - Mobile: List, Desktop: Grid */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {apartments.length === 0 ? (
          <div className="col-span-full bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No apartments yet. Click "Add Apartment" to get started.</p>
          </div>
        ) : (
          apartments.map((apartment) => (
            <div
              key={apartment.id}
              className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 group transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{apartment.name}</h3>
                  <p className="text-gray-600 text-sm font-medium">{apartment.address}</p>
                </div>
                <div className="flex gap-2 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(apartment)}
                    className="p-2 bg-blue-100 rounded-xl text-blue-600 hover:bg-blue-200 transition-all active:scale-95 transform hover:scale-110"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(apartment.id)}
                    className="p-2 bg-red-100 rounded-xl text-red-600 hover:bg-red-200 transition-all active:scale-95 transform hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm font-medium text-gray-600 mb-4">
                <div className="flex justify-between hover:text-gray-900 transition-colors">
                  <span>Apartment #:</span>
                  <span className="text-gray-900 font-bold">{apartment.apartment_number}</span>
                </div>
                {apartment.floor && (
                  <div className="flex justify-between hover:text-gray-900 transition-colors">
                    <span>Floor:</span>
                    <span className="text-gray-900 font-bold">{apartment.floor}</span>
                  </div>
                )}
                {apartment.size && (
                  <div className="flex justify-between hover:text-gray-900 transition-colors">
                    <span>Size:</span>
                    <span className="text-gray-900 font-bold">{apartment.size} m²</span>
                  </div>
                )}
                {apartment.parking_space && (
                  <div className="flex justify-between hover:text-gray-900 transition-colors">
                    <span>Parking:</span>
                    <span className="text-gray-900 font-bold">{apartment.parking_space}</span>
                  </div>
                )}
                {apartment.entrance_code && (
                  <div className="flex justify-between hover:text-gray-900 transition-colors">
                    <span>Entrance Code:</span>
                    <span className="text-gray-900 font-mono text-xs font-bold">{apartment.entrance_code}</span>
                  </div>
                )}
              </div>

              {apartment.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium italic">{apartment.notes}</p>
                </div>
              )}

              {/* Mobile Delete/Edit Buttons */}
              <div className="sm:hidden flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(apartment)}
                  className="flex-1 p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-all active:scale-95 text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(apartment.id)}
                  className="flex-1 p-2 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-all active:scale-95 text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
