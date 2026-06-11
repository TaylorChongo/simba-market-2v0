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
  X
} from 'lucide-react';
import Button from '../components/Button';

import { useSearchParams } from 'react-router-dom';
import ProfileSecurity from '../components/ProfileSecurity';

const BranchStaffDashboard = () => {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const activeOrders = useMemo(() => {
    return orders.filter(o => ['PENDING', 'APPROVED', 'ASSIGNED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status));
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));
  }, [orders]);

  const fetchStaffOrders = async (isPolling = false) => {
    try {
      const isManual = isPolling === true ? false : true;
      if (isManual) setLoading(true);
      const res = await fetch(`${API_URL}/api/orders/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch assigned orders');

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      const isManual = isPolling === true ? false : true;
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffOrders();

    // Set up polling for new tasks
    const interval = setInterval(() => {
      fetchStaffOrders(true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [token]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const endpoint = newStatus === 'APPROVED' ? `/api/orders/staff/${orderId}/approve` : `/api/orders/staff/${orderId}/status`;
      const res = await fetch(`${API_URL}${endpoint}`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'ASSIGNED': return 'bg-primary/10 text-primary';
      case 'PREPARING': return 'bg-warning/10 text-warning';
      case 'READY_FOR_PICKUP': return 'bg-success/10 text-success';
      case 'COMPLETED': return 'bg-success text-white';
      case 'CANCELLED': return 'bg-error/10 text-error';
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
          
          <div className="flex bg-surface border border-outline-variant rounded-2xl p-1 shadow-sm overflow-x-auto">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              Active Tasks
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:bg-surface-container-high'}`}
            >
              History
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

        {!user.branch && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-8 flex items-center gap-4 text-amber-800 shadow-sm">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-widest text-xs mb-1">Warning: No Branch Assigned</p>
              <p className="text-sm font-medium">Your account is not associated with a specific branch. Please contact your manager or admin to assign you to a branch so you can manage orders.</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' || activeTab === 'history' ? (
          /* ORDERS & HISTORY TABS */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> 
                {activeTab === 'orders' ? `Active Tasks (${activeOrders.length})` : `History (${historyOrders.length})`}
              </h2>
              <button 
                onClick={fetchStaffOrders}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {(activeTab === 'orders' ? activeOrders : historyOrders).length === 0 ? (
              <div className="bg-surface border border-outline-variant p-12 rounded-[40px] text-center">
                <ShoppingBag className="w-16 h-16 text-outline-variant mx-auto mb-6" />
                <h3 className="text-xl font-black text-on-surface mb-2">No {activeTab === 'orders' ? 'Active Tasks' : 'History Found'}</h3>
                <p className="text-outline font-medium text-sm">
                  {activeTab === 'orders' 
                    ? `You don't have any active orders to prepare for ${user.branch || 'your branch'} at the moment.`
                    : "You haven't completed any handovers yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(activeTab === 'orders' ? activeOrders : historyOrders).map((order) => (
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
                        {order.status === 'PENDING' && (
                          <Button 
                            onClick={() => updateStatus(order.id, 'APPROVED')}
                            className="w-full h-14 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 border-none text-white"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Approve Order
                          </Button>
                        )}

                        {(order.status === 'APPROVED' || order.status === 'ASSIGNED') && (
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
                          <div className="space-y-3">
                            <div className="bg-success/5 border border-success/10 rounded-2xl p-4 text-center mb-2">
                                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                                <p className="text-xs font-black text-success uppercase tracking-widest">Ready for Customer</p>
                            </div>
                            <Button 
                              onClick={() => updateStatus(order.id, 'COMPLETED')}
                              className="w-full h-14 rounded-2xl font-black bg-primary text-on-primary border-none flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                            >
                              <ShoppingBag className="w-5 h-5" />
                              Handover & Complete
                            </Button>
                          </div>
                        )}

                        {order.status === 'COMPLETED' && (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                              <CheckCircle2 className="w-6 h-6 text-success" />
                            </div>
                            <p className="text-xs font-black text-outline uppercase tracking-widest">Order Handed Over</p>
                          </div>
                        )}

                        {order.status === 'CANCELLED' && (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-3">
                              <X className="w-6 h-6 text-error" />
                            </div>
                            <p className="text-xs font-black text-outline uppercase tracking-widest">Order Cancelled</p>
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
          /* PROFILE & SECURITY TABS */
          <ProfileSecurity activeTab={activeTab} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BranchStaffDashboard;
