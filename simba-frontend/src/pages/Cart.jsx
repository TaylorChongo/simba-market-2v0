import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useBranch } from '../context/BranchContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { MINIMUM_ORDER_AMOUNT, formatRwf, shortName } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, MapPin, Map as MapIcon, AlertCircle, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, getTotalPrice, clearCart, savedItems, saveForLater, moveToCart, removeFromSaved } = useCart();
  const { t } = useLanguage();
  const { selectedBranch, toggleMap } = useBranch();
  const totalPrice = getTotalPrice();
  const remainingMinimum = Math.max(MINIMUM_ORDER_AMOUNT - totalPrice, 0);
  const isBelowMinimum = totalPrice < MINIMUM_ORDER_AMOUNT;
  const isCheckoutBlocked = !selectedBranch || isBelowMinimum;

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="p-2 rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-3xl font-black">{t('your_cart')}</h1>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="ml-2 text-xs font-black text-error uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('clear_cart') || 'Clear Cart'}
              </button>
            )}
          </div>
          
          <div className="hidden sm:block">
            <Button 
              variant="outline" 
              onClick={toggleMap}
              className={`h-11 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${
                selectedBranch 
                  ? 'border-primary/20 bg-primary/5 text-primary' 
                  : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{selectedBranch ? shortName(selectedBranch) : t('select_branch')}</span>
              <MapIcon className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-28 h-28 bg-surface-container-low border border-outline-variant rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-14 h-14 text-outline/40" />
            </div>
            <h2 className="text-2xl font-black mb-2">{t('empty_cart')}</h2>
            <p className="text-outline font-medium mb-8 max-w-xs leading-relaxed">
              {t('empty_cart_desc')}
            </p>
            <Link to="/">
              <Button className="px-10 h-12 text-base font-black rounded-2xl">
                {t('go_to_shop') || 'Go to Shop'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-surface-container-low border border-outline-variant rounded-3xl p-4 flex flex-col sm:flex-row gap-4 items-center"
                >
                  {/* Item Image */}
                  <div className="w-full sm:w-24 h-24 bg-surface rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                    <p className="text-primary font-black">RWF {item.price.toLocaleString()}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-full px-2 py-1">
                    <button 
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => increaseQuantity(item.id)}
                      className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="p-2 text-outline hover:bg-surface-container-high rounded-full"
                      onClick={() => saveForLater(item.id)}
                      title="Save for later"
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="p-2 text-error hover:bg-error/10 rounded-full"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="lg:col-span-2 mt-2">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-outline" /> Saved for Later ({savedItems.length})
                </h2>
                <div className="space-y-3">
                  {savedItems.map(item => (
                    <div key={item.id} className="bg-surface-container-low border border-outline-variant rounded-3xl p-4 flex gap-4 items-center opacity-80">
                      <div className="w-16 h-16 bg-surface rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-primary font-black text-sm">RWF {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-black rounded-xl" onClick={() => moveToCart(item.id)}>
                          Move to Cart
                        </Button>
                        <Button variant="ghost" className="p-2 text-error hover:bg-error/10 rounded-full" onClick={() => removeFromSaved(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">{t('summary')}</h2>
                
                <div className="space-y-4 mb-6">
                  {/* Branch Warning */}
                  {!selectedBranch && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Pickup Branch Required
                      </p>
                      <p className="text-[11px] font-bold text-on-surface mb-3 leading-tight">
                        Please select a Simba Supermarket branch for your pickup order.
                      </p>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={toggleMap}
                        className="w-full h-9 text-[10px] font-black uppercase tracking-widest rounded-xl"
                      >
                        {t('select_branch')}
                      </Button>
                    </div>
                  )}

                  {selectedBranch && (
                    <div className="flex items-center justify-between p-3 bg-surface border border-outline-variant rounded-2xl mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-outline uppercase tracking-widest">Pickup at</p>
                          <p className="text-xs font-bold truncate max-w-[120px]">
                            {shortName(selectedBranch)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleMap}
                        className="text-[10px] font-black text-primary uppercase hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {isBelowMinimum && (
                    <div className="bg-error/5 border border-error/15 rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-black text-error uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('minimum_order_title').replace('{amount}', formatRwf(MINIMUM_ORDER_AMOUNT))}
                      </p>
                      <p className="text-[11px] font-bold text-on-surface leading-tight">
                        {t('minimum_order_desc').replace('{remaining}', formatRwf(remainingMinimum))}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-outline">
                    <span>{t('subtotal')}</span>
                    <span>{formatRwf(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-outline">
                    <span>{t('delivery_fee')}</span>
                    <span className="text-primary font-bold">{t('free')}</span>
                  </div>
                  <div className="h-px bg-outline-variant my-4" />
                  <div className="flex justify-between text-xl font-black">
                    <span>{t('total')}</span>
                    <span className="text-primary">{formatRwf(totalPrice)}</span>
                  </div>
                </div>

                <Link to="/checkout" className={isCheckoutBlocked ? "pointer-events-none" : ""}>
                  <Button 
                    className={`w-full py-4 h-auto text-lg font-bold rounded-2xl ${isCheckoutBlocked ? 'opacity-50 grayscale' : ''}`}
                    disabled={isCheckoutBlocked}
                  >
                    {t('proceed_to_checkout')}
                  </Button>
                </Link>
                
                <p className="text-[10px] text-center text-outline mt-4 uppercase tracking-widest font-bold">
                  {t('secure_checkout_badge')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
