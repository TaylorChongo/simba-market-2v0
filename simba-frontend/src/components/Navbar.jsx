import { Search, ShoppingCart, User, LogOut, Package, ChevronDown, MapPin, MapIcon, Languages, SlidersHorizontal, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import AISearch from './AISearch';
import { shortName } from '../lib/utils';

const Navbar = () => {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const { selectedBranch, toggleMap } = useBranch();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'kin', label: 'Kinyarwanda', flag: '🇷🇼' }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass-header border-b border-outline-variant px-3 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex min-h-12 items-center justify-between gap-2 sm:gap-4 md:gap-6">

          {/* Mobile AI search — open the AI panel on small screens */}
          {mobileSearchOpen && (
            <div className="md:hidden flex-1">
              <AISearch placeholder={t('search_placeholder')} autoOpen={true} onClose={() => setMobileSearchOpen(false)} />
            </div>
          )}

          {/* Normal navbar content — hidden on mobile when search is open */}
          <div className={`flex min-w-0 items-center gap-2 sm:gap-4 md:gap-6 shrink ${mobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex shrink-0 items-center justify-center">
                <span className="text-on-primary font-bold text-lg md:text-xl">S</span>
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight hidden sm:inline whitespace-nowrap">
                Simba <span className="text-primary">Supermarket</span>
              </span>
            </Link>

            {/* Branch Selector - Desktop */}
            {user?.role !== 'BRANCH_MANAGER' && user?.role !== 'BRANCH_STAFF' && (
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMap}
                  className={`h-10 max-w-48 rounded-2xl px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border transition-colors ${
                    selectedBranch
                      ? 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'
                      : 'border-outline-variant text-outline hover:border-primary hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="min-w-0 max-w-[120px] truncate">
                    {selectedBranch ? shortName(selectedBranch) : t('select_branch')}
                  </span>
                  <MapIcon className="w-3.5 h-3.5 ml-1 shrink-0 opacity-50" />
                </Button>
              </div>
            )}
          </div>

          {/* AI Conversational Search - Desktop */}
          {user?.role !== 'BRANCH_MANAGER' && user?.role !== 'BRANCH_STAFF' && (
            <div className="hidden md:flex min-w-0 flex-1 justify-center">
              <AISearch placeholder={t('search_placeholder')} />
            </div>
          )}

          {/* Actions */}
          <div className={`flex shrink-0 items-center gap-1 md:gap-2 text-on-surface ${mobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
            {/* Mobile Branch Select */}
            {user?.role !== 'BRANCH_MANAGER' && user?.role !== 'BRANCH_STAFF' && (
              <div className="hidden sm:flex lg:hidden items-center mr-1 sm:mr-2">
                <button
                  onClick={toggleMap}
                  className={`flex max-w-28 items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter transition-colors min-h-[44px] ${
                    selectedBranch
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-outline-variant bg-surface-container-low text-outline'
                  }`}
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="min-w-0 max-w-[80px] truncate">
                    {selectedBranch ? shortName(selectedBranch) : 'Branch'}
                  </span>
                </button>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1">
              {/* Language Switcher - Desktop */}
              <div className="relative" ref={langDropdownRef}>
                <Button
                  variant="ghost"
                  className="px-2 text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase min-h-[44px]"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                >
                  <Languages className="w-4 h-4 text-outline" />
                  {language}
                  <ChevronDown className={`w-3 h-3 text-outline transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                </Button>

                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-2xl shadow-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors min-h-[44px] ${
                          language === lang.code ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangDropdown(false);
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-base">{lang.flag}</span>
                          {lang.label}
                        </span>
                        {language === lang.code && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ThemeToggle />
            </div>

            {(!user || user.role === 'CLIENT') && (
              <>
                <Button
                  variant="ghost"
                  className="md:hidden p-1.5 relative text-on-surface min-w-[44px] min-h-[44px]"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="p-1.5 md:p-2 relative text-on-surface min-w-[44px] min-h-[44px]"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="absolute top-1 right-1 bg-primary text-on-primary text-[9px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                </Button>
              </>
            )}

            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="h-10 text-sm px-4"
                  onClick={() => navigate('/login')}
                >
                  {t('login')}
                </Button>
                <Button
                  className="h-10 text-sm px-4 bg-primary text-white hover:bg-primary-container"
                  onClick={() => navigate('/register')}
                >
                  {t('sign_up')}
                </Button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-surface-container-high rounded-full transition-colors min-h-[44px]"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="hidden md:flex max-w-32 flex-col items-start leading-tight mr-1">
                    <span className="max-w-full truncate text-sm font-bold text-on-surface">{user.name}</span>
                    <span className="max-w-full truncate text-[10px] text-outline uppercase tracking-wider">{user.role}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-outline transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-2xl shadow-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-outline-variant/50 mb-1 md:hidden">
                      <p className="text-sm font-bold text-on-surface">{user.name}</p>
                      <p className="text-[10px] text-outline uppercase">{user.role}</p>
                    </div>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors min-h-[44px]"
                      onClick={() => {
                        const rolePath = user.role.toLowerCase().replace(/_/g, '-');
                        navigate(`/dashboard/${rolePath}?tab=profile`);
                        setShowDropdown(false);
                      }}
                    >
                      <User className="w-4 h-4 text-outline" />
                      {t('my_profile')}
                    </button>

                    {user.role !== 'BRANCH_MANAGER' && user.role !== 'BRANCH_STAFF' && (
                      <>
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors min-h-[44px]"
                          onClick={() => {
                            const rolePath = user.role.toLowerCase().replace(/_/g, '-');
                            navigate(`/dashboard/${rolePath}?tab=orders`);
                            setShowDropdown(false);
                          }}
                        >
                          <Package className="w-4 h-4 text-outline" />
                          {t('my_orders')}
                        </button>

                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors min-h-[44px]"
                          onClick={() => {
                            const rolePath = user.role.toLowerCase().replace(/_/g, '-');
                            navigate(`/dashboard/${rolePath}?tab=preferences`);
                            setShowDropdown(false);
                          }}
                        >
                          <SlidersHorizontal className="w-4 h-4 text-outline" />
                          {t('preferences')}
                        </button>
                      </>
                    )}

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors min-h-[44px]"
                      onClick={() => {
                        const rolePath = user.role.toLowerCase().replace(/_/g, '-');
                        navigate(`/dashboard/${rolePath}?tab=settings`);
                        setShowDropdown(false);
                      }}
                    >
                      <Lock className="w-4 h-4 text-outline" />
                      {t('security')}
                    </button>

                    <div className="h-px bg-outline-variant/50 my-1" />

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors min-h-[44px]"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;