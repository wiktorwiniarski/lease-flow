import { useState } from 'react';
import { useEntity } from '../hooks/useEntity';
import { tenantEntityConfig } from '../entities/Tenant';
import { apartmentEntityConfig } from '../entities/Apartment';
import { attachmentEntityConfig } from '../entities/Attachment';
import { Users, Plus, Trash2, Edit2, X, Eye, FileText, Upload, Download } from 'lucide-react';

type Tenant = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  residential_address?: string;
  country_of_residence?: string;
  apartment_id: number;
  rent_amount: number;
  contract_start_date: string;
  contract_end_date: string;
  deposit_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type Attachment = {
  id: number;
  tenant_id: number;
  type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type Apartment = {
  id: number;
  name: string;
  address: string;
  apartment_number: string;
  created_at: string;
  updated_at: string;
};

const ATTACHMENT_TYPES = [
  { id: 'lease_agreement', label: 'Lease Agreement', icon: '📄' },
  { id: 'contract_annex', label: 'Contract Annex', icon: '📋' },
  { id: 'handover_protocol', label: 'Handover Protocol', icon: '📋' },
  { id: 'passport_id', label: 'ID/Passport Scan', icon: '🆔' },
];

export default function Tenants() {
  const { items: tenants, loading: tenantsLoading, create: createTenant, update: updateTenant, remove: removeTenant } = useEntity<Tenant>(tenantEntityConfig);
  const { items: apartments } = useEntity<Apartment>(apartmentEntityConfig);
  const { items: attachments, create: createAttachment, remove: removeAttachment } = useEntity<Attachment>(attachmentEntityConfig);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ file: File; type: string }>>([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    residential_address: '',
    country_of_residence: '',
    apartment_id: '',
    rent_amount: '',
    contract_start_date: '',
    contract_end_date: '',
    deposit_amount: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = ['first_name', 'last_name', 'apartment_id', 'contract_start_date', 'contract_end_date'];
    if (required.some(field => !formData[field as keyof typeof formData])) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let tenantId: number;
      
      if (editingId) {
        await updateTenant(editingId, {
          ...formData,
          apartment_id: parseInt(formData.apartment_id),
          rent_amount: parseFloat(formData.rent_amount) || 0,
          deposit_amount: parseFloat(formData.deposit_amount) || 0,
        });
        tenantId = editingId;
      } else {
        const result = await createTenant({
          ...formData,
          apartment_id: parseInt(formData.apartment_id),
          rent_amount: parseFloat(formData.rent_amount) || 0,
          deposit_amount: parseFloat(formData.deposit_amount) || 0,
        }) as any;
        tenantId = result.id || editingId;
      }

      // Upload pending attachments
      if (pendingAttachments.length > 0) {
        for (const { file, type } of pendingAttachments) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            await createAttachment({
              tenant_id: tenantId || editingId!,
              type: type,
              file_name: file.name,
              file_url: base64,
              file_size: file.size,
            });
          };
          reader.readAsDataURL(file);
        }
      }

      resetForm();
      setPendingAttachments([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('Failed to save tenant');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      date_of_birth: tenant.date_of_birth || '',
      residential_address: tenant.residential_address || '',
      country_of_residence: tenant.country_of_residence || '',
      apartment_id: tenant.apartment_id.toString(),
      rent_amount: tenant.rent_amount.toString(),
      contract_start_date: tenant.contract_start_date,
      contract_end_date: tenant.contract_end_date,
      deposit_amount: (tenant.deposit_amount || 0).toString(),
      notes: tenant.notes || '',
    });
    setEditingId(tenant.id);
    setPendingAttachments([]);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      try {
        await removeTenant(id);
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Failed to delete tenant');
      }
    }
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsModal(true);
  };

  const handleAttachmentFile = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingAttachments([...pendingAttachments, { file, type }]);
    }
  };

  const handleRemovePendingAttachment = (index: number) => {
    setPendingAttachments(pendingAttachments.filter((_, i) => i !== index));
  };

  const handleAttachmentUploadFromDetails = async (e: React.ChangeEvent<HTMLInputElement>, tenantId: number, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await createAttachment({
          tenant_id: tenantId,
          type: type,
          file_name: file.name,
          file_url: base64,
          file_size: file.size,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      alert('Failed to upload attachment');
    }
  };

  const handleDeleteAttachment = async (id: number) => {
    if (confirm('Delete this attachment?')) {
      try {
        await removeAttachment(id);
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment');
      }
    }
  };

  const handleViewAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowAttachmentModal(true);
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      residential_address: '',
      country_of_residence: '',
      apartment_id: '',
      rent_amount: '',
      contract_start_date: '',
      contract_end_date: '',
      deposit_amount: '',
      notes: '',
    });
  };

  const getTenantAttachments = (tenantId: number) => {
    return attachments.filter(a => a.tenant_id === tenantId);
  };

  const getApartmentName = (aptId: number) => {
    const apt = apartments.find(a => a.id === aptId);
    return apt ? `${apt.name}` : `Apartment ${aptId}`;
  };

  if (tenantsLoading) {
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
          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          Tenants
        </h2>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setPendingAttachments([]);
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add Tenant
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-2 border-gray-200 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto sm:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Tenant' : 'Add New Tenant'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                  setPendingAttachments([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-gray-900 font-bold mb-4 text-sm tracking-wide">PERSONAL INFORMATION</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Country of Residence</label>
                    <input
                      type="text"
                      name="country_of_residence"
                      value={formData.country_of_residence}
                      onChange={handleInputChange}
                      placeholder="e.g., Poland"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-gray-700 text-sm font-semibold">Residential Address</label>
                  <input
                    type="text"
                    name="residential_address"
                    value={formData.residential_address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Contract Information */}
              <div className="border-t border-gray-300 pt-6">
                <h4 className="text-gray-900 font-bold mb-4 text-sm tracking-wide">CONTRACT INFORMATION</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Apartment *</label>
                    <select
                      name="apartment_id"
                      value={formData.apartment_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%231f2937' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '16px 12px',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">Select apartment</option>
                      {apartments.map((apt) => (
                        <option key={apt.id} value={apt.id}>
                          {apt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Monthly Rent (PLN) *</label>
                    <input
                      type="number"
                      name="rent_amount"
                      value={formData.rent_amount}
                      onChange={handleInputChange}
                      placeholder="1500"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Contract Start Date *</label>
                    <input
                      type="date"
                      name="contract_start_date"
                      value={formData.contract_start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-semibold">Contract End Date *</label>
                    <input
                      type="date"
                      name="contract_end_date"
                      value={formData.contract_end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-gray-700 text-sm font-semibold">Deposit Amount (PLN)</label>
                  <input
                    type="number"
                    name="deposit_amount"
                    value={formData.deposit_amount}
                    onChange={handleInputChange}
                    placeholder="3000"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="border-t border-gray-300 pt-6">
                <h4 className="text-gray-900 font-bold mb-4 text-sm tracking-wide">ATTACHMENTS</h4>
                <div className="space-y-3">
                  {ATTACHMENT_TYPES.map((type) => (
                    <div key={type.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-900 font-bold text-sm">{type.icon} {type.label}</p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleAttachmentFile(e, type.id)}
                            className="hidden"
                          />
                          <Upload className="w-4 h-4 text-blue-600 hover:scale-110 transition-transform" />
                        </label>
                      </div>
                      <div className="space-y-2">
                        {pendingAttachments
                          .filter(att => att.type === type.id)
                          .map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <p className="text-xs text-gray-700 font-medium truncate">{att.file.name}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePendingAttachment(pendingAttachments.indexOf(att))}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        {pendingAttachments.filter(att => att.type === type.id).length === 0 && (
                          <p className="text-xs text-gray-500">No file selected</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-gray-300 pt-6">
                <label className="text-gray-700 text-sm font-semibold">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mt-2"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-300">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95"
                >
                  {editingId ? 'Save Changes' : 'Add Tenant'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                    setPendingAttachments([]);
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

      {/* Attachment Viewer Modal */}
      {showAttachmentModal && selectedAttachment && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-2 border-gray-200 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto sm:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedAttachment.file_name}</h3>
              <button
                onClick={() => {
                  setShowAttachmentModal(false);
                  setSelectedAttachment(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Preview */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 min-h-96 flex items-center justify-center">
                {selectedAttachment.file_url.startsWith('data:image') ? (
                  <img
                    src={selectedAttachment.file_url}
                    alt={selectedAttachment.file_name}
                    className="max-w-full max-h-96 rounded-lg"
                  />
                ) : selectedAttachment.file_url.startsWith('data:application/pdf') ? (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">PDF Document</p>
                    <p className="text-xs text-gray-500 mt-2">{selectedAttachment.file_name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Document</p>
                    <p className="text-xs text-gray-500 mt-2">{selectedAttachment.file_name}</p>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 space-y-2">
                <p className="text-sm text-gray-700"><span className="font-semibold">Type:</span> {ATTACHMENT_TYPES.find(t => t.id === selectedAttachment.type)?.label}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Size:</span> {(selectedAttachment.file_size / 1024).toFixed(2)} KB</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleDownloadAttachment(selectedAttachment)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-green-700 hover:to-green-600 active:scale-95 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowAttachmentModal(false);
                    setSelectedAttachment(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300 hover:bg-gray-300 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-2 border-gray-200 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto sm:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedTenant.first_name} {selectedTenant.last_name}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTenant(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Details Content */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="text-gray-900 font-bold mb-3 text-sm tracking-wide">CONTACT</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {selectedTenant.email && <p><span className="font-semibold">Email:</span> {selectedTenant.email}</p>}
                  {selectedTenant.phone && <p><span className="font-semibold">Phone:</span> {selectedTenant.phone}</p>}
                  {selectedTenant.date_of_birth && <p><span className="font-semibold">DOB:</span> {selectedTenant.date_of_birth}</p>}
                  {selectedTenant.residential_address && <p><span className="font-semibold">Address:</span> {selectedTenant.residential_address}</p>}
                  {selectedTenant.country_of_residence && <p><span className="font-semibold">Country:</span> {selectedTenant.country_of_residence}</p>}
                </div>
              </div>

              {/* Contract Info */}
              <div className="border-t border-gray-300 pt-6">
                <h4 className="text-gray-900 font-bold mb-3 text-sm tracking-wide">CONTRACT</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-semibold">Apartment:</span> {getApartmentName(selectedTenant.apartment_id)}</p>
                  <p><span className="font-semibold">Start:</span> {selectedTenant.contract_start_date}</p>
                  <p><span className="font-semibold">End:</span> {selectedTenant.contract_end_date}</p>
                  <p><span className="font-semibold">Rent:</span> {selectedTenant.rent_amount} PLN</p>
                  {selectedTenant.deposit_amount && <p><span className="font-semibold">Deposit:</span> {selectedTenant.deposit_amount} PLN</p>}
                </div>
              </div>

              {/* Attachments */}
              <div className="border-t border-gray-300 pt-6">
                <h4 className="text-gray-900 font-bold mb-4 text-sm tracking-wide">ATTACHMENTS</h4>
                <div className="space-y-3">
                  {ATTACHMENT_TYPES.map((type) => {
                    const tenantAttachments = getTenantAttachments(selectedTenant.id).filter(a => a.type === type.id);
                    return (
                      <div key={type.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-900 font-bold text-sm">{type.icon} {type.label}</p>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => handleAttachmentUploadFromDetails(e, selectedTenant.id, type.id)}
                              className="hidden"
                            />
                            <Upload className="w-4 h-4 text-blue-600 hover:scale-110 transition-transform" />
                          </label>
                        </div>
                        {tenantAttachments.length === 0 ? (
                          <p className="text-xs text-gray-500">No file uploaded</p>
                        ) : (
                          tenantAttachments.map((att) => (
                            <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg mt-2 group">
                              <button
                                onClick={() => handleViewAttachment(att)}
                                className="flex items-center gap-2 flex-1 hover:text-blue-600 transition-colors text-left"
                              >
                                <FileText className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                <p className="text-xs text-gray-700 font-medium truncate group-hover:font-bold">{att.file_name}</p>
                              </button>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDownloadAttachment(att)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-all transform hover:scale-110"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAttachment(att.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-all transform hover:scale-110"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {selectedTenant.notes && (
                <div className="border-t border-gray-300 pt-6">
                  <h4 className="text-gray-900 font-bold mb-3 text-sm tracking-wide">NOTES</h4>
                  <p className="text-gray-700 text-sm font-medium">{selectedTenant.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-300">
                <button
                  onClick={() => {
                    handleEdit(selectedTenant);
                    setShowDetailsModal(false);
                    setSelectedTenant(null);
                  }}
                  className="flex-1 px-6 py-2 bg-blue-100 text-blue-600 font-semibold rounded-2xl transition-all hover:bg-blue-200 active:scale-95 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedTenant.id);
                    setShowDetailsModal(false);
                    setSelectedTenant(null);
                  }}
                  className="flex-1 px-6 py-2 bg-red-100 text-red-600 font-semibold rounded-2xl transition-all hover:bg-red-200 active:scale-95 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTenant(null);
                  }}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all hover:bg-gray-300 active:scale-95 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenants List - Mobile: Stack, Desktop: Table */}
      {tenants.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No tenants yet. Click "Add Tenant" to get started.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-300 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold">Name</th>
                    <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold">Email</th>
                    <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold">Phone</th>
                    <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold">Apartment</th>
                    <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold">Rent (PLN)</th>
                    <th className="px-6 py-4 text-right text-gray-700 text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant, idx) => (
                    <tr
                      key={tenant.id}
                      className={`border-b border-gray-300 hover:bg-gray-50 transition-all transform hover:scale-[1.01] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-gray-900 font-bold">{tenant.first_name} {tenant.last_name}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">{tenant.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">{tenant.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">{getApartmentName(tenant.apartment_id)}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{tenant.rent_amount}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(tenant)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-all hover:bg-gray-200 active:scale-95 transform hover:scale-110 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(tenant)}
                            className="p-1.5 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-all active:scale-95 transform hover:scale-110"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            className="p-1.5 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-all active:scale-95 transform hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile List */}
          <div className="sm:hidden space-y-4">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white border-2 border-gray-200 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{tenant.first_name} {tenant.last_name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{getApartmentName(tenant.apartment_id)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm font-medium text-gray-600">
                  {tenant.email && <p className="truncate"><span className="font-bold">Email:</span> {tenant.email}</p>}
                  {tenant.phone && <p><span className="font-bold">Phone:</span> {tenant.phone}</p>}
                  <p><span className="font-bold">Rent:</span> {tenant.rent_amount} PLN</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(tenant)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-all hover:bg-gray-200 active:scale-95 transform hover:scale-105 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-lg transition-all hover:bg-blue-200 active:scale-95 transform hover:scale-105 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-all hover:bg-red-200 active:scale-95 transform hover:scale-105 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
