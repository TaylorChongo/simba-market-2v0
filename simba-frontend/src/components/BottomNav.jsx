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
  X,
  ChevronRight,
  Globe,
  LogIn,
  LogOut,
  UserRound,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Food Products', to: '/category/Food%20Products' },
  { name: 'Kitchenware & Electronics', to: '/category/Kitchenware%20%26%20Electronics' },
  { name: 'Home & Kitchen', to: '/category/Home%20%26%20Kitchen' },
  { name: 'Cosmetics & Personal Care', to: '/category/Cosmetics%20%26%20Personal%20Care' },
  { name: 'Alcoholic Drinks', to: '/category/Alcoholic%20Drinks' },
];

const MENU_LINKS = [
  { labelKey: 'nav_home', to: '/' },
  { labelKey: 'nav_branch', to: '/branches' },
  { labelKey: 'contact_us', to: '/contact' },
  { labelKey: 'faqs', to: '/faq' },
  { labelKey: 'shipping_policy', to: '/shipping-policy' },
  { labelKey: 'returns', to: '/returns' },
  { labelKey: 'about', to: '/about' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'kin', label: 'Kinyarwanda' },
];

const HIDDEN_PREFIXES = [
  '/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/checkout',
  '/success',
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { branches, selectedBranch, setSelectedBranch, isMapVisible, toggleMap } = useBranch();
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = location.pathname;
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  const closeMenu = () => setMenuOpen(false);

  const handleAccountClick = () => {
    if (user) {
      navigate('/dashboard/client');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar (mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-surface border-t border-outline-variant pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-16">
          {/* Shop */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/' ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('nav_shop')}</span>
          </button>

          {/* Branch */}
          <button
            onClick={toggleMap}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isMapVisible ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Store className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('nav_branch')}</span>
          </button>

          {/* Account */}
          <button
            onClick={handleAccountClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname.startsWith('/dashboard/client') || pathname === '/login' || pathname === '/register'
                ? 'text-primary'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('nav_account')}</span>
          </button>

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              menuOpen ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <MenuIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('nav_menu')}</span>
          </button>
        </div>
      </nav>

      {/* Right-Side Menu Panel */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-[9991] animate-in fade-in duration-200"
            onClick={closeMenu}
          />
          <div className="md:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-[9992] bg-surface border-l border-outline-variant shadow-2xl overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant sticky top-0 bg-surface z-10">
              <h2 className="text-lg font-black">{t('nav_menu')}</h2>
              <button
                onClick={closeMenu}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-outline"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-6 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
              {/* Account Section */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">{t('nav_account')}</p>
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard/client"
                      onClick={closeMenu}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant hover:border-primary transition-colors"
                    >
                      <UserRound className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm">{t('my_orders') || 'My Account'}</span>
                      <ChevronRight className="w-4 h-4 text-outline ml-auto" />
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                        navigate('/');
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant hover:border-error hover:text-error transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-bold text-sm">{t('logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary text-on-primary font-black text-sm"
                    >
                      <LogIn className="w-4 h-4" /> {t('login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-surface-container-low border border-outline-variant font-black text-sm hover:border-primary"
                    >
                      {t('sign_up')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">{t('categories')}</p>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.to}
                      to={cat.to}
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low transition-colors"
                    >
                      <span className="font-bold text-sm">{cat.name}</span>
                      <ChevronRight className="w-4 h-4 text-outline" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">{t('support')}</p>
                <div className="space-y-1">
                  {MENU_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low transition-colors"
                    >
                      <span className="font-bold text-sm">{t(link.labelKey)}</span>
                      <ChevronRight className="w-4 h-4 text-outline" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {t('language')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`py-2.5 rounded-2xl text-xs font-black uppercase tracking-wide border transition-colors ${
                        language === lang.code
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low border-outline-variant text-on-surface hover:border-primary'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BottomNav;
