import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import InlineBranchMap from '../components/InlineBranchMap';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal, Loader2, MapPin, ArrowRight } from 'lucide-react';
import localProducts from '../data/simba_products.json';

const Home = () => {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState(localProducts.products);
  const productsRef = useRef(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      const rolePath = user.role.toLowerCase().replace(/_/g, '-');
      navigate(`/dashboard/${rolePath}`);
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedBranch 
          ? `${API_URL}/api/products?branch=${encodeURIComponent(selectedBranch)}`
          : `${API_URL}/api/products`;
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setProducts(data);
          } else {
            console.warn('Products API returned an empty array. Keeping bundled fallback catalog.');
          }
        } else {
          console.error('Expected array of products, but got:', data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedBranch]);

  // Get unique categories
  const categories = useMemo(() => {
    const unique = new Set(products.map(p => p.category));
    return ['All', ...Array.from(unique).sort()];
  }, [products]);

  // Combined Filters Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesMinPrice = minPrice === '' || product.price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice);
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice]);

  // Group filtered products by category for the summary view
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const category = product.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const isFiltering = searchQuery.length > 0 || selectedCategory !== 'All' || minPrice !== '' || maxPrice !== '';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
  };

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 7);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <InlineBranchMap />

      {/* Branch Selection Reminder */}
      {!selectedBranch && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-primary text-sm font-bold">
            <MapPin className="w-4 h-4" />
            <span>{t('select_branch_reminder')}</span>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="px-4 py-3 md:px-8 border-b border-outline-variant/50 mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border-outline-variant hover:border-primary transition-all h-8 text-[11px] md:h-9 md:text-xs px-3"
          >
            <SlidersHorizontal className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {showFilters ? t('hide_filters') : t('show_filters')}
          </Button>
          
          {isFiltering && (
            <div className="flex items-center gap-2 text-[10px] md:text-xs">
              <span className="text-outline hidden sm:inline">{t('active_filters')}</span>
              <button 
                onClick={clearAllFilters}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-primary/20 transition-colors"
              >
                {t('clear_all')} <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 md:px-8 w-full">
        <div className="flex flex-col md:flex-row gap-8 relative">
          
          {/* Sidebar Filters - Desktop Drawer/Sidebar */}
          <aside className={`
            ${showFilters ? 'w-full md:w-56 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
            fixed inset-0 z-[60] md:relative md:inset-auto md:z-0 transition-all duration-300 ease-in-out
          `}>
            {/* Backdrop for mobile */}
            <div 
              className={`fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setShowFilters(false)}
            />

            <div className={`
              fixed top-0 left-0 h-full w-[80%] max-w-xs bg-surface shadow-2xl p-6 flex flex-col gap-8 z-50 overflow-y-auto
              md:sticky md:top-24 md:h-[calc(100vh-140px)] md:w-56 md:bg-transparent md:shadow-none md:p-0 md:pr-2 md:z-0 custom-scrollbar
              transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" /> {t('filters_title')}
                </h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-outline mb-3">{t('price_range')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      className="text-xs h-9 px-3" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-outline">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      className="text-xs h-9 px-3" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-outline mb-3">{t('categories')}</h4>
                <div className="flex flex-col gap-0.5">
                  {displayedCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        if (window.innerWidth < 768) setShowFilters(false);
                      }}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {category === 'All' ? (language === 'fr' ? 'Tout' : language === 'kin' ? 'Byose' : 'All') : category}
                    </button>
                  ))}
                  {categories.length > 7 && (
                    <button 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="flex items-center gap-2 text-[10px] font-bold text-primary px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors mt-0.5"
                    >
                      {showAllCategories ? (
                        <>{t('show_less')} <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>{t('show_more')} ({categories.length - 7}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile apply button */}
              <Button 
                className="mt-auto md:hidden"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-grow transition-all duration-300">
            {/* Hero Section */}
            {!isFiltering && !user && (
              <section className="bg-primary-container rounded-[30px] md:rounded-[40px] p-6 md:p-12 mb-8 relative overflow-hidden flex flex-col items-start text-left min-h-[220px] md:min-h-[320px] justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <span className="text-on-primary font-bold tracking-widest uppercase text-[9px] md:text-[10px] mb-2 md:mb-3 relative">
                  {t('hero_badge')}
                </span>
                <h1 className="text-2xl md:text-5xl lg:text-5xl font-black text-on-primary mb-3 relative leading-[0.95] tracking-tighter max-w-2xl">
                  {t('hero_title_1')} <br className="hidden sm:block" />
                  <span className="text-white/90">{t('hero_title_2')}</span>
                </h1>
                <p className="text-on-primary/80 max-w-xl mb-6 relative text-[10px] md:text-base font-medium leading-relaxed">
                  {t('hero_description')}
                </p>
                <Button 
                  onClick={scrollToProducts}
                  className="px-6 md:px-8 py-2 md:py-3 !bg-white !text-primary hover:!bg-white hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 border-none relative text-xs md:text-base font-bold shadow-xl shadow-primary/20 transition-all duration-300 active:scale-95"
                >
                  {t('shop_now')}
                </Button>
              </section>
            )}

            {/* Loading Overlay for branch switch */}
            {loading && (
              <div className="absolute inset-0 bg-surface/50 z-10 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}

            {/* Results Status */}
            <div ref={productsRef}>
              {isFiltering && (
                <div className="mb-6 flex items-baseline gap-2">
                  <h2 className="text-xl font-black">{filteredProducts.length}</h2>
                  <span className="text-outline font-medium text-sm">{t('results_for')}</span>
                </div>
              )}
            </div>

            {/* Grid Display */}
            {filteredProducts.length > 0 ? (
              !isFiltering ? (
                /* Summary View by Category */
                Object.entries(groupedProducts).map(([category, categoryProducts]) => {
                  const hasMore = categoryProducts.length > 4;

                  return (
                    <section key={category} className="mb-10">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-black tracking-tight uppercase border-l-4 border-primary pl-3">
                          {category}
                        </h2>
                        {hasMore && (
                          <Link to={`/category/${category}`}>
                            <Button variant="ghost" className="text-[11px] font-bold text-primary px-3 h-8">
                              {t('view_all')}
                            </Button>
                          </Link>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 transition-all duration-300">
                        {categoryProducts.slice(0, 4).map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </section>
                  );
                })
              ) : (
                /* Search Results View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 transition-all duration-300">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )
            ) : (
              /* No Results */
              <div className="text-center py-20 bg-surface-container-low rounded-[40px] border border-dashed border-outline-variant">
                <div className="bg-surface w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-outline-variant/30">
                  <X className="w-7 h-7 text-outline-variant" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">{t('no_matches')}</h3>
                <p className="text-outline max-w-xs mx-auto text-xs">
                  {t('no_matches_desc')}
                </p>
                <Button variant="outline" className="mt-6 text-xs h-9 px-6" onClick={clearAllFilters}>
                  {t('clear_all')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
