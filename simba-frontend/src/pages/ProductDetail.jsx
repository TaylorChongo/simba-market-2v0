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
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RotateCcw, Loader2, AlertCircle, CheckCircle2, MapPin, X, Share2 } from 'lucide-react';
import { optimizeCloudinaryUrl, API_URL, fallbackToOriginalImage, shortName } from '../lib/utils';
import localProducts from '../data/simba_products.json';

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
        
        if (!res.ok) throw new Error('API returned error');
        
        const data = await res.json();
        
        if (data && selectedBranch && data.stocks) {
           data.stock = data.stocks.find(s => s.branchName === selectedBranch)?.stock || 0;
        }
        
        if (data && data.id) {
          setProduct(data);
        } else {
          // Fallback: search local products
          const localProduct = localProducts.products.find(p => p.id === id);
          if (localProduct) {
            setProduct(localProduct);
          } else {
            setProduct(null);
          }
        }

        // Fetch related products
        const relatedRes = await fetch(`${API_URL}/api/products${branchQuery}`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          if (Array.isArray(relatedData) && data) {
            setRelatedProducts(relatedData.filter(p => p.category === data.category && p.id !== data.id).slice(0, 4));
          }
        } else {
          // Fallback: use local products for related
          const localRelated = localProducts.products.filter(p => p.category === (data?.category || product?.category) && p.id !== id).slice(0, 4);
          setRelatedProducts(localRelated);
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        // On complete API failure, fall back to local products
        const localProduct = localProducts.products.find(p => p.id === id);
        if (localProduct) {
          setProduct(localProduct);
          const localRelated = localProducts.products.filter(p => p.category === localProduct.category && p.id !== id).slice(0, 4);
          setRelatedProducts(localRelated);
        } else {
          setProduct(null);
        }
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
            <Link to="/" className="hover:text-primary transition-colors flex items-center">{t('home')}</Link>
            <span className="flex items-center">/</span>
            <span className="text-primary flex items-center">{category}</span>
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
              onError={(e) => fallbackToOriginalImage(e, image)}
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
                    <MapPin className="w-2.5 h-2.5" /> {shortName(selectedBranch)}
                  </div>
                )
              )}
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-black mb-3 leading-tight tracking-tight text-on-surface">
              {name}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-xl font-black text-primary">RWF {price.toLocaleString()}</span>
              {(id && (parseInt(String(id).substring(0, 2), 16) % 100 || 0) < 15) && (
                <>
                  <span className="text-base text-outline line-through">RWF {(price * 1.2).toLocaleString()}</span>
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-black">{t('save_percent')}</span>
                </>
              )}
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
                  addToCart(product);
                }}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-4 h-4" />
                {isOutOfStock ? t('out_of_stock') : isInCart ? t('added_to_cart') : t('add_to_cart_btn')}
              </Button>
            </div>

            {/* Social Share */}
            {(() => {
              const shareUrl = encodeURIComponent(window.location.href);
              const shareText = encodeURIComponent(`Check out ${name} on Simba Market – RWF ${price.toLocaleString()}`);
              return (
                <div className="flex items-center gap-2 mb-6">
                  <Share2 className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-outline mr-1">Share</span>
                  <a
                    href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-black/5 text-on-surface hover:bg-black/10 transition-colors"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                </div>
              );
            })()}

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
