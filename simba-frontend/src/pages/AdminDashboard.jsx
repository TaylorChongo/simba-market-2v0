import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import UserManagement from '../components/admin/UserManagement';
import RolesPermissions from '../components/admin/RolesPermissions';
import SystemSettings from '../components/admin/SystemSettings';
import SecurityLogs from '../components/admin/SecurityLogs';
import SystemAnalytics from '../components/admin/SystemAnalytics';
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  Settings, 
  ShieldAlert, 
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

import { useSearchParams } from 'react-router-dom';
import ProfileSecurity from '../components/ProfileSecurity';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Key },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'logs', label: 'Security Logs', icon: ShieldAlert },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return <UserManagement />;
      case 'roles': return <RolesPermissions />;
      case 'settings': return <SystemSettings />;
      case 'logs': return <SecurityLogs />;
      case 'analytics': return <SystemAnalytics />;
      case 'profile': return <ProfileSecurity activeTab="profile" />;
      case 'personal-settings': return <ProfileSecurity activeTab="settings" />;
      default: return <SystemAnalytics />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-outline-variant transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary font-black shadow-lg shadow-primary/20">
                S
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Simba Admin</h1>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Control Center</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-variant/20 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 group ${
                  activeTab === tab.id 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/25' 
                    : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'
                }`}
              >
                <tab.icon size={22} className={activeTab === tab.id ? 'text-on-primary' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-[15px]">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-on-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-outline-variant">
            <div className="p-4 bg-surface-variant/10 rounded-2xl flex items-center gap-3 mb-4 border border-outline-variant/50">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant">
                <UserIcon size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-black truncate">Super Administrator</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-error hover:bg-error/10 transition-colors group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Logout Securely</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-variant/20 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-black text-on-surface">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
                Manage your system resources and monitor activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full border border-success/20">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">System Live</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
