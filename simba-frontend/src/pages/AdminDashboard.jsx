import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import UserManagement from '../components/admin/UserManagement';
import RolesPermissions from '../components/admin/RolesPermissions';
import SystemSettings from '../components/admin/SystemSettings';
import SecurityLogs from '../components/admin/SecurityLogs';
import SystemAnalytics from '../components/admin/SystemAnalytics';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'roles', label: 'Roles', icon: '🔑' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'logs', label: 'Logs', icon: '🛡️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return <UserManagement />;
      case 'roles': return <RolesPermissions />;
      case 'settings': return <SystemSettings />;
      case 'logs': return <SecurityLogs />;
      case 'analytics': return <SystemAnalytics />;
      default: return <SystemAnalytics />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface">System Control Center</h1>
          <p className="text-on-surface-variant">Welcome back, Administrator {user?.name}</p>
        </div>
        <Button variant="outline" onClick={logout} className="border-error text-error hover:bg-error/10">
          Secure Logout
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8 bg-surface-variant/10 p-2 rounded-2xl border border-outline-variant">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' 
                : 'text-on-surface-variant hover:bg-surface-variant/30'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
