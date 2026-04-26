import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-on-surface text-error">System Administration</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-error/20 bg-error/5">
        <h2 className="text-xl font-semibold mb-4 text-on-surface">Hello, Admin {user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-surface rounded-xl border border-outline-variant shadow-sm text-center">
            <p className="text-xs text-on-surface-variant font-bold uppercase">Users</p>
            <p className="text-2xl font-black">128</p>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-outline-variant shadow-sm text-center">
            <p className="text-xs text-on-surface-variant font-bold uppercase">Vendors</p>
            <p className="text-2xl font-black">24</p>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-outline-variant shadow-sm text-center">
            <p className="text-xs text-on-surface-variant font-bold uppercase">Products</p>
            <p className="text-2xl font-black">1,240</p>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-outline-variant shadow-sm text-center">
            <p className="text-xs text-on-surface-variant font-bold uppercase">Orders</p>
            <p className="text-2xl font-black">89</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
