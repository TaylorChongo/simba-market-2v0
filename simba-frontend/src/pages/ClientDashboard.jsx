import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Package, Settings, LogOut, Save, Loader2, CheckCircle2, AlertCircle, Clock, History, Lock, Shield, Pencil, X as CloseIcon, SlidersHorizontal, Moon, Languages } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const ClientDashboard = () => {
  const { user, logout, updateUser, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: '', error: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && token) {
      fetchOrders();
    }
  }, [activeTab, token]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setIsEditing(false);
    // Reset statuses when changing tabs
    setStatus({ loading: false, success: '', error: '' });
    setPasswordStatus({ loading: false, success: '', error: '' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        setStatus({ loading: false, success: 'Profile updated successfully!', error: '' });
        setIsEditing(false);
        setTimeout(() => setStatus(prev => ({ ...prev, success: '' })), 3000);
      } else {
        setStatus({ loading: false, success: '', error: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setStatus({ loading: false, success: '', error: 'Server error. Please try again later.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, success: '', error: 'New passwords do not match' });
      return;
    }

    setPasswordStatus({ loading: true, success: '', error: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ loading: false, success: 'Password changed successfully!', error: '' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordStatus(prev => ({ ...prev, success: '' })), 3000);
      } else {
        setPasswordStatus({ loading: false, success: '', error: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordStatus({ loading: false, success: '', error: 'Server error. Please try again later.' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { id: 'settings', label: 'Security', icon: Lock },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'kin', label: 'Kinyarwanda', flag: '🇷🇼' }
  ];

  const { language, setLanguage } = useLanguage();

  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
  });

  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');
  }, [orders]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest">
      <Navbar />
      
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-surface border border-outline-variant rounded-3xl overflow-hidden sticky top-24 shadow-sm">
              <div className="p-6 bg-primary/5 border-b border-outline-variant">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-inner">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-on-surface truncate">{user?.name}</h2>
                <p className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block uppercase tracking-widest font-black mt-1">
                  {user?.role}
                </p>
              </div>

              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? '' : 'text-outline'}`} />
                    <span className="font-bold text-sm">{tab.label}</span>
                  </button>
                ))}
                <div className="h-px bg-outline-variant my-2 mx-4" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-error hover:bg-error/5 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold text-sm">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-grow">
            <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 min-h-[500px] shadow-sm">
              {activeTab === 'profile' && (
                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-black tracking-tight">Profile Information</h1>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all shadow-sm"
                        title="Edit Profile"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-outline mb-8 font-medium">View and update your account details.</p>

                  {!isEditing ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1.5 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/50">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Full Name</label>
                          <p className="text-lg font-bold text-on-surface">{user?.name}</p>
                        </div>
                        <div className="space-y-1.5 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/50">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Email Address</label>
                          <p className="text-lg font-bold text-on-surface">{user?.email}</p>
                        </div>
                      </div>

                      <div className="p-6 bg-surface-container-low rounded-[32px] border border-outline-variant">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest">Account Security</h3>
                        </div>
                        <p className="text-xs text-outline mb-4 font-medium leading-relaxed">Your current access level in the Simba Market system. This determines your permissions and features.</p>
                        <div className="inline-flex items-center px-4 py-2 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                          {user?.role} Access
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline ml-1">Full Name</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline ml-1">Email Address</label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-[24px] border border-outline-variant">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-black uppercase tracking-widest">Account Security</h3>
                        </div>
                        <p className="text-xs text-outline mb-4 font-medium">Your current access level in the Simba Market system.</p>
                        <div className="inline-flex items-center px-4 py-1.5 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest rounded-full shadow-md shadow-primary/20">
                          {user?.role}
                        </div>
                      </div>

                      {status.error && (
                        <div className="flex items-center gap-3 p-4 bg-error/10 text-error rounded-2xl border border-error/20 animate-in shake duration-300">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <p className="text-sm font-bold">{status.error}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="px-6 h-12 rounded-xl font-black border-outline-variant hover:bg-surface-container-high"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={status.loading}
                          className="px-10 h-12 flex items-center gap-2 rounded-xl font-black"
                        >
                          {status.loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          <span>Save Changes</span>
                        </Button>
                      </div>
                    </form>
                  )}

                  {status.success && (
                    <div className="mt-6 flex items-center gap-3 p-4 bg-success/10 text-success rounded-2xl border border-success/20 animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-bold">{status.success}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">My Orders</h1>
                      <p className="text-outline font-medium">Track your active orders and view past purchases.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={ordersLoading} className="rounded-full px-5">
                      {ordersLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Loader2 className="w-4 h-4 mr-2" />}
                      Refresh
                    </Button>
                  </div>

                  {ordersLoading && orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                      <p className="text-outline font-black uppercase tracking-widest text-xs">Loading your orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-12">
                      {/* Active Orders Section */}
                      {activeOrders.length > 0 && (
                        <div className="space-y-6">
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-2">
                            <Clock className="w-4 h-4" /> Active Orders
                          </h2>
                          <div className="space-y-4">
                            {activeOrders.map((order) => (
                              <OrderCard key={order.id} order={order} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* History Section */}
                      {historyOrders.length > 0 && (
                        <div className="space-y-6">
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline flex items-center gap-2 px-2">
                            <History className="w-4 h-4" /> Order History
                          </h2>
                          <div className="space-y-4">
                            {historyOrders.map((order) => (
                              <OrderCard key={order.id} order={order} isHistory />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[32px]">
                      <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 text-outline">
                        <Package className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl font-black mb-2">No Orders Found</h2>
                      <p className="text-outline max-w-sm mx-auto mb-8 font-medium">
                        You haven't placed any orders yet. Start shopping to see your purchase history here.
                      </p>
                      <Button onClick={() => navigate('/')} className="rounded-xl font-black px-8 h-12">Go Shopping</Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                  <h1 className="text-3xl font-black tracking-tight mb-2">App Preferences</h1>
                  <p className="text-outline font-medium mb-10">Customize your shopping experience and notifications.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Visual Preferences */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <Moon className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Appearance</h2>
                      </div>
                      
                      <div className="p-6 bg-surface-container-low rounded-[32px] border border-outline-variant flex items-center justify-between shadow-sm">
                        <div>
                          <h3 className="font-black text-sm">Dark Mode</h3>
                          <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Switch between light and dark themes</p>
                        </div>
                        <ThemeToggle />
                      </div>

                      <div className="p-6 bg-surface-container-low rounded-[32px] border border-outline-variant shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <Languages className="w-5 h-5 text-primary" />
                          <h3 className="font-black text-sm">Language Settings</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => setLanguage(lang.code)}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                language === lang.code 
                                  ? 'bg-primary/10 border-primary text-primary font-bold' 
                                  : 'border-outline-variant text-outline hover:bg-surface-container-high'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm font-black uppercase tracking-widest">{lang.label}</span>
                              </div>
                              {language === lang.code && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <Settings className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Notifications</h2>
                      </div>

                      <div className="space-y-4">
                        <div className="p-6 bg-surface-container-low rounded-[32px] border border-outline-variant flex items-center justify-between shadow-sm group">
                          <div>
                            <h3 className="font-black text-sm group-hover:text-primary transition-colors">Email Notifications</h3>
                            <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Order Updates & Offers</p>
                          </div>
                          <button 
                            onClick={() => setNotifications(prev => ({...prev, email: !prev.email}))}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notifications.email ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-outline-variant/50'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${notifications.email ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                        
                        <div className="p-6 bg-surface-container-low rounded-[32px] border border-outline-variant flex items-center justify-between shadow-sm group">
                          <div>
                            <h3 className="font-black text-sm group-hover:text-primary transition-colors">Marketing Emails</h3>
                            <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Weekly deals & discounts</p>
                          </div>
                          <button 
                            onClick={() => setNotifications(prev => ({...prev, marketing: !prev.marketing}))}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notifications.marketing ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-outline-variant/50'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${notifications.marketing ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="p-6 border-2 border-dashed border-primary/20 bg-primary/5 rounded-[32px] flex items-center justify-center text-center">
                          <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
                            Preference changes are saved <br /> automatically to your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                  <h1 className="text-3xl font-black tracking-tight mb-2">Account Security</h1>
                  <p className="text-outline font-medium mb-10">Manage your password and account status.</p>
                  
                  <div className="space-y-8">
                    {/* Security Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <Lock className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Security</h2>
                      </div>
                      
                      <form onSubmit={handleChangePassword} className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant space-y-6 shadow-sm">
                        <h3 className="font-black text-lg mb-2">Change Password</h3>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Current Password</label>
                          <Input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">New Password</label>
                            <Input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required
                              className="h-12 rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Confirm New Password</label>
                            <Input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                              className="h-12 rounded-xl"
                            />
                          </div>
                        </div>

                        {passwordStatus.error && (
                          <div className="p-4 bg-error/10 text-error rounded-2xl text-xs font-bold border border-error/20 flex items-center gap-3">
                            <AlertCircle className="w-4 h-4" />
                            {passwordStatus.error}
                          </div>
                        )}

                        {passwordStatus.success && (
                          <div className="p-4 bg-success/10 text-success rounded-2xl text-xs font-bold border border-success/20 flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4" />
                            {passwordStatus.success}
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={passwordStatus.loading}
                          className="w-full h-14 rounded-2xl font-black mt-4 shadow-lg shadow-primary/20"
                        >
                          {passwordStatus.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                        </Button>
                      </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-8 border-2 border-dashed border-error/20 bg-error/5 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="font-black text-lg text-error mb-1">Delete Account</h3>
                        <p className="text-xs text-error/60 font-bold uppercase tracking-widest">This action is permanent and cannot be undone.</p>
                      </div>
                      <Button variant="outline" className="w-full md:w-auto text-[11px] font-black uppercase tracking-[0.2em] border-error/30 text-error hover:bg-error/10 h-12 px-8 rounded-2xl transition-all">
                        Deactivate Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const OrderCard = ({ order, isHistory = false }) => (
  <div className={`p-6 border rounded-[32px] transition-all group shadow-sm ${isHistory ? 'bg-surface border-outline-variant/30 grayscale-[0.5] opacity-80' : 'bg-surface border-outline-variant hover:border-primary hover:shadow-xl hover:shadow-primary/5'}`}>
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isHistory ? 'bg-surface-container text-outline shadow-inner' : 'bg-primary/10 text-primary shadow-lg shadow-primary/5 group-hover:scale-110'}`}>
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-widest">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
          <p className="text-[10px] text-outline uppercase tracking-[0.2em] font-black mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
          order.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
          order.status === 'CANCELLED' ? 'bg-error/10 text-error border-error/20' :
          order.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
          order.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
          'bg-primary/10 text-primary border-primary/20'
        }`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-surface-container-lowest/50 rounded-[28px] border border-outline-variant/50">
      <div className="space-y-3">
        <p className="text-[9px] font-black text-outline uppercase tracking-[0.2em] mb-1 px-1">Order Items</p>
        <div className="flex -space-x-3 overflow-hidden p-1">
          {order.items.map((item, i) => (
            <img 
              key={i}
              src={item.product.image} 
              alt={item.product.name}
              className="w-10 h-10 rounded-full border-4 border-surface object-cover shadow-md group-hover:translate-x-1 transition-transform"
              title={`${item.quantity}x ${item.product.name}`}
            />
          ))}
          {order.items.length > 5 && (
            <div className="w-10 h-10 rounded-full border-4 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-black text-outline shadow-md">
              +{order.items.length - 5}
            </div>
          )}
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-on-surface px-1">{order.items.reduce((acc, item) => acc + item.quantity, 0)} total items</p>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-black text-outline uppercase tracking-[0.2em] mb-1 px-1">Fulfillment</p>
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-xs font-black uppercase tracking-widest leading-tight">{order.branchName?.replace('Simba Supermarket ', '') || 'Processing'}</p>
        </div>
        <p className="text-[10px] text-outline font-bold uppercase tracking-widest px-1 ml-3.5">{order.pickupTime ? `Pickup: ${order.pickupTime}` : 'Standard Delivery'}</p>
      </div>

      <div className="md:text-right space-y-1">
        <p className="text-[9px] font-black text-outline uppercase tracking-[0.2em] mb-1 px-1">Order Total</p>
        <p className="text-2xl font-black text-primary tracking-tight">{order.totalPrice.toLocaleString()} <span className="text-xs font-bold">RWF</span></p>
        {order.depositPaid && (
          <div className="flex items-center md:justify-end gap-1.5 mt-2">
            <div className="bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
               <CheckCircle2 className="w-2.5 h-2.5" /> 
               <span className="text-[8px] font-black uppercase tracking-widest">Deposit Paid</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ClientDashboard;
