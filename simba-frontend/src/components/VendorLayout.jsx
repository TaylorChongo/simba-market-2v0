import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronRight,
  Store
} from 'lucide-react';
import { cn } from '../lib/utils';
import Button from './Button';

const VendorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard/vendor', icon: LayoutDashboard },
    { label: 'Products', path: '/dashboard/vendor/products', icon: Package },
    { label: 'Add Product', path: '/dashboard/vendor/add-product', icon: PlusCircle },
    { label: 'Orders', path: '/dashboard/vendor/orders', icon: ShoppingBag },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface-container-lowest flex">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-surface border-r border-outline-variant z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          {/* Logo & Store Info */}
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-on-primary font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-black tracking-tight text-on-surface">Simba <span className="text-primary">Store</span></span>
            </Link>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate text-on-surface">
                    {user?.vendorProfile?.storeName || "My Supermarket"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      user?.vendorProfile?.status === 'APPROVED' ? "bg-success" : "bg-amber-500"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-outline">
                      {user?.vendorProfile?.status || "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-2xl transition-all group",
                    active 
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                      : "text-outline hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", active ? "text-on-primary" : "text-outline group-hover:text-primary")} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-on-primary/60" />}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="pt-6 border-t border-outline-variant mt-auto space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <User className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">{user?.name}</span>
                <span className="text-[10px] font-medium text-outline">{user?.email}</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-error hover:bg-error/5 transition-all font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header (Mobile Only) */}
        <header className="lg:hidden h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-6 sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold text-base">S</span>
            </div>
            <span className="font-black text-on-surface">Simba</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-surface-container rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-on-surface" />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
