import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  Store,
  User,
  Menu as MenuIcon,
  LifeBuoy,
  X,
  ChevronRight,
  Phone,
  HelpCircle,
  Truck,
  RotateCcw,
  Info,
  MapPin,
  Package,
} from 'lucide-react';

const SUPPORT_LINKS = [
  { labelKey: 'contact_us',      to: '/contact',         icon: Phone      },
  { labelKey: 'faqs',            to: '/faq',             icon: HelpCircle },
  { labelKey: 'shipping_policy', to: '/shipping-policy', icon: Truck      },
  { labelKey: 'returns',         to: '/returns',         icon: RotateCcw  },
  { labelKey: 'about',           to: '/about',           icon: Info       },
  { labelKey: 'nav_branch',      to: '/branches',        icon: MapPin     },
];

const BottomNav = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { isMapVisible, toggleMap } = useBranch();
  const { t }     = useLanguage();
  const [supportOpen, setSupportOpen] = useState(false);

  const pathname     = location.pathname;
  const closeSupport = () => setSupportOpen(false);

  const handleAccountClick = () => {
    if (user) {
      navigate('/dashboard/client');
    } else {
      navigate('/login');
    }
  };

  // Is the user currently on one of the support pages?
  const onSupportPage = SUPPORT_LINKS.some((l) => pathname === l.to);

  return (
    <>
      {/* ── Bottom Navigation Bar (mobile only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-surface border-t border-outline-variant pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">

          {/* Shop */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/' ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">{t('nav_shop')}</span>
          </button>

          {/* Branch */}
          <button
            onClick={toggleMap}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isMapVisible ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">{t('nav_branch')}</span>
          </button>

          {/* My Orders */}
          <button
            onClick={() => user ? navigate('/dashboard/client?tab=orders') : navigate('/login')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname.startsWith('/dashboard/client') && location.search.includes('tab=orders')
                ? 'text-primary'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Orders</span>
          </button>

          {/* Account */}
          <button
            onClick={handleAccountClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              (pathname.startsWith('/dashboard/client') && !location.search.includes('tab=orders')) ||
              pathname === '/login' || pathname === '/register'
                ? 'text-primary'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">{t('nav_account')}</span>
          </button>

          {/* Support */}
          <button
            onClick={() => setSupportOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              supportOpen || onSupportPage ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <MenuIcon className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">{t('nav_menu')}</span>
          </button>

        </div>
      </nav>

      {/* ── Support Side Panel ── */}
      {supportOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-[9991] animate-in fade-in duration-200"
            onClick={closeSupport}
          />

          {/* Panel */}
          <div className="md:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-[9992] bg-surface border-l border-outline-variant shadow-2xl overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-2">
                <MenuIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-black">{t('support')}</h2>
              </div>
              <button
                onClick={closeSupport}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-outline"
                aria-label="Close support panel"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="p-5 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">
                {t('support')}
              </p>
              <div className="space-y-2">
                {SUPPORT_LINKS.map(({ labelKey, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeSupport}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                      pathname === to
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-surface-container-low border-outline-variant hover:border-primary hover:bg-primary/5 text-on-surface'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${pathname === to ? 'text-primary' : 'text-outline'}`} />
                    <span className="font-bold text-sm flex-1">{t(labelKey)}</span>
                    <ChevronRight className={`w-4 h-4 ${pathname === to ? 'text-primary' : 'text-outline'}`} />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </>
  );
};

export default BottomNav;
