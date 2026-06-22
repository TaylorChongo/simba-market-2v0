import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import Button from './Button';
import Input from './Input';
import { User, Save, Loader2, CheckCircle2, AlertCircle, Lock, Shield } from 'lucide-react';

const ProfileSecurity = ({ activeTab = 'profile' }) => {
  const { user, updateUser, token } = useAuth();

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

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setFormData({
          name: user.name,
          email: user.email,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

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
      } else {
        setStatus({ loading: false, success: '', error: data.message || 'Failed to update profile' });
      }
    } catch {
      setStatus({ loading: false, success: '', error: 'Network error. Please try again.' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, success: '', error: 'Passwords do not match' });
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
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordStatus({ loading: false, success: 'Password updated successfully!', error: '' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus({ loading: false, success: '', error: data.message || 'Failed to change password' });
      }
    } catch {
      setPasswordStatus({ loading: false, success: '', error: 'Network error. Please try again.' });
    }
  };

  if (activeTab === 'profile') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight mb-2">My Profile</h1>
        <p className="text-outline font-medium mb-10">Manage your personal information and account settings.</p>

        {!isEditing ? (
          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] overflow-hidden shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 group">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20 group-hover:scale-105 transition-transform">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-black mb-1">{user?.name}</h2>
              <p className="text-outline font-medium mb-4">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button onClick={() => setIsEditing(true)} className="rounded-xl px-6 h-10 font-black">Edit Profile</Button>
                <div className="px-4 py-1.5 bg-surface-container-high rounded-full text-[10px] font-black uppercase tracking-widest text-outline border border-outline-variant">
                  Role: <span className="text-primary">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="bg-surface border border-outline-variant rounded-[32px] p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="px-6 h-12 rounded-xl font-black">Cancel</Button>
              <Button type="submit" disabled={status.loading} className="px-10 h-12 flex items-center gap-2 rounded-xl font-black">
                {status.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Changes</span>
              </Button>
            </div>
            {status.error && <p className="mt-4 text-sm font-bold text-error flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {status.error}</p>}
            {status.success && <p className="mt-4 text-sm font-bold text-success flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {status.success}</p>}
          </form>
        )}
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight mb-2">Account Security</h1>
        <p className="text-outline font-medium mb-10">Manage your password and keep your account secure.</p>

        <form onSubmit={handleUpdatePassword} className="bg-surface border border-outline-variant rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 px-1">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest">Update Password</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Current Password</label>
              <Input
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">New Password</label>
                <Input
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Confirm New Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-outline">
              <Shield className="w-8 h-8 opacity-40" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                Strong passwords help protect your Simba Market account.
              </p>
            </div>
            <Button
              type="submit"
              disabled={passwordStatus.loading}
              className="w-full md:w-auto px-10 h-14 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
              {passwordStatus.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              Update Security
            </Button>
          </div>
          {passwordStatus.error && <p className="mt-4 text-sm font-bold text-error flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {passwordStatus.error}</p>}
          {passwordStatus.success && <p className="mt-4 text-sm font-bold text-success flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {passwordStatus.success}</p>}
        </form>
      </div>
    );
  }

  return null;
};

export default ProfileSecurity;
