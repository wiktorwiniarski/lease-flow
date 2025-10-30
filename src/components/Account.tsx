import { useState } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, Bell, Lock, Trash2, ArrowLeft, Save } from 'lucide-react';

interface AccountProps {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    provider: string;
    avatar_url?: string;
  };
  onUpdate: (data: any) => Promise<void>;
  onBack: () => void;
  onLogout: () => void;
}

export default function Account({ user, onUpdate, onBack, onLogout }: AccountProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: '',
    company: 'Lease Flow Management',
    address: '',
    city: '',
    country: '',
  });

  // Billing State
  const [billingData, setBillingData] = useState({
    card_name: 'John Doe',
    card_number: '**** **** **** 4242',
    expiry: '12/25',
    billing_address: 'Same as profile address',
    billing_email: user.email,
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    lease_reminders: true,
    payment_alerts: true,
    news_updates: false,
    dark_mode: false,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await onUpdate({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Simulate billing update
      setMessage({ type: 'success', text: 'Billing information updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update billing information' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesChange = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key as keyof typeof preferences] }));
  };

  const handlePreferencesSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Simulate preferences update
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Simulate account deletion
      setMessage({ type: 'success', text: 'Account deletion initiated. You will be logged out.' });
      setTimeout(() => onLogout(), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors transform hover:scale-110"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-600 font-light">Manage your account and preferences</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-sm">
              <nav className="space-y-1 p-4">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'billing', label: 'Billing', icon: CreditCard },
                  { id: 'preferences', label: 'Preferences', icon: Bell },
                  { id: 'security', label: 'Security', icon: Lock },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {/* Message Alert */}
            {message && (
              <div className={`mb-6 p-4 rounded-3xl border-2 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`${
                  message.type === 'success'
                    ? 'text-green-700 font-medium'
                    : 'text-red-700 font-medium'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    
                    {/* Avatar Section */}
                    <div className="mb-8 pb-8 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Profile Picture</p>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </div>
                        <button className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-2xl transition-all hover:bg-gray-200 active:scale-95 transform hover:scale-105">
                          Change Picture
                        </button>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-semibold block">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-semibold block">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Email - Read Only */}
                    <div className="space-y-2 mb-6">
                      <label className="text-gray-700 text-sm font-semibold block">Email Address</label>
                      <div className="flex items-center px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl text-gray-900">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-transparent flex-1 text-gray-600 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500 font-light ml-2">
                          {user.provider === 'email' ? 'Primary' : `Connected via ${user.provider}`}
                        </span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2 mb-6">
                      <label className="text-gray-700 text-sm font-semibold block">Phone Number</label>
                      <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-2xl">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="+1 (555) 000-0000"
                          className="bg-transparent flex-1 text-gray-900 placeholder-gray-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div className="space-y-2 mb-6">
                      <label className="text-gray-700 text-sm font-semibold block">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={profileData.company}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-2 mb-6">
                      <label className="text-gray-700 text-sm font-semibold block">Address</label>
                      <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-2xl">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          placeholder="Street address"
                          className="bg-transparent flex-1 text-gray-900 placeholder-gray-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-semibold block">City</label>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          placeholder="City"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-semibold block">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={profileData.country}
                          onChange={handleProfileChange}
                          placeholder="Country"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleProfileSave}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>

                  {/* Subscription Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-6 mb-8">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 font-light mb-2">Current Plan</p>
                        <p className="text-2xl font-bold text-gray-900">Professional</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-light mb-2">Billing Cycle</p>
                        <p className="text-2xl font-bold text-gray-900">Monthly</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-light mb-2">Next Renewal</p>
                        <p className="text-2xl font-bold text-gray-900">Nov 29, 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="pb-8 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-semibold block">Cardholder Name</label>
                        <input
                          type="text"
                          name="card_name"
                          value={billingData.card_name}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-semibold block">Card Number</label>
                          <div className="px-4 py-3 border-2 border-gray-300 rounded-2xl bg-gray-50 text-gray-600 font-mono">
                            {billingData.card_number}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-semibold block">Expiry Date</label>
                          <div className="px-4 py-3 border-2 border-gray-300 rounded-2xl bg-gray-50 text-gray-600 font-mono">
                            {billingData.expiry}
                          </div>
                        </div>
                      </div>
                      <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl transition-all hover:bg-gray-200 active:scale-95 transform hover:scale-105">
                        Update Card
                      </button>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="pb-8 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Address</h3>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-semibold block">Address</label>
                      <textarea
                        name="billing_address"
                        value={billingData.billing_address}
                        onChange={(e) => setBillingData({...billingData, billing_address: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Billing Email */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Email</h3>
                    <input
                      type="email"
                      name="billing_email"
                      value={billingData.billing_email}
                      onChange={handleBillingChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleBillingSave}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Billing Information
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    {[
                      { key: 'email_notifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                      { key: 'lease_reminders', label: 'Lease Reminders', description: 'Get notified about upcoming lease dates' },
                      { key: 'payment_alerts', label: 'Payment Alerts', description: 'Receive alerts for payment due dates' },
                      { key: 'news_updates', label: 'News & Updates', description: 'Subscribe to our newsletter and product updates' },
                    ].map(({ key, label, description }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:bg-gray-100 transition-all"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{label}</p>
                          <p className="text-sm text-gray-600 font-light">{description}</p>
                        </div>
                        <button
                          onClick={() => handlePreferencesChange(key)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors transform hover:scale-110 ${
                            preferences[key as keyof typeof preferences] ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              preferences[key as keyof typeof preferences] ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Theme Preference */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:bg-gray-100 transition-all">
                      <div>
                        <p className="font-semibold text-gray-900">Dark Mode</p>
                        <p className="text-sm text-gray-600 font-light">Use dark theme (coming soon)</p>
                      </div>
                      <button
                        onClick={() => handlePreferencesChange('dark_mode')}
                        disabled
                        className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors opacity-50 cursor-not-allowed"
                      >
                        <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePreferencesSave}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

                  {/* Change Password */}
                  {user.provider === 'email' && (
                    <div className="pb-8 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-semibold block">Current Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-semibold block">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-semibold block">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          />
                        </div>
                        <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 active:scale-95 transform hover:scale-105">
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connected Accounts */}
                  <div className="pb-8 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Connected Accounts</h3>
                    <div className="space-y-3">
                      {user.provider === 'google' && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-700">G</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Google Account</p>
                              <p className="text-sm text-gray-600 font-light">Connected on Oct 29, 2024</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 text-red-600 font-semibold hover:bg-red-100 rounded-lg transition-all">
                            Disconnect
                          </button>
                        </div>
                      )}
                      {user.provider === 'facebook' && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-700">f</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Facebook Account</p>
                              <p className="text-sm text-gray-600 font-light">Connected on Oct 29, 2024</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 text-red-600 font-semibold hover:bg-red-100 rounded-lg transition-all">
                            Disconnect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 font-light mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-2xl transition-all hover:bg-red-700 active:scale-95 transform hover:scale-105 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-red-700 font-semibold">Are you absolutely sure? This cannot be undone.</p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-2xl transition-all hover:bg-red-700 active:scale-95 transform hover:scale-105 disabled:opacity-50"
                          >
                            Yes, delete my account
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all hover:bg-gray-400 active:scale-95 transform hover:scale-105"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
