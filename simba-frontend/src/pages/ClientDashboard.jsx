import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { shortName } from '../lib/utils';

import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Package, Settings, LogOut, Save, Loader2, CheckCircle2, AlertCircle, Clock, History, Lock, Shield, Pencil, X as CloseIcon, SlidersHorizontal, Moon, Languages, Printer, Eye, EyeOff, ChevronDown, Plus, Trash2, Star, MapPin } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { printInvoice } from '../lib/printInvoice';
import RWANDA from '../data/rwanda_locations.json';
import { parseAddresses, getDefaultAddress, formatAddress, buildAddress, serialiseAddresses } from '../lib/addresses';
import AddrForm, { LABEL_PRESETS } from '../components/AddrForm';

const PROVINCES = Object.keys(RWANDA).sort();

const ClientDashboard = () => {
  const { user, logout, updateUser, token } = useAuth();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: '', error: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [editingField, setEditingField] = useState(null); // 'name' | 'email' | 'password' | null
  const [orders, setOrders] = useState([]);

  // ── Multi-address state ──────────────────────────────────────────────────
  // addresses: the live list derived from user.address (parsed on mount/user change)
  const [addresses, setAddresses] = useState(() => parseAddresses(user?.address));
  // showAddForm: whether the "add new address" panel is open
  const [showAddForm, setShowAddForm] = useState(false);
  // editingAddrIdx: index of the address being edited (null = none)
  const [editingAddrIdx, setEditingAddrIdx] = useState(null);
  // addrSaving: tracks save-in-progress for address operations
  const [addrSaving, setAddrSaving] = useState(false);
  // settingDefaultIdx: index of the address currently being promoted to default (null = idle)
  const [settingDefaultIdx, setSettingDefaultIdx] = useState(null);
  // justSetDefaultIdx: index of the address that was just made default (for success flash)
  const [justSetDefaultIdx, setJustSetDefaultIdx] = useState(null);
  // addrError: validation/server error for address form
  const [addrError, setAddrError] = useState('');

  // Form fields shared by both "add" and "edit" address forms
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrSector, setAddrSector] = useState('');
  const addrDistricts = useMemo(() => (addrProvince ? Object.keys(RWANDA[addrProvince]).sort() : []), [addrProvince]);
  const addrSectors = useMemo(() => (addrProvince && addrDistrict ? RWANDA[addrProvince][addrDistrict] : []), [addrProvince, addrDistrict]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Keep addresses in sync when user object updates (e.g. after save)
  useEffect(() => {
    setAddresses(parseAddresses(user?.address));
  }, [user?.address]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setFormData({
          name: user.name,
          email: user.email,
          address: user.address || '',
          phone: user.phone || '',
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

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

  useEffect(() => {
    if (activeTab === 'orders' && token) {
      const timer = setTimeout(() => {
        fetchOrders();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

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

  // ── Address helpers ──────────────────────────────────────────────────────
  const resetAddrForm = () => {
    setAddrLabel('Home');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrProvince('');
    setAddrDistrict('');
    setAddrSector('');
    setAddrError('');
  };

  /** Persist an updated addresses array to the server and sync user context */
  const persistAddresses = async (newList) => {
    setAddrSaving(true);
    setAddrError('');
    try {
      const addressJson = serialiseAddresses(newList);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, address: addressJson }),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data.user);
        setStatus({ loading: false, success: 'Address saved!', error: '' });
        setTimeout(() => setStatus(prev => ({ ...prev, success: '' })), 3000);
        return true;
      } else {
        setAddrError(data.message || 'Failed to save address');
        return false;
      }
    } catch {
      setAddrError('Server error. Please try again later.');
      return false;
    } finally {
      setAddrSaving(false);
    }
  };

  /** Add a brand-new address to the list */
  const handleAddAddress = async () => {
    if (!addrProvince || !addrDistrict || !addrSector) {
      setAddrError('Please select Province, District and Sector.');
      return;
    }
    const newAddr = buildAddress({ label: addrLabel || 'Home', street: addrStreet.trim(), landmark: addrLandmark.trim(), sector: addrSector, district: addrDistrict, province: addrProvince });
    const newList = [...addresses, newAddr];
    const ok = await persistAddresses(newList);
    if (ok) {
      setShowAddForm(false);
      resetAddrForm();
    }
  };

  /** Save edits to an existing address by index */
  const handleEditAddress = async (idx) => {
    if (!addrProvince || !addrDistrict || !addrSector) {
      setAddrError('Please select Province, District and Sector.');
      return;
    }
    const updated = { ...addresses[idx], label: addrLabel || 'Home', street: addrStreet.trim(), landmark: addrLandmark.trim(), sector: addrSector, district: addrDistrict, province: addrProvince };
    const newList = addresses.map((a, i) => (i === idx ? updated : a));
    const ok = await persistAddresses(newList);
    if (ok) {
      setEditingAddrIdx(null);
      resetAddrForm();
    }
  };

  /** Delete an address by index (not allowed for default / only address) */
  const handleDeleteAddress = async (idx) => {
    if (addresses.length <= 1) return; // shouldn't be reachable
    const newList = addresses.filter((_, i) => i !== idx);
    await persistAddresses(newList);
  };

  /** Promote an address to default (move to index 0) */
  const handleSetDefault = async (idx) => {
    if (idx === 0) return;
    setSettingDefaultIdx(idx);
    const newList = [addresses[idx], ...addresses.filter((_, i) => i !== idx)];
    const ok = await persistAddresses(newList);
    setSettingDefaultIdx(null);
    if (ok) {
      // After reorder the promoted address is now at index 0 — flash it there
      setJustSetDefaultIdx(0);
      setTimeout(() => setJustSetDefaultIdx(null), 2500);
    }
  };

  /** Open the edit form for an existing address */
  const openEditAddr = (idx) => {
    const a = addresses[idx];
    setAddrLabel(a.label || 'Home');
    setAddrStreet(a.street || '');
    setAddrLandmark(a.landmark || '');
    const prov = a.province || '';
    const dist = a.district || '';
    const sec = a.sector || '';
    if (prov && RWANDA[prov]) {
      setAddrProvince(prov);
      if (dist && RWANDA[prov][dist]) {
        setAddrDistrict(dist);
        setAddrSector(sec);
      } else { setAddrDistrict(''); setAddrSector(''); }
    } else { setAddrProvince(''); setAddrDistrict(''); setAddrSector(''); }
    setAddrError('');
    setEditingAddrIdx(idx);
    setShowAddForm(false);
  };

  const RW_PHONE_REGEX = /^\+2507[2389]\d{7}$/;

  const handleUpdateProfile = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    // Validate phone number format before saving
    if (formData.phone && !RW_PHONE_REGEX.test(formData.phone)) {
      setStatus({ loading: false, success: '', error: 'Phone must be in the format +2507XXXXXXXX (e.g. +250782000000)' });
      return;
    }

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
        setStatus({ loading: false, success: 'Updated!', error: '' });
        setIsEditing(false);
        setEditingField(null);
        setTimeout(() => setStatus(prev => ({ ...prev, success: '' })), 3000);
      } else {
        setStatus({ loading: false, success: '', error: data.message || 'Failed to update profile' });
      }
    } catch {
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
        setEditingField(null);
        setTimeout(() => setPasswordStatus(prev => ({ ...prev, success: '' })), 3000);
      } else {
        setPasswordStatus({ loading: false, success: '', error: data.message || 'Failed to change password' });
      }
    } catch {
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
          {/* Sidebar – desktop only */}
          <aside className="hidden md:block w-full md:w-64 shrink-0">
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

          {/* ── Mobile-only: tab bar ───────────────────────────── */}
          <div className="md:hidden flex flex-col gap-3">
            {/* Active tab page title */}
            {(() => {
              const activeTabDef = tabs.find(t => t.id === activeTab);
              return (
                <div className="flex items-center gap-2 pt-1 pb-0.5 border-b border-outline-variant/50">
                  {activeTabDef && <activeTabDef.icon className="w-6 h-6 text-primary shrink-0" />}
                  <h1 className="text-2xl font-black tracking-tight text-on-surface">
                    {activeTabDef?.label}
                  </h1>
                </div>
              );
            })()}
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm">
              {activeTab === 'profile' && (
                <div className="max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="hidden md:block mb-5">
                    <h1 className="text-xl font-bold tracking-tight mb-1">Profile</h1>
                    <p className="text-xs text-outline font-medium">View and update your account details.</p>
                  </div>

                  <div className="space-y-1.5">

                    {/* Full Name */}
                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-outline">Full Name</p>
                        {editingField !== 'name' && (
                          <button onClick={() => { setEditingField('name'); setStatus({ loading: false, success: '', error: '' }); }}
                            className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90">
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {editingField === 'name' ? (
                        <div className="mt-2 space-y-2">
                          <Input name="name" value={formData.name} onChange={handleInputChange}
                            placeholder="John Doe" required className="h-9 rounded-lg text-sm" autoFocus />
                          {status.error && <p className="text-[10px] font-bold text-error">{status.error}</p>}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setEditingField(null); setFormData(f => ({ ...f, name: user?.name || '' })); }}
                              className="flex-1 h-8 rounded-lg border border-outline-variant text-xs font-black hover:bg-surface-container-high transition-all">
                              Cancel
                            </button>
                            <button type="button" onClick={handleUpdateProfile} disabled={status.loading}
                              className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-xs font-black flex items-center justify-center gap-1 active:scale-[0.98] transition-all">
                              {status.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-on-surface mt-0.5">{user?.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-outline">Email Address</p>
                        {editingField !== 'email' && (
                          <button onClick={() => { setEditingField('email'); setStatus({ loading: false, success: '', error: '' }); }}
                            className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90">
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {editingField === 'email' ? (
                        <div className="mt-2 space-y-2">
                          <Input name="email" type="email" value={formData.email} onChange={handleInputChange}
                            placeholder="name@example.com" required className="h-9 rounded-lg text-sm" autoFocus />
                          {status.error && <p className="text-[10px] font-bold text-error">{status.error}</p>}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setEditingField(null); setFormData(f => ({ ...f, email: user?.email || '' })); }}
                              className="flex-1 h-8 rounded-lg border border-outline-variant text-xs font-black hover:bg-surface-container-high transition-all">
                              Cancel
                            </button>
                            <button type="button" onClick={handleUpdateProfile} disabled={status.loading}
                              className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-xs font-black flex items-center justify-center gap-1 active:scale-[0.98] transition-all">
                              {status.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-on-surface mt-0.5">{user?.email}</p>
                      )}
                    </div>

                    {/* Delivery Addresses */}
                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-outline">Delivery Addresses</p>
                        {!showAddForm && editingAddrIdx === null && (
                          <button
                            onClick={() => { setShowAddForm(true); resetAddrForm(); setAddrLabel('Home'); }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black hover:bg-primary/20 transition-all active:scale-90"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>

                      {/* Address list */}
                      {addresses.length === 0 && !showAddForm && (
                        <p className="text-sm font-medium italic text-outline">No address saved yet.</p>
                      )}

                      <div className="space-y-2">
                        {addresses.map((addr, idx) => (
                          <div key={idx}>
                            {editingAddrIdx === idx ? (
                              /* ── Edit form for this address ── */
                              <div className="space-y-2 pt-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Editing address</p>
                                <AddrForm
                                  addrProvinces={PROVINCES}
                                  addrLabel={addrLabel} setAddrLabel={setAddrLabel}
                                  addrStreet={addrStreet} setAddrStreet={setAddrStreet}
                                  addrLandmark={addrLandmark} setAddrLandmark={setAddrLandmark}
                                  addrProvince={addrProvince} setAddrProvince={(p) => { setAddrProvince(p); setAddrDistrict(''); setAddrSector(''); }}
                                  addrDistrict={addrDistrict} setAddrDistrict={(d) => { setAddrDistrict(d); setAddrSector(''); }}
                                  addrSector={addrSector} setAddrSector={setAddrSector}
                                  addrDistricts={addrDistricts} addrSectors={addrSectors}
                                  error={addrError}
                                />
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => { setEditingAddrIdx(null); resetAddrForm(); }}
                                    className="flex-1 h-8 rounded-lg border border-outline-variant text-xs font-black hover:bg-surface-container-high transition-all">
                                    Cancel
                                  </button>
                                  <button type="button" onClick={() => handleEditAddress(idx)} disabled={addrSaving}
                                    className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-xs font-black flex items-center justify-center gap-1 active:scale-[0.98] transition-all">
                                    {addrSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ── Address card ── */
                              <div className={`rounded-lg border px-3 py-2.5 ${idx === 0 ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/40 bg-surface'}`}>
                                {/* Top row: label + badge + icon actions */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                      <span className="text-[10px] font-black text-on-surface">{addr.label || 'Address'}</span>
                                      {idx === 0 && justSetDefaultIdx === 0 ? (
                                        <span className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest text-success bg-success/10 px-1.5 py-0.5 rounded-full animate-in zoom-in duration-300">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Set as default!
                                        </span>
                                      ) : idx === 0 ? (
                                        <span className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                          <Star className="w-2 h-2 fill-primary" /> Default
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="text-xs text-on-surface font-medium leading-snug">
                                      {[addr.street, addr.sector, addr.district, addr.province].filter(Boolean).join(' · ')}
                                    </p>
                                    {addr.landmark && (
                                      <p className="text-[9px] text-outline font-medium mt-0.5 flex items-center gap-0.5">
                                        <MapPin className="w-2.5 h-2.5" />{addr.landmark}
                                      </p>
                                    )}
                                  </div>
                                  {/* Edit + delete icon buttons */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => openEditAddr(idx)}
                                      title="Edit"
                                      className="p-1 rounded-lg text-outline hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    {addresses.length > 1 && (
                                      <button
                                        onClick={() => handleDeleteAddress(idx)}
                                        title="Delete"
                                        className="p-1 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all active:scale-90"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {/* "Set as default" pill — only on non-default cards */}
                                {idx !== 0 && (
                                  <button
                                    onClick={() => handleSetDefault(idx)}
                                    disabled={settingDefaultIdx !== null}
                                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant text-[10px] font-black uppercase tracking-widest text-outline hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                  >
                                    {settingDefaultIdx === idx ? (
                                      <><Loader2 className="w-3 h-3 animate-spin" /> Setting…</>
                                    ) : (
                                      <><Star className="w-3 h-3" /> Set as default</>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ── Add new address form ── */}
                      {showAddForm && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-outline-variant/40">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary">New address</p>
                          <AddrForm
                            addrProvinces={PROVINCES}
                            addrLabel={addrLabel} setAddrLabel={setAddrLabel}
                            addrStreet={addrStreet} setAddrStreet={setAddrStreet}
                            addrLandmark={addrLandmark} setAddrLandmark={setAddrLandmark}
                            addrProvince={addrProvince} setAddrProvince={(p) => { setAddrProvince(p); setAddrDistrict(''); setAddrSector(''); }}
                            addrDistrict={addrDistrict} setAddrDistrict={(d) => { setAddrDistrict(d); setAddrSector(''); }}
                            addrSector={addrSector} setAddrSector={setAddrSector}
                            addrDistricts={addrDistricts} addrSectors={addrSectors}
                            error={addrError}
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setShowAddForm(false); resetAddrForm(); }}
                              className="flex-1 h-8 rounded-lg border border-outline-variant text-xs font-black hover:bg-surface-container-high transition-all">
                              Cancel
                            </button>
                            <button type="button" onClick={handleAddAddress} disabled={addrSaving}
                              className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-xs font-black flex items-center justify-center gap-1 active:scale-[0.98] transition-all">
                              {addrSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Address
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-outline">Phone Number</p>
                        {editingField !== 'phone' && (
                          <button onClick={() => { setEditingField('phone'); setStatus({ loading: false, success: '', error: '' }); }}
                            className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90">
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {editingField === 'phone' ? (
                        <div className="mt-2 space-y-2">
                          <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange}
                            placeholder="e.g. +250 788 000 000" className="h-9 rounded-lg text-sm" autoFocus />
                          {status.error && <p className="text-[10px] font-bold text-error">{status.error}</p>}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setEditingField(null); setFormData(f => ({ ...f, phone: user?.phone || '' })); }}
                              className="flex-1 h-8 rounded-lg border border-outline-variant text-xs font-black hover:bg-surface-container-high transition-all">
                              Cancel
                            </button>
                            <button type="button" onClick={handleUpdateProfile} disabled={status.loading}
                              className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-xs font-black flex items-center justify-center gap-1 active:scale-[0.98] transition-all">
                              {status.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-on-surface mt-0.5">
                          {user?.phone || <span className="text-outline font-medium italic">Not set</span>}
                        </p>
                      )}
                    </div>

                  </div>

                  {status.success && (
                    <div className="mt-3 flex items-center gap-2 p-3 bg-success/10 text-success rounded-xl border border-success/20 text-xs font-bold animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {status.success}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-5">
                    <div className="hidden md:block">
                      <h1 className="text-xl font-bold tracking-tight">My Orders</h1>
                      <p className="text-xs text-outline font-medium">Track and view your purchases.</p>
                    </div>
                    <button onClick={fetchOrders} disabled={ordersLoading}
                      className="p-2 rounded-xl border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all active:scale-90">
                      <Loader2 className={`w-4 h-4 ${ordersLoading ? 'animate-spin text-primary' : ''}`} />
                    </button>
                  </div>

                  {ordersLoading && orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                      <p className="text-outline font-black uppercase tracking-widest text-[10px]">Loading orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {activeOrders.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Active Orders
                          </p>
                          <div className="space-y-2">
                            {activeOrders.map((order) => (
                              <OrderCard key={order.id} order={order} />
                            ))}
                          </div>
                        </div>
                      )}
                      {historyOrders.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-outline flex items-center gap-1.5">
                            <History className="w-3 h-3" /> Order History
                          </p>
                          <div className="space-y-2">
                            {historyOrders.map((order) => (
                              <OrderCard key={order.id} order={order} isHistory />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-2xl">
                      <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
                        <Package className="w-7 h-7" />
                      </div>
                      <h2 className="text-base font-black mb-1">No Orders Yet</h2>
                      <p className="text-xs text-outline mb-5 font-medium px-6">You haven't placed any orders yet.</p>
                      <Button onClick={() => navigate('/')} className="rounded-xl font-black px-6 h-10 text-sm">Go Shopping</Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg">
                  <div className="hidden md:block mb-5">
                    <h1 className="text-xl font-bold tracking-tight mb-1">Preferences</h1>
                    <p className="text-xs text-outline font-medium">Customize your experience.</p>
                  </div>

                  <div className="space-y-4">

                    {/* Appearance */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Appearance</p>
                      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Moon className="w-4 h-4 text-outline" />
                          <div>
                            <p className="text-sm font-bold">Dark Mode</p>
                            <p className="text-[9px] text-outline uppercase tracking-wide">Switch theme</p>
                          </div>
                        </div>
                        <ThemeToggle />
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Language</p>
                      <div className="grid grid-cols-3 gap-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all active:scale-95 ${
                              language === lang.code
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-surface-container-low border-outline-variant text-outline hover:border-primary'
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-[9px] font-black uppercase tracking-wide">{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>



                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg">
                  <div className="hidden md:block mb-5">
                    <h1 className="text-xl font-bold tracking-tight mb-1">Security</h1>
                    <p className="text-xs text-outline font-medium">Update your password and keep your account secure.</p>
                  </div>

                  <div className="space-y-1.5">
                    {/* Password */}
                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-outline">Password</p>
                        {editingField !== 'password' && (
                          <button onClick={() => { setEditingField('password'); setPasswordStatus({ loading: false, success: '', error: '' }); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                            className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90">
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {editingField === 'password' ? (
                        <div className="mt-2 space-y-2">
                          <div className="relative">
                            <Input name="currentPassword" type={showPasswords.current ? 'text' : 'password'}
                              value={passwordData.currentPassword} onChange={handlePasswordChange}
                              placeholder="Current password" className="h-9 rounded-lg text-sm pr-9" autoFocus />
                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary active:scale-90 transition-all">
                              {showPasswords.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="relative">
                            <Input name="newPassword" type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.newPassword} onChange={handlePasswordChange}
                              placeholder="New password" className="h-9 rounded-lg text-sm pr-9" />
                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary active:scale-90 transition-all">
                              {showPasswords.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="relative">
                            <Input name="confirmPassword" type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirmPassword} onChange={handlePasswordChange}
                              placeholder="Confirm new password" className="h-9 rounded-lg text-sm pr-9" />
                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary active:scale-90 transition-all">
                              {showPasswords.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {passwordStatus.error && <p className="text-[10px] font-bold text-error">{passwordStatus.error}</p>}
                          {passwordStatus.success && <p className="text-[10px] font-bold text-success">{passwordStatus.success}</p>}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingField(null)}
                              className="flex-1 h-8 rounded-lg border border-outline-variant text-xs font-black hover:bg-surface-container-high transition-all">
                              Cancel
                            </button>
                            <button type="button" onClick={handleChangePassword} disabled={passwordStatus.loading}
                              className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-xs font-black flex items-center justify-center gap-1 active:scale-[0.98] transition-all">
                              {passwordStatus.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />} Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-on-surface mt-0.5 tracking-widest">••••••••</p>
                      )}
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

/** Reusable address form fields shared by add and edit forms */
const OrderCard = ({ order, isHistory = false }) => {
  const isPickup = !order.deliveryAddress;

  const statusColor = {
    COMPLETED: 'bg-success/10 text-success border-success/20',
    CANCELLED: 'bg-error/10 text-error border-error/20',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  }[order.status] || 'bg-primary/10 text-primary border-primary/20';

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isHistory ? 'border-outline-variant/40 opacity-70' : 'border-outline-variant bg-surface'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-outline-variant/50">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isHistory ? 'bg-surface-container text-outline' : 'bg-primary/10 text-primary'}`}>
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-black tracking-wide">#{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-[9px] text-outline font-bold">
              {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${statusColor}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
          <button
            onClick={() => printInvoice({
              orderId: order.id,
              fulfillmentBranch: order.branchName,
              deliveryAddress: order.deliveryAddress,
              deliveryInstructions: order.deliveryInstructions,
              depositAmount: order.depositAmount,
              depositPaid: order.depositPaid,
              phone: order.phone,
              totalPrice: order.totalPrice,
              items: order.items,
            })}
            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
            title="Print Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-3.5 py-3 flex items-center gap-3 border-b border-outline-variant/30">
        <div className="flex -space-x-2">
          {order.items.slice(0, 4).map((item, i) => (
            <img
              key={i}
              src={item.product.image}
              alt={item.product.name}
              title={`${item.quantity}x ${item.product.name}`}
              className="w-8 h-8 rounded-full border-2 border-surface object-cover"
            />
          ))}
          {order.items.length > 4 && (
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[9px] font-black text-outline">
              +{order.items.length - 4}
            </div>
          )}
        </div>
        <p className="text-xs font-bold text-outline">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</p>
      </div>

      {/* Footer: branch + total */}
      <div className="px-3.5 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-outline">{isPickup ? 'Pickup' : 'Delivery'}</p>
          <p className="text-xs font-bold truncate">{isPickup ? shortName(order.branchName) : order.deliveryAddress}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-outline">Total</p>
          <p className="text-sm font-black text-primary">{order.totalPrice.toLocaleString()} <span className="text-[9px]">RWF</span></p>
          {order.depositPaid && order.depositAmount > 0 && (
            <p className="text-[9px] text-success font-bold">Deposit: {order.depositAmount.toLocaleString()} RWF</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
