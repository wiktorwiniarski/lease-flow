import { useState, useEffect } from 'react';
import { Calendar, Building2, Users, Menu, X, LogOut, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Apartments from './components/Apartments';
import Tenants from './components/Tenants';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import { initializeDatabase } from './database/init';
import { useEntity } from './hooks/useEntity';
import { userEntityConfig } from './entities/User';

type User = {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  provider: string;
  provider_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'apartments' | 'tenants' | 'account'>('dashboard');
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const { items: users, create: createUser } = useEntity<User>(userEntityConfig);

  useEffect(() => {
    initializeDatabase()
      .then(() => setDbReady(true))
      .catch(err => {
        console.error('Database initialization failed:', err);
        setDbError(err instanceof Error ? err.message : 'Database init failed');
      });

    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = async (email: string, password: string, provider: string) => {
    if (!dbReady) {
      throw new Error('Database not ready');
    }

    if (provider === 'email') {
      // Email login
      const user = users.find(u => u.email === email && u.provider === 'email');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In a real app, verify password hash
      if (user.password !== password) {
        throw new Error('Invalid email or password');
      }

      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else if (provider === 'google') {
      // Simulate Google OAuth
      const mockGoogleUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        email: `google_${Date.now()}@google.com`,
        password: '',
        first_name: 'Google',
        last_name: 'User',
        provider: 'google',
        provider_id: `google_${Date.now()}`,
        avatar_url: 'https://www.gstatic.com/images/branding/product/1x/googleg_standard_color_128dp.png',
      };

      const existingUser = users.find(u => u.provider === 'google' && u.provider_id === mockGoogleUser.provider_id);
      if (existingUser) {
        setCurrentUser(existingUser);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
      } else {
        const newUser = await createUser(mockGoogleUser) as any;
        setCurrentUser(newUser);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      }
    } else if (provider === 'facebook') {
      // Simulate Facebook OAuth
      const mockFacebookUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        email: `facebook_${Date.now()}@facebook.com`,
        password: '',
        first_name: 'Facebook',
        last_name: 'User',
        provider: 'facebook',
        provider_id: `facebook_${Date.now()}`,
        avatar_url: 'https://www.facebook.com/images/icons/logo.png',
      };

      const existingUser = users.find(u => u.provider === 'facebook' && u.provider_id === mockFacebookUser.provider_id);
      if (existingUser) {
        setCurrentUser(existingUser);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
      } else {
        const newUser = await createUser(mockFacebookUser) as any;
        setCurrentUser(newUser);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      }
    }
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string, provider: string) => {
    if (!dbReady) {
      throw new Error('Database not ready');
    }

    if (provider === 'email') {
      // Email registration
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const newUser = await createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        provider: 'email',
      }) as any;

      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } else if (provider === 'google') {
      // Simulate Google OAuth registration
      const mockGoogleUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        email: `google_${Date.now()}@google.com`,
        password: '',
        first_name: 'Google',
        last_name: 'User',
        provider: 'google',
        provider_id: `google_${Date.now()}`,
      };

      const newUser = await createUser(mockGoogleUser) as any;
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } else if (provider === 'facebook') {
      // Simulate Facebook OAuth registration
      const mockFacebookUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        email: `facebook_${Date.now()}@facebook.com`,
        password: '',
        first_name: 'Facebook',
        last_name: 'User',
        provider: 'facebook',
        provider_id: `facebook_${Date.now()}`,
      };

      const newUser = await createUser(mockFacebookUser) as any;
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setAuthMode('login');
    setActiveTab('dashboard');
  };

  const handleUpdateUser = async (data: any) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-light">Initializing database...</p>
          {dbError && <p className="text-red-600 mt-2 text-sm">{dbError}</p>}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return authMode === 'login' ? (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthMode('register')}
      />
    ) : (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthMode('login')}
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'apartments', label: 'Apartments', icon: Building2 },
    { id: 'tenants', label: 'Tenants', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed sm:relative w-64 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      }`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lease Flow</h1>
              <p className="text-xs text-gray-600 font-light">Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as 'dashboard' | 'apartments' | 'tenants');
                  setSidebarOpen(false);
                }}
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

          {/* User Section */}
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-gray-200">
              <p className="text-xs text-gray-600 font-light">Logged in as</p>
              <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.first_name} {currentUser?.last_name}</p>
              <p className="text-xs text-gray-600 font-light truncate">{currentUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-2xl transition-all hover:bg-red-100 active:scale-95 transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 font-light text-center">v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.first_name.charAt(0)}{currentUser?.last_name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'apartments' && <Apartments />}
            {activeTab === 'tenants' && <Tenants />}
            {activeTab === 'account' && currentUser && <Account user={currentUser} onUpdate={handleUpdateUser} onBack={() => setActiveTab('dashboard')} onLogout={handleLogout} />}
          </div>
        </div>
      </main>
    </div>
  );
}
