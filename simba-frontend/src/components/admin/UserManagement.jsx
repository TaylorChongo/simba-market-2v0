import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import { API_URL } from '../../lib/utils';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  Mail, 
  Shield, 
  Filter,
  X,
  Lock,
  User as UserIcon,
  MapPin
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
    branch: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'CLIENT', branch: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-error/10 text-error border-error/20';
      case 'VENDOR': return 'bg-primary/10 text-primary border-primary/20';
      case 'BRANCH_MANAGER': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'BRANCH_STAFF': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-surface-variant/20 text-on-surface-variant border-outline-variant';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant={isFilterOpen ? 'primary' : 'outline'} 
            className="flex-1 md:flex-none flex items-center gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} />
            Filter
          </Button>
          <Button 
            className="flex-1 md:flex-none flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={18} />
            Add User
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="p-6 bg-surface border border-outline-variant rounded-3xl shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Filter by Role</label>
              <div className="flex flex-wrap gap-2">
                {['ALL', 'ADMIN', 'VENDOR', 'BRANCH_MANAGER', 'BRANCH_STAFF', 'CLIENT'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      roleFilter === role 
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface-variant/20 text-on-surface-variant hover:bg-surface-variant/40'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            {roleFilter !== 'ALL' && (
              <button 
                onClick={() => setRoleFilter('ALL')}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline mt-6"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/5 border-b border-outline-variant">
                <th className="py-5 px-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">User Information</th>
                <th className="py-5 px-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">Role Assignment</th>
                <th className="py-5 px-6 text-xs font-black uppercase tracking-widest text-on-surface-variant text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-surface-variant/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold border border-outline-variant">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-transparent text-xs font-bold text-on-surface-variant hover:text-primary cursor-pointer focus:outline-none transition-colors"
                      >
                        <option value="CLIENT">Set as Client</option>
                        <option value="VENDOR">Set as Vendor</option>
                        <option value="BRANCH_MANAGER">Set as Branch Mgr</option>
                        <option value="BRANCH_STAFF">Set as Branch Staff</option>
                        <option value="ADMIN">Set as Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Shield size={18} />
                      </button>
                      <button 
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-on-surface-variant hover:bg-surface-variant/20 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-on-surface-variant opacity-50">
                      <Search size={48} />
                      <p className="font-bold">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <p>Showing <b>{filteredUsers.length}</b> users</p>
          <div className="flex items-center gap-4">
            <button disabled className="opacity-50 cursor-not-allowed font-bold">Previous</button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg font-bold">1</span>
            </div>
            <button className="hover:text-primary font-bold">Next</button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-outline-variant shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-variant/5">
              <h3 className="text-xl font-black flex items-center gap-2">
                <UserPlus className="text-primary" />
                Add New User
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-surface-variant/20 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors text-sm font-bold"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors text-sm font-bold"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors text-sm font-bold"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Initial Role</label>
                  <select
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors text-sm font-bold appearance-none cursor-pointer"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="BRANCH_STAFF">Branch Staff</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Branch (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Simba Gishushu"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors text-sm font-bold"
                      value={newUser.branch}
                      onChange={(e) => setNewUser({...newUser, branch: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
