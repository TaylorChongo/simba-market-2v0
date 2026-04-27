import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import VendorLayout from '../../components/VendorLayout';
import Button from '../../components/Button';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { optimizeCloudinaryUrl, API_URL, fallbackToOriginalImage } from '../../lib/utils';

const VendorProducts = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProducts();
    }
  }, [user?.id, authLoading]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data.filter(p => p.vendorId === user.id));
      }
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete');

      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <VendorLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface">Store Inventory</h1>
            <p className="text-outline font-medium">Manage and track all your supermarket items</p>
          </div>
          <Link to="/dashboard/vendor/add-product">
            <Button className="flex items-center gap-2 h-12 px-8 rounded-2xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" /> Add New Product
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <div className="bg-surface border border-outline-variant px-4 py-3.5 rounded-2xl flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-outline">Total:</span>
              <span className="text-sm font-black text-primary">{products.length}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-outline">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Syncing inventory...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-5 px-6 font-black text-xs uppercase tracking-widest text-outline">Product</th>
                      <th className="py-5 px-6 font-black text-xs uppercase tracking-widest text-outline">Category</th>
                      <th className="py-5 px-6 font-black text-xs uppercase tracking-widest text-outline">Price</th>
                      <th className="py-5 px-6 font-black text-xs uppercase tracking-widest text-outline text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/50">
                              <img 
                                src={optimizeCloudinaryUrl(product.image, { width: 100, height: 100 })} 
                                alt={product.name} 
                                onError={(e) => fallbackToOriginalImage(e, product.image)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface line-clamp-1">{product.name}</span>
                              <span className="text-[10px] font-mono text-outline uppercase tracking-tighter">ID: {product.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-black text-on-surface">
                            {product.price.toLocaleString()} <small className="text-[10px] font-bold text-outline">RWF</small>
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => navigate(`/dashboard/vendor/edit-product/${product.id}`)}
                              className="p-2.5 rounded-xl hover:bg-primary/10 text-outline hover:text-primary transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-2.5 rounded-xl hover:bg-error/10 text-outline hover:text-error transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <Link 
                              to={`/product/${product.id}`}
                              className="p-2.5 rounded-xl hover:bg-surface-container-high text-outline transition-all"
                              title="View Public"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col divide-y divide-outline-variant/30">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-5 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/50 shrink-0">
                        <img 
                          src={optimizeCloudinaryUrl(product.image, { width: 120, height: 120 })} 
                          alt={product.name} 
                          onError={(e) => fallbackToOriginalImage(e, product.image)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="font-bold text-on-surface truncate">{product.name}</span>
                        <span className="text-[10px] font-mono text-outline uppercase mt-1">ID: {product.id.slice(0, 8)}</span>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                      <span className="font-black text-primary text-lg">
                        {product.price.toLocaleString()} <small className="text-[10px] font-bold text-outline">RWF</small>
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => navigate(`/dashboard/vendor/edit-product/${product.id}`)}
                          className="p-2 rounded-lg bg-surface-container-low text-outline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg bg-error/5 text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link 
                          to={`/product/${product.id}`}
                          className="p-2 rounded-lg bg-surface-container-low text-outline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-outline-variant mb-6">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">No products found</h3>
              <p className="text-outline max-w-xs mx-auto text-sm mb-8 font-medium">
                {searchTerm ? "Try adjusting your search terms to find what you're looking for." : "Your inventory is empty. Start adding products to see them here."}
              </p>
              {!searchTerm && (
                <Link to="/dashboard/vendor/add-product">
                  <Button variant="outline" className="h-11 rounded-xl px-6">
                    Add First Product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorProducts;
