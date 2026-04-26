import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../lib/utils';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCcw,
  PlayCircle,
  ShoppingBag,
  Edit,
  Trash2,
  MinusCircle,
  PlusCircle,
  Boxes,
  X
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

const BranchStaffDashboard = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'stock'
  const [updatingStock, setUpdatingStock] = useState(null); // Product ID being updated
  const [newStockValue, setNewStockValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchStaffOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch assigned orders');

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchStock = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchStaffOrders();
    } else {
      fetchBranchStock();
    }
  }, [token, activeTab]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/staff/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Optimistic update
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      alert(err.message);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
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

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 md:px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">{user.branch}</p>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Staff Dashboard</h1>
          </div>
          
          <div className="flex bg-surface border border-outline-variant rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'orders' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('stock')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'stock' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Inventory
            </button>
          </div>
        </header>

        {loading && (products.length === 0 && orders.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-black text-outline uppercase tracking-widest text-xs">Loading dashboard data...</p>
          </div>
        ) : activeTab === 'orders' ? (
          /* ORDERS TAB */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> 
                Assigned Orders ({orders.length})
              </h2>
              <button 
                onClick={fetchStaffOrders}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-surface border border-outline-variant p-12 rounded-[40px] text-center">
                <ShoppingBag className="w-16 h-16 text-outline-variant mx-auto mb-6" />
                <h3 className="text-xl font-black text-on-surface mb-2">No Active Tasks</h3>
                <p className="text-outline font-medium text-sm">You don't have any assigned orders to prepare at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-surface border border-outline-variant rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                      {/* Left: Info */}
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <p className="text-sm font-black text-on-surface">Order #{order.id.slice(0, 8)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-6">
                          <div>
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Customer</p>
                            <p className="text-sm font-bold text-on-surface">{order.user.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Pickup Time</p>
                            <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              {order.pickupTime}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-outline uppercase tracking-widest">Order Items</p>
                          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50 space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 flex items-center justify-center bg-surface rounded-lg border border-outline-variant font-black text-[10px] text-primary">
                                    {item.quantity}
                                  </span>
                                  <span className="font-bold text-on-surface-variant">{item.product.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="md:w-64 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-6 md:pt-0 md:pl-8">
                        {order.status === 'ASSIGNED' && (
                          <Button 
                            onClick={() => updateStatus(order.id, 'PREPARING')}
                            className="w-full h-14 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                          >
                            <PlayCircle className="w-5 h-5" />
                            Start Preparing
                          </Button>
                        )}
                        
                        {order.status === 'PREPARING' && (
                          <Button 
                            onClick={() => updateStatus(order.id, 'READY_FOR_PICKUP')}
                            className="w-full h-14 rounded-2xl font-black bg-success hover:bg-success/90 border-none text-white flex items-center justify-center gap-2 shadow-lg shadow-success/10"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Mark as Ready
                          </Button>
                        )}

                        {order.status === 'READY_FOR_PICKUP' && (
                          <div className="bg-success/5 border border-success/10 rounded-2xl p-4 text-center">
                              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                              <p className="text-xs font-black text-success uppercase tracking-widest">Ready for Customer</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STOCK TAB */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Boxes className="w-5 h-5 text-primary" /> 
                Branch Inventory
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Input 
                    placeholder="Search product..." 
                    className="pl-10 h-10 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
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
                  onClick={fetchBranchStock}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block"
                  title="Refresh"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant rounded-[40px] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Product</th>
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Current Stock</th>
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Actions</th>
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
                              className="p-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setUpdatingStock(null)}
                              className="p-2 bg-surface-container text-outline rounded-lg hover:bg-outline-variant transition-all"
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
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleMarkOutOfStock(product.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-error/5 text-error rounded-xl text-xs font-bold hover:bg-error hover:text-white transition-all border border-error/10"
                            disabled={product.stock === 0}
                          >
                            <MinusCircle className="w-4 h-4" />
                            Mark Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-outline font-medium italic">
                        No products found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BranchStaffDashboard;
