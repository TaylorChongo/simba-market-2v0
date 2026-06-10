import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/utils';
import { 
  Key, 
  ShieldCheck, 
  Lock, 
  Info, 
  CheckCircle2, 
  Circle,
  ShieldAlert,
  Users
} from 'lucide-react';

const RolesPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [activeRole, setActiveRole] = useState('ADMIN');

  const roles = ['ADMIN', 'VENDOR', 'BRANCH_MANAGER', 'BRANCH_STAFF'];

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleAssignPermission = async (role, permissionId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/permissions/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role, permissionId })
      });
      fetchPermissions();
    } catch (error) {
      console.error('Error assigning permission:', error);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Role Selector */}
        <div className="lg:w-1/3 space-y-4">
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Select Role
            </h3>
            <div className="space-y-2">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    activeRole === role 
                      ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} />
                    <span className="font-bold">{role.replace('_', ' ')}</span>
                  </div>
                  {activeRole === role && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-surface-variant/10 rounded-2xl border border-outline-variant flex gap-3">
              <Info size={20} className="text-primary shrink-0" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Roles define a set of permissions. Assigning a permission to a role grants that access to all users with that role.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Permission Grid */}
        <div className="lg:w-2/3">
          <div className="bg-surface p-8 rounded-3xl border border-outline-variant shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2 text-on-surface">
                  <Lock className="text-primary" />
                  Permissions for {activeRole}
                </h2>
                <p className="text-sm text-on-surface-variant">Configure granular access levels for this role.</p>
              </div>
              <div className="px-4 py-2 bg-success/10 text-success rounded-full border border-success/20 text-xs font-black uppercase tracking-widest">
                Active Config
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.map(perm => {
                const isAssigned = perm.roles?.some(r => r.role === activeRole);
                return (
                  <button
                    key={perm.id}
                    onClick={() => handleAssignPermission(activeRole, perm.id)}
                    className={`p-5 rounded-2xl border transition-all text-left group ${
                      isAssigned 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-outline-variant bg-surface hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-xl ${isAssigned ? 'bg-primary text-on-primary' : 'bg-surface-variant/20 text-on-surface-variant'}`}>
                        <Key size={16} />
                      </div>
                      {isAssigned ? (
                        <CheckCircle2 size={20} className="text-primary" />
                      ) : (
                        <Circle size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <p className={`font-black mb-1 ${isAssigned ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {perm.name}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {perm.description || 'Provides access to specific system functionality and resources.'}
                    </p>
                  </button>
                );
              })}
              {permissions.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-on-surface-variant opacity-50">
                  <ShieldAlert size={48} />
                  <p className="font-bold uppercase tracking-widest text-sm">No permissions found in database.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
