import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../lib/utils';
import { 
  Package, 
  Clock, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCcw,
  MapPin
} from 'lucide-react';

const BranchManagerDashboard = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, staffRes] = await Promise.all([
        fetch(`${API_URL}/api/orders/branch`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/orders/branch/staff`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!ordersRes.ok || !staffRes.ok) throw new Error('Failed to fetch dashboard data');

      const ordersData = await ordersRes.json();
      const staffData = await staffRes.json();

      setOrders(ordersData);
      setStaff(staffData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleAssign = async (orderId, staffId) => {
    if (!staffId) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/branch/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ staffId })
      });

      if (!res.ok) throw new Error('Failed to assign order');

      // Optimistic update
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, assignedTo: staffId, status: 'ASSIGNED', staff: staff.find(s => s.id === staffId) } 
          : order
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-outline-variant/30 text-outline';
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
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <MapPin className="w-5 h-5" />
               </div>
               <p className="text-xs font-black text-outline uppercase tracking-[0.2em]">{user?.branch}</p>
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Branch Manager Dashboard</h1>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-outline-variant rounded-2xl font-black text-sm text-on-surface hover:bg-surface-container-high transition-all"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-black text-outline uppercase tracking-widest text-xs">Loading Branch Orders...</p>
          </div>
        ) : error ? (
          <div className="bg-error/5 border border-error/10 p-8 rounded-[32px] text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-black text-error mb-2">Error Loading Dashboard</h3>
            <p className="text-outline font-medium">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface border border-outline-variant p-12 rounded-[40px] text-center">
            <Package className="w-16 h-16 text-outline-variant mx-auto mb-6" />
            <h3 className="text-xl font-black text-on-surface mb-2">No Orders Yet</h3>
            <p className="text-outline font-medium">When customers place orders for this branch, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface border border-outline-variant rounded-[32px] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8 shadow-sm hover:shadow-md transition-shadow">
                {/* Order ID & Status */}
                <div className="lg:w-1/4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-black text-outline uppercase tracking-widest mb-1">Order ID</p>
                  <p className="text-lg font-black text-on-surface truncate">#{order.id.slice(0, 8)}</p>
                  <div className="flex items-center gap-2 mt-4 text-outline">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-bold">Pickup: {order.pickupTime}</p>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="lg:w-1/3 flex-grow">
                  <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">Items ({order.items.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/50">
                        <img src={item.product.image} className="w-6 h-6 rounded-md object-cover" alt="" />
                        <span className="text-xs font-bold text-on-surface-variant">x{item.quantity} {item.product.name}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/50">
                        <span className="text-xs font-black text-outline">+{order.items.length - 3} more</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment & Actions */}
                <div className="lg:w-1/3 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-outline-variant/50 pt-6 lg:pt-0 lg:pl-8">
                  {order.status === 'PENDING' ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-outline uppercase tracking-widest">Assign to Staff</p>
                      <div className="relative group">
                        <select 
                          onChange={(e) => handleAssign(order.id, e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-outline bg-surface text-sm font-bold appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled>Choose staff member...</option>
                          {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-outline uppercase tracking-widest">Assigned Staff</p>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-on-surface">{order.staff?.name || 'Assigned'}</p>
                          <p className="text-[10px] font-bold text-primary uppercase">Preparation in progress</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BranchManagerDashboard;
