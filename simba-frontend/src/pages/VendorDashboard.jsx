import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/utils';
import Button from '../components/Button';
import Input from '../components/Input';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plus, Package, ShoppingBag, Trash2, Edit2, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const VendorDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'addProduct'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State for new product
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    fetchVendorData();
  }, [activeTab]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        // In a real app, we'd have a specific /api/products/vendor endpoint
        // For now, we'll fetch all and filter or assume getProducts can be filtered
        // Actually, let's just fetch all and filter by vendorId for demonstration
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data.filter(p => p.vendorId === user.id));
      } else if (activeTab === 'orders') {
        const res = await fetch(`${API_URL}/api/orders/vendor`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to add product');

      setSuccessMsg('Product added successfully!');
      setFormData({ name: '', price: '', category: '', image: '', description: '' });
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('inventory');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete product');

      setProducts(products.filter(p => p.id !== id));
      setSuccessMsg('Product deleted');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:px-8 w-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface">Vendor Dashboard</h1>
            <p className="text-outline font-medium">Manage your store and track performance</p>
          </div>
          <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-surface shadow-sm text-primary' : 'text-outline hover:text-on-surface'}`}
            >
              <開Package className="w-4 h-4" /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-surface shadow-sm text-primary' : 'text-outline hover:text-on-surface'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders
            </button>
          </div>
        </header>

        {successMsg && (
          <div className="mb-6 bg-success/10 text-success border border-success/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-error/10 text-error border border-error/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        <div className="bg-surface rounded-[32px] border border-outline-variant shadow-sm overflow-hidden min-h-[500px]">
          {activeTab === 'inventory' && (
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black">Product Inventory</h2>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab('addProduct')}
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </Button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-outline">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-bold">Loading your products...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <div key={product.id} className="group border border-outline-variant rounded-2xl overflow-hidden hover:border-primary transition-colors">
                      <div className="aspect-video relative overflow-hidden bg-surface-container-low">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-surface/90 backdrop-blur-sm p-2 rounded-xl text-error hover:bg-error hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">
                          {product.category}
                        </span>
                        <h3 className="font-bold text-on-surface mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-primary">
                            {product.price.toLocaleString()} <small className="text-[10px] uppercase">RWF</small>
                          </span>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant">
                  <Package className="w-12 h-12 text-outline-variant mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">No products yet</h3>
                  <p className="text-sm text-outline mb-6">Start building your online storefront today.</p>
                  <Button variant="outline" onClick={() => setActiveTab('addProduct')}>Create First Product</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addProduct' && (
            <div className="p-6 md:p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black">List New Product</h2>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-outline" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Product Name</label>
                    <Input 
                      placeholder="e.g. Fresh Rwandan Coffee"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Price (RWF)</label>
                    <Input 
                      type="number"
                      placeholder="5000"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Category</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-2xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow appearance-none font-medium"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Meat & Seafood">Meat & Seafood</option>
                      <option value="Fruits & Veggies">Fruits & Veggies</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Image URL</label>
                    <Input 
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Description</label>
                  <textarea 
                    className="w-full px-5 py-4 rounded-3xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow min-h-[120px] font-medium resize-none"
                    placeholder="Tell customers about your product..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-grow h-12 rounded-2xl font-black text-base shadow-lg shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Publish Product'}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="h-12 px-8 rounded-2xl font-bold"
                    onClick={() => setActiveTab('inventory')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-black mb-8">Store Orders</h2>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-outline">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-bold">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant">
                          <th className="py-4 px-4 font-black text-xs uppercase tracking-widest text-outline">Order ID</th>
                          <th className="py-4 px-4 font-black text-xs uppercase tracking-widest text-outline">Customer</th>
                          <th className="py-4 px-4 font-black text-xs uppercase tracking-widest text-outline">Items</th>
                          <th className="py-4 px-4 font-black text-xs uppercase tracking-widest text-outline">Total</th>
                          <th className="py-4 px-4 font-black text-xs uppercase tracking-widest text-outline">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                            <td className="py-4 px-4 text-sm font-bold font-mono">#{order.id.slice(0, 8)}</td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">{order.user.name}</span>
                                <span className="text-[10px] text-outline">{order.user.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                {order.items.map(item => (
                                  <span key={item.id} className="text-xs font-medium">
                                    {item.quantity}x {item.product.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-black text-primary text-sm">
                              {order.totalPrice.toLocaleString()} RWF
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                                'bg-error/10 text-error'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden flex flex-col gap-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-outline">#{order.id.slice(0, 8)}</span>
                            <span className="text-sm font-bold mt-1">{order.user.name}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                            'bg-error/10 text-error'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="bg-surface/50 rounded-xl p-3">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Items</h4>
                          <div className="flex flex-col gap-1.5">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-xs font-medium">
                                <span>{item.product.name}</span>
                                <span className="text-outline">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
                          <span className="text-xs font-bold text-outline uppercase tracking-wider">Total Amount</span>
                          <span className="text-base font-black text-primary">{order.totalPrice.toLocaleString()} RWF</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant">
                  <ShoppingBag className="w-12 h-12 text-outline-variant mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">No orders yet</h3>
                  <p className="text-sm text-outline">When customers buy your products, they'll show up here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDashboard;
