import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const ClientDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Client Dashboard</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-on-surface-variant mb-4">You are logged in as a <strong>{user?.role}</strong>.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <h3 className="font-bold text-primary">My Orders</h3>
            <p className="text-sm">View and track your purchases.</p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
            <h3 className="font-bold text-secondary">My Profile</h3>
            <p className="text-sm">Update your account information.</p>
          </div>
          <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant">
            <h3 className="font-bold">Settings</h3>
            <p className="text-sm">Manage notifications and security.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
