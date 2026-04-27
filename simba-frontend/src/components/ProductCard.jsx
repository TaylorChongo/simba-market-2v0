import { ShoppingCart, Star, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const ProductCard = ({ product }) => {
  const { cart, addToCart } = useCart();
  const { selectedBranch } = useBranch();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Placeholder data if no product is passed
  const { id, name = "Product Name", price = 0, image = "https://via.placeholder.com/300", category = "Category", stock } = product || {};

  const optimizedImage = optimizeCloudinaryUrl(image, { width: 400, height: 400 });

  const isInCart = cart.some(item => item.id === id);

  const isOutOfStock = user && selectedBranch && stock === 0;
  const isLowStock = user && selectedBranch && stock > 0 && stock < 5;

  return (
    <div className={`group bg-surface-container-lowest border border-outline-variant rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`}>
      <Link to={`/product/${id}`} className="flex flex-col flex-grow">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-surface-container-low">
            <img 
            src={optimizedImage} 
            alt={name}
            onError={(e) => fallbackToOriginalImage(e, image)}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale' : ''}`}
          />
          
          {/* Stock Badges */}
          {user && selectedBranch && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
              {isOutOfStock ? (
                <div className="bg-error text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1">
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('out_of_stock')}
                </div>
              ) : isLowStock ? (
                <div className="bg-warning text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('only_left').replace('{stock}', stock)}
                </div>
              ) : (
                <div className="bg-success text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('in_stock')}
                </div>
              )}
            </div>
          )}

          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-surface/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 md:px-2 md:py-1 flex items-center gap-1 text-[8px] md:text-[10px] font-bold shadow-sm">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary fill-primary" />
            <span>4.5</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col flex-grow">
          <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-outline font-bold mb-1">
            {category}
          </span>
          <h3 className="font-bold text-sm md:text-base mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors h-[2.5em]">
            {name}
          </h3>
          
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] md:text-[10px] text-outline line-through truncate">RWF {(price * 1.2).toLocaleString()}</span>
              <span className="text-sm md:text-lg font-black text-primary truncate">RWF {price.toLocaleString()}</span>
            </div>
            
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isOutOfStock) return;

                if (!user) {
                  navigate('/login', { state: { from: window.location.pathname } });
                  return;
                }
                
                addToCart(product);
              }}
              className="flex-shrink-0"
            >
              <Button 
                variant={isInCart ? "primary" : "outline"} 
                className={`p-2 md:p-2.5 transition-all duration-300 ${
                  isOutOfStock 
                    ? 'cursor-not-allowed border-outline-variant text-outline' 
                    : isInCart 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 border-none' 
                      : 'bg-transparent border border-outline-variant/50 text-outline hover:bg-primary hover:text-white hover:border-primary'
                }`}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
