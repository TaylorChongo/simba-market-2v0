import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/utils';

const RolesPermissions = () => {
  const [permissions, setPermissions] = useState([]);

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
    <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
      <h2 className="text-xl font-bold mb-4">Roles & Permissions</h2>
      <p className="text-on-surface-variant mb-6 italic text-sm">
        Manage granular access by mapping roles to specific system permissions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-4 uppercase text-xs text-on-surface-variant">Available Permissions</h3>
          <div className="space-y-2">
            {permissions.map(perm => (
              <div key={perm.id} className="p-3 bg-surface-variant/20 rounded-lg border border-outline-variant">
                <p className="font-bold">{perm.name}</p>
                <p className="text-xs text-on-surface-variant">{perm.description || 'No description provided'}</p>
              </div>
            ))}
            {permissions.length === 0 && <p className="text-on-surface-variant text-sm">No permissions defined yet.</p>}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-xs text-on-surface-variant">Role Mapping</h3>
          <div className="space-y-4">
            {['ADMIN', 'VENDOR', 'BRANCH_MANAGER', 'BRANCH_STAFF'].map(role => (
              <div key={role} className="p-4 border border-outline-variant rounded-xl">
                <p className="font-black mb-2">{role}</p>
                <div className="flex flex-wrap gap-2">
                  {permissions.map(perm => {
                    const isAssigned = perm.roles?.some(r => r.role === role);
                    return (
                      <button
                        key={perm.id}
                        onClick={() => handleAssignPermission(role, perm.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          isAssigned 
                            ? 'bg-primary text-on-primary border border-primary' 
                            : 'bg-surface text-on-surface-variant border border-outline'
                        }`}
                      >
                        {perm.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
