import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../lib/utils';
import { 
  Package, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCcw,
  MapPin,
  Boxes,
  Search,
  Edit,
  MinusCircle,
  X,
  PieChart
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import SystemAnalytics from '../components/admin/SystemAnalytics';

import { useSearchParams } from 'react-router-dom';
import ProfileSecurity from '../components/ProfileSecurity';

const BranchManagerDashboard = () => {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };
  
  // Inventory state
  const [updatingStock, setUpdatingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInventory = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const branchName = user.branch;
      const res = await fetch(`${API_URL}/api/products?branch=${encodeURIComponent(branchName)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch branch stock');

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    
    // Set up polling
    const interval = setInterval(() => {
      fetchInventory(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const handleUpdateStock = async (productId, stock) => {
    try {
      const res = await fetch(`${API_URL}/api/branch/stock/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: parseInt(stock) })
      });

      if (!res.ok) throw new Error('Failed to update stock');

      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: parseInt(stock) } : p
      ));
      setUpdatingStock(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkOutOfStock = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/branch/stock/${productId}/out`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to mark out of stock');

      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: 0 } : p
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(products.map(p => p.category));
    return ['All', ...Array.from(unique).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-outline-variant/30 text-outline';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'ASSIGNED': return 'bg-primary/10 text-primary';
      case 'PREPARING': return 'bg-warning/10 text-warning';
      case 'READY_FOR_PICKUP': return 'bg-success/10 text-success';
      case 'COMPLETED': return 'bg-success text-white';
      default: return 'bg-outline-variant/30 text-outline';
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <MapPin className="w-5 h-5" />
               </div>
               <p className="text-xs font-black text-outline uppercase tracking-[0.2em]">{user?.branch}</p>
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Branch Manager</h1>
          </div>
          
          <div className="flex bg-surface border border-outline-variant rounded-2xl p-1 shadow-sm overflow-x-auto">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Security
            </button>
          </div>
        </header>

        {activeTab === 'inventory' ? (
          /* INVENTORY MANAGEMENT */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Boxes className="w-5 h-5 text-primary" /> 
                Store Inventory
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Input 
                    placeholder="Search product..." 
                    className="pl-10 h-10 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                </div>

                <select 
                  className="h-10 px-4 rounded-xl border border-outline-variant bg-surface text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button 
                  onClick={() => fetchInventory()}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block"
                  title="Refresh"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant rounded-[32px] md:rounded-[40px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Product</th>
                      <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Category</th>
                      <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Stock Level</th>
                      <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-surface-container-highest transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/50 flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-on-surface">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-outline uppercase tracking-wider">{product.category}</span>
                        </td>
                        <td className="px-8 py-5">
                          {updatingStock === product.id ? (
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number"
                                className="w-20 h-9 px-3 text-sm font-bold"
                                value={newStockValue}
                                onChange={(e) => setNewStockValue(e.target.value)}
                                autoFocus
                              />
                              <button 
                                onClick={() => handleUpdateStock(product.id, newStockValue)}
                                className="p-2 bg-primary text-on-primary rounded-lg"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setUpdatingStock(null)}
                                className="p-2 bg-surface-container text-outline rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className={`px-4 py-1.5 rounded-full text-sm font-black ${
                                product.stock === 0 ? 'bg-error/10 text-error' : 
                                product.stock < 5 ? 'bg-amber-500/10 text-amber-600' : 
                                'bg-success/10 text-success'
                              }`}>
                                {product.stock}
                              </span>
                              <button 
                                onClick={() => {
                                  setUpdatingStock(product.id);
                                  setNewStockValue(product.stock.toString());
                                }}
                                className="p-1.5 hover:bg-surface-container rounded-lg text-outline transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleMarkOutOfStock(product.id)}
                            className="flex items-center gap-2 px-4 py-2 ml-auto bg-error/5 text-error rounded-xl text-[10px] font-black uppercase hover:bg-error hover:text-white transition-all border border-error/10"
                            disabled={product.stock === 0}
                          >
                            <MinusCircle className="w-4 h-4" />
                            Mark Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="px-8 py-12 text-center text-outline font-medium italic">
                  No products found matching your filters.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          /* ANALYTICS TAB */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black flex items-center gap-2">
                 <PieChart className="w-5 h-5 text-primary" />
                 Branch Performance
               </h2>
            </div>
            <SystemAnalytics branchName={user.branch} />
          </div>
        ) : (
          /* PROFILE & SECURITY TABS */
          <ProfileSecurity activeTab={activeTab} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BranchManagerDashboard;
