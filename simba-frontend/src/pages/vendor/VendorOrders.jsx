import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import VendorLayout from '../../components/VendorLayout';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  User, 
  CreditCard,
  Loader2,
  ChevronDown,
  Filter,
  Package
} from 'lucide-react';
import { API_URL } from '../../lib/utils';

const VendorOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/vendor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <VendorLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface">Customer Orders</h1>
            <p className="text-outline font-medium">Track and manage your sales and shipments</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-surface border border-outline-variant px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-black text-on-surface">{orders.length} Total Sales</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <button className="bg-surface border border-outline-variant px-6 py-3.5 rounded-2xl flex items-center gap-2 font-bold text-sm text-outline hover:text-on-surface transition-all">
            <Filter className="w-4 h-4" /> Filter Status
          </button>
        </div>

        {/* Content */}
        <div className="bg-surface rounded-[32px] md:rounded-[40px] border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-outline">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p className="font-bold">Fetching your sales data...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-6 px-8 font-black text-xs uppercase tracking-widest text-outline">Order Details</th>
                      <th className="py-6 px-8 font-black text-xs uppercase tracking-widest text-outline">Customer</th>
                      <th className="py-6 px-8 font-black text-xs uppercase tracking-widest text-outline">Products</th>
                      <th className="py-6 px-8 font-black text-xs uppercase tracking-widest text-outline">Total Revenue</th>
                      <th className="py-6 px-8 font-black text-xs uppercase tracking-widest text-outline">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono font-black text-sm text-primary">#{order.id.slice(0, 8)}</span>
                            <div className="flex items-center gap-1.5 text-outline">
                              <Calendar className="w-3 h-3" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <User className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-on-surface">{order.user.name}</span>
                              <span className="text-[10px] font-medium text-outline">{order.user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-black text-outline">
                                  {item.quantity}x
                                </span>
                                <span className="text-xs font-bold text-on-surface-variant line-clamp-1">{item.product.name}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-on-surface">
                              {order.totalPrice.toLocaleString()} <small className="text-[10px] font-bold text-outline">RWF</small>
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase">
                              <CreditCard className="w-3 h-3" /> Paid
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            order.status === 'COMPLETED' ? 'bg-success/5 text-success border-success/20' :
                            'bg-error/5 text-error border-error/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'PENDING' ? 'bg-amber-500' :
                              order.status === 'COMPLETED' ? 'bg-success' :
                              'bg-error'
                            }`} />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col divide-y divide-outline-variant/30">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-black text-sm text-primary">#{order.id.slice(0, 8)}</span>
                        <div className="flex items-center gap-1.5 text-outline">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.status === 'COMPLETED' ? 'bg-success/5 text-success border-success/20' :
                        'bg-error/5 text-error border-error/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 py-3 px-4 bg-surface-container-low rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface">{order.user.name}</span>
                        <span className="text-[10px] font-medium text-outline">{order.user.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-outline">Products</h4>
                      <div className="flex flex-col gap-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-black text-outline">
                              {item.quantity}x
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant">{item.product.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Total Revenue</span>
                        <span className="text-xl font-black text-on-surface">
                          {order.totalPrice.toLocaleString()} <small className="text-[10px] font-bold">RWF</small>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase mb-1">
                        <CreditCard className="w-3 h-3" /> Paid
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-outline-variant mb-6">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">No orders yet</h3>
              <p className="text-outline max-w-xs mx-auto text-sm font-medium">
                {searchTerm ? "No orders match your search criteria." : "When customers purchase your products, their orders will appear here for management."}
              </p>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;
