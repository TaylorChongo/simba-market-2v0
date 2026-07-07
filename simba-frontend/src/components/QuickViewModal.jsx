import { X, ShoppingCart, Star, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const QuickViewModal = ({ product, onClose }) => {
  const { cart, addToCart } = useCart();
  const { selectedBranch } = useBranch();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!product) return null;

  const { id, name, price, image, category, stock, description } = product;
  const optimizedImage = optimizeCloudinaryUrl(image, { width: 600, height: 600 });
  const isInCart = cart.some(item => item.id === id);
  const isOutOfStock = user && selectedBranch && stock === 0;
  const isLowStock = user && selectedBranch && stock > 0 && stock < 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-surface-container-low">
            <img
              src={optimizedImage}
              alt={name}
              onError={e => fallbackToOriginalImage(e, image)}
              className="w-full h-full object-cover"
            />
            {user && selectedBranch && (
              <div className="absolute top-4 left-4">
                {isOutOfStock ? (
                  <span className="bg-error text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <X className="w-3 h-3" /> {t('out_of_stock')}
                  </span>
                ) : isLowStock ? (
                  <span className="bg-warning text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {t('only_left').replace('{stock}', stock)}
                  </span>
                ) : (
                  <span className="bg-success text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {t('in_stock')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-7 flex flex-col">
            <button onClick={onClose} className="self-end w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-outline mb-4">
              <X className="w-4 h-4" />
            </button>

            <span className="text-[9px] uppercase tracking-widest text-outline font-bold mb-2">{category}</span>
            <h2 className="text-xl font-black leading-tight mb-3">{name}</h2>

            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'text-primary fill-primary' : 'text-outline'}`} />
              ))}
              <span className="text-xs text-outline ml-1 font-medium">4.5</span>
            </div>

            {description && (
              <p className="text-sm text-outline font-medium leading-relaxed mb-4 line-clamp-3">{description}</p>
            )}

            <div className="mt-auto space-y-4">
              <p className="text-2xl font-black text-primary">RWF {price?.toLocaleString()}</p>

              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full h-12 font-black rounded-2xl flex items-center justify-center gap-2 ${isInCart ? 'bg-success' : ''}`}
              >
                <ShoppingCart className="w-4 h-4" />
                {isInCart ? t('added_to_cart') || 'Added to Cart' : t('add_to_cart') || 'Add to Cart'}
              </Button>

              <Link to={`/product/${id}`} onClick={onClose} className="block">
                <Button variant="ghost" className="w-full h-10 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> View Full Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
