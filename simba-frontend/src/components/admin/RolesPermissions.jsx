import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../../lib/utils';
import Button from '../Button';
import { 
  Key, 
  Shield, 
  Lock, 
  AlertTriangle, 
  Users, 
  Plus, 
  X, 
  Check, 
  RefreshCw,
  Search
} from 'lucide-react';

const RolesPermissions = () => {
  // --- Data State ---
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState(['ADMIN', 'VENDOR', 'BRANCH_MANAGER', 'BRANCH_STAFF']);
  const [activeRole, setActiveRole] = useState('ADMIN');
  
  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Modal State ---
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newPermission, setNewPermission] = useState({ name: '', description: '', code: '' });

  // --- API Handlers ---
  
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      // 1. Fetch Permissions
      const permRes = await fetch(`${API_URL}/api/admin/permissions`, { headers });
      if (!permRes.ok) throw new Error(`Permissions fetch failed: ${permRes.status}`);
      const permData = await permRes.json();
      setPermissions(Array.isArray(permData) ? permData : []);

      // 2. Fetch Roles
      try {
        const roleRes = await fetch(`${API_URL}/api/admin/roles`, { headers });
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          if (Array.isArray(roleData)) {
            const mappedRoles = roleData.map(r => typeof r === 'string' ? r : r.name).filter(Boolean);
            if (mappedRoles.length > 0) setRoles(mappedRoles);
          }
        }
      } catch (e) {
        console.warn('Roles fetch error (non-critical):', e);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Could not sync with security server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTogglePermission = async (permissionId) => {
    if (processingId || !activeRole) return;
    
    setProcessingId(permissionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/permissions/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role: activeRole, permissionId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server rejected the update');
      }

      await fetchAllData();
    } catch (err) {
      console.error('Update error:', err);
      alert(`Update Failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/roles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newRoleName.trim().toUpperCase().replace(/\s+/g, '_') })
      });
      if (response.ok) {
        setIsAddRoleModalOpen(false);
        setNewRoleName('');
        await fetchAllData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Create role error:', error);
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/permissions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newPermission)
      });
      if (response.ok) {
        setIsAddPermissionModalOpen(false);
        setNewPermission({ name: '', description: '', code: '' });
        await fetchAllData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create permission');
      }
    } catch (error) {
      console.error('Create permission error:', error);
    }
  };

  // --- Helpers ---
  
  const isGranted = (perm) => {
    if (!perm || !perm.roles || !Array.isArray(perm.roles)) return false;
    return perm.roles.some(r => {
      const roleName = typeof r === 'string' ? r : r.role || r.name;
      return roleName === activeRole;
    });
  };

  const filteredPermissions = useMemo(() => {
    if (!Array.isArray(permissions)) return [];
    return permissions.filter(p => {
      const name = (p.name || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const query = searchTerm.toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [permissions, searchTerm]);

  // --- Render ---

  if (loading && permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Syncing Security...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Access Control</h2>
          <p className="text-sm text-on-surface-variant">Configure system roles and permissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-medium w-48 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddPermissionModalOpen(true)}
            className="p-2 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error">
          <AlertTriangle size={20} />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={fetchAllData} className="ml-auto underline text-xs font-black">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-outline-variant rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Roles</span>
              {/* Add Role functionality hidden as roles are currently fixed in the system */}
            </div>
            <div className="space-y-1">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition-all ${
                    activeRole === role 
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                      : 'text-on-surface-variant hover:bg-surface-variant/20'
                  }`}
                >
                  <span>{role.replace(/_/g, ' ')}</span>
                  {activeRole === role && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          <div className="bg-surface border border-outline-variant rounded-3xl p-6 shadow-sm min-h-[400px]">
            <div className="mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Lock size={18} className="text-primary" />
                {activeRole.replace(/_/g, ' ')} Privileges
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPermissions.map(perm => {
                const granted = isGranted(perm);
                const isUpdating = processingId === perm.id;
                
                return (
                  <button
                    key={perm.id}
                    disabled={isUpdating || loading}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                      granted 
                        ? 'bg-primary/5 border-primary/30 shadow-sm' 
                        : 'bg-surface border-outline-variant hover:border-primary/30'
                    } ${isUpdating ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      granted ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'
                    }`}>
                      {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : granted ? <Check size={14} strokeWidth={4} /> : null}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm truncate">{perm.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono uppercase opacity-60 truncate">{perm.code}</p>
                    </div>
                  </button>
                );
              })}

              {filteredPermissions.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center text-on-surface-variant opacity-40">
                  <Key className="mx-auto mb-2" size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest">No matching permissions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-sm rounded-3xl border border-outline-variant shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight">New Role</h3>
              <button onClick={() => setIsAddRoleModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Name</label>
                <input required placeholder="SUPER_ADMIN" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-bold uppercase" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Create Role</Button>
            </form>
          </div>
        </div>
      )}

      {/* Add Permission Modal */}
      {isAddPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-outline-variant shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight">New Permission</h3>
              <button onClick={() => setIsAddPermissionModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Display Name</label>
                <input required placeholder="View Audit Logs" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-bold" value={newPermission.name} onChange={(e) => setNewPermission({...newPermission, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Unique Code</label>
                <input required placeholder="VIEW_AUDIT_LOGS" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-mono uppercase" value={newPermission.code} onChange={(e) => setNewPermission({...newPermission, code: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
                <textarea rows={3} placeholder="Define access level..." className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-medium resize-none" value={newPermission.description} onChange={(e) => setNewPermission({...newPermission, description: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Create Permission</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
