import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import Input from '../components/Input';
import { API_URL } from '../lib/utils';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import { Filter, X, ChevronLeft, SlidersHorizontal, Loader2 } from 'lucide-react';
import localProducts from '../data/simba_products.json';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { selectedBranch } = useBranch();
  const { t } = useLanguage();
  
  const [products, setProducts] = useState(localProducts.products);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedBranch 
          ? `${API_URL}/api/products?branch=${encodeURIComponent(selectedBranch)}`
          : `${API_URL}/api/products`;
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else if (!Array.isArray(data)) {
          console.error('Expected array of products, but got:', data);
        } else {
          console.warn('Products API returned an empty array. Keeping bundled fallback catalog.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedBranch]);

  // Filter products by URL category AND current search/price filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = product.category === categoryName;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMinPrice = minPrice === '' || product.price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice);
      return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, categoryName, searchQuery, minPrice, maxPrice]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
  };

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
      
      {/* Sticky Category Header */}
      <div className="sticky top-[55px] md:top-[65px] z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant px-3 py-3 md:px-8 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-grow min-w-0">
            <button 
              onClick={() => navigate(-1)}
              className="p-1.5 md:p-2 hover:bg-surface-container-high rounded-full transition-colors group flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-base md:text-2xl font-black truncate">{categoryName} <span className="text-primary hidden sm:inline">{t('collection')}</span></h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 md:gap-2 border-outline-variant hover:border-primary transition-all text-[10px] md:text-xs h-8 md:h-9 px-2 md:px-4"
            >
              <SlidersHorizontal className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>{showFilters ? t('hide_filters').replace('Filters', '').trim() : t('filters_title')}</span>
            </Button>
            <div className="text-[10px] md:text-xs font-bold text-outline bg-surface-container-low px-2 md:px-3 py-1.5 md:py-2 rounded-lg whitespace-nowrap">
              {t('items_count').replace('{count}', filteredProducts.length)}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:px-8 w-full">
        {/* Breadcrumbs - Moved above sticky or kept for context */}
        <div className="mb-6 hidden md:block">
          <nav className="flex text-[10px] uppercase tracking-widest font-bold text-outline">
            <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface">{categoryName}</span>
          </nav>
        </div>

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
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" /> {t('filters_title')}
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
                <h4 className="font-bold text-xs uppercase tracking-wider text-outline mb-4">{t('price_range')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      className="text-sm h-10 px-3" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-outline">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      className="text-sm h-10 px-3" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setMinPrice('0'); setMaxPrice('5000'); }} className="text-[11px] font-bold bg-surface border border-outline-variant py-1.5 px-2 rounded-lg hover:border-primary transition-colors text-center">{t('under_5k')}</button>
                    <button onClick={() => { setMinPrice('5000'); setMaxPrice('20000'); }} className="text-[11px] font-bold bg-surface border border-outline-variant py-1.5 px-2 rounded-lg hover:border-primary transition-colors text-center">5k - 20k</button>
                  </div>
                </div>
              </div>

              {/* Status */}
              {(minPrice || maxPrice || searchQuery) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> {t('clear_active_filters')}
                </button>
              )}

              {/* Mobile apply button */}
              <Button 
                className="mt-auto md:hidden"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-grow">
            {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-300">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-surface-container-low rounded-[40px] border border-dashed border-outline-variant">
                <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <X className="w-8 h-8 text-outline-variant" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">{t('no_matches')}</h3>
                <p className="text-outline max-w-xs mx-auto text-sm">
                  {t('no_matches_desc')}
                </p>
                <Button variant="outline" className="mt-6" onClick={clearAllFilters}>
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

export default CategoryPage;
