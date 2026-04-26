import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RotateCcw, Loader2, AlertCircle, CheckCircle2, MapPin, X } from 'lucide-react';
import { optimizeCloudinaryUrl, API_URL } from '../lib/utils';

const ProductDetail = () => {
  const { id } = useParams();
  const { cart, addToCart } = useCart();
  const { selectedBranch } = useBranch();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const isInCart = cart.some(item => item.id === id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Scroll to top on mount or ID change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const branchQuery = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : '';
        const res = await fetch(`${API_URL}/api/products/${id}${branchQuery}`);
        const data = await res.json();
        
        if (data && selectedBranch && data.stocks) {
           data.stock = data.stocks.find(s => s.branchName === selectedBranch)?.stock || 0;
        }
        
        setProduct(data);

        const relatedRes = await fetch(`${API_URL}/api/products${branchQuery}`);
        const relatedData = await relatedRes.json();
        if (Array.isArray(relatedData)) {
          setRelatedProducts(relatedData.filter(p => p.category === data.category && p.id !== data.id).slice(0, 4));
        } else {
          console.error('Expected array for related products, but got:', relatedData);
        }

      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, selectedBranch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-outline" />
          </div>
          <h2 className="text-3xl font-black mb-4">{t('product_not_found')}</h2>
          <p className="text-outline mb-8 max-w-md">
            {t('product_not_found_desc')}
          </p>
          <Link to="/">
            <Button className="px-8 h-12 text-base">{t('back_to_shop')}</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { name, price, image, category, description, stock } = product;
  const isOutOfStock = selectedBranch && stock === 0;
  const isLowStock = selectedBranch && stock > 0 && stock < 5;

  const optimizedImage = optimizeCloudinaryUrl(image, { width: 800 });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 md:px-8">
        {/* Breadcrumbs / Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" className="p-2 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-outline">
            <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <span>/</span>
            <span className="text-primary">{category}</span>
          </div>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-12">
          {/* Image Gallery */}
          <div className="bg-surface-container-low border border-outline-variant rounded-3xl overflow-hidden aspect-square relative group max-w-[360px] mx-auto lg:mx-0">
            <img 
              src={optimizedImage} 
              alt={name} 
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? 'grayscale' : ''}`}
              onError={(e) => { e.target.src = "https://via.placeholder.com/600?text=Product+Image" }}
            />
            <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="font-black text-xs text-on-surface">4.8</span>
            </div>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
                 <div className="bg-error text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                    {t('out_of_stock')}
                 </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                {category}
              </span>
              
              {/* Stock Badge */}
              {user && selectedBranch ? (
                isOutOfStock ? (
                  <div className="flex items-center gap-1.5 text-white font-black text-[9px] uppercase tracking-widest bg-error px-2.5 py-1 rounded-full shadow-lg">
                    <X className="w-2.5 h-2.5" /> {t('no_stock')}
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center gap-1.5 text-white font-black text-[9px] uppercase tracking-widest bg-warning px-2.5 py-1 rounded-full shadow-lg">
                    <AlertCircle className="w-2.5 h-2.5" /> {t('only_left').replace('{stock}', stock)}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-white font-black text-[9px] uppercase tracking-widest bg-success px-2.5 py-1 rounded-full shadow-lg">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {t('in_stock')}
                  </div>
                )
              ) : (
                !user && selectedBranch && (
                   <div className="flex items-center gap-1.5 text-primary font-black text-[9px] uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20">
                    <MapPin className="w-2.5 h-2.5" /> {selectedBranch.replace('Simba Supermarket ', '')}
                  </div>
                )
              )}
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-black mb-3 leading-tight tracking-tight text-on-surface">
              {name}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-xl font-black text-primary">RWF {price.toLocaleString()}</span>
              <span className="text-base text-outline line-through">RWF {(price * 1.2).toLocaleString()}</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-black">{t('save_percent')}</span>
            </div>

            <p className="text-on-surface/70 text-xs md:text-sm leading-relaxed mb-6 max-w-md">
              {description || `Experience the finest quality ${name} from Simba Supermarket. Sourced with care to ensure the best value for your daily needs in Rwanda.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button 
                variant={isInCart ? "primary" : "outline"}
                className={`flex-grow h-11 text-sm font-black rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                  isOutOfStock 
                    ? 'bg-outline-variant cursor-not-allowed grayscale border-none text-outline' 
                    : isInCart 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 border-none' 
                      : 'bg-transparent border border-outline-variant text-outline hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20'
                }`}
                onClick={() => {
                  if (isOutOfStock) return;
                  if (!user) {
                    navigate('/login', { state: { from: window.location.pathname } });
                    return;
                  }
                  addToCart(product);
                }}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-4 h-4" />
                {isOutOfStock ? t('out_of_stock') : isInCart ? t('added_to_cart') : t('add_to_cart_btn')}
              </Button>
            </div>

            {/* Features/Trust Badges */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-surface-container-lowest border border-outline-variant rounded-2xl">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest text-on-surface">{t('fast_delivery')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 border-x border-outline-variant px-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest text-on-surface">{t('quality')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest text-on-surface">{t('returns')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-black tracking-tight uppercase border-l-4 border-primary pl-3">
                {t('you_may_also_like')}
              </h2>
              <Link to={`/category/${category}`}>
                <Button variant="ghost" className="font-black text-primary uppercase tracking-widest text-[9px]">
                  {t('view_all')}
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
