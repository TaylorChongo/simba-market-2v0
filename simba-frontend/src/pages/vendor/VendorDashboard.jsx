import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import VendorLayout from '../../components/VendorLayout';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../lib/utils';

const VendorDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id || !token) return;
      
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/orders/vendor`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const products = await productsRes.json();
        const orders = await ordersRes.json();

        const vendorProducts = Array.isArray(products) ? products.filter(p => p.vendorId === user.id) : [];
        const vendorOrders = Array.isArray(orders) ? orders : [];
        
        setStats({
          totalProducts: vendorProducts.length,
          totalOrders: vendorOrders.length,
          pendingOrders: vendorOrders.filter(o => o.status === 'PENDING').length
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchStats();
    }
  }, [user?.id, token, authLoading]);

  if (authLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-primary' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-500' },
  ];

  return (
    <VendorLayout>
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2">
              Hello, <span className="text-primary">{user?.name}!</span>
            </h1>
            <p className="text-outline font-medium text-lg">
              Here's what's happening with <span className="font-bold text-on-surface">{user?.vendorProfile?.storeName}</span> today.
            </p>
          </div>
          
          {user?.vendorProfile?.status !== 'APPROVED' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center gap-4 max-w-md">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-amber-900 font-black text-sm uppercase tracking-wider">Account Pending</span>
                <span className="text-amber-800 text-xs font-medium">Your store is under review by our team. Product listing is currently limited.</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-surface p-8 rounded-[32px] border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-on-surface mb-1">
                    {loading ? '...' : card.value}
                  </span>
                  <span className="text-sm font-bold text-outline uppercase tracking-widest">{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-primary/5 rounded-[40px] p-10 border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/20 transition-all" />
            <h3 className="text-2xl font-black text-on-surface mb-4">Manage Inventory</h3>
            <p className="text-outline font-medium mb-8 max-w-sm">Keep your supermarket products up to date. Add new items or edit existing ones.</p>
            <Link to="/dashboard/vendor/products">
              <button className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-primary-container hover:text-primary transition-all shadow-lg shadow-primary/20">
                Go to Products <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="bg-surface-container rounded-[40px] p-10 border border-outline-variant relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-on-surface/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-on-surface/10 transition-all" />
            <h3 className="text-2xl font-black text-on-surface mb-4">Recent Orders</h3>
            <p className="text-outline font-medium mb-8 max-w-sm">Track your sales performance and manage customer shipments efficiently.</p>
            <Link to="/dashboard/vendor/orders">
              <button className="bg-surface text-on-surface border border-outline-variant px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-surface-container-high transition-all">
                View All Orders <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorDashboard;
