import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, getTotalPrice } = useCart();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" className="p-2 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black">{t('your_cart')}</h1>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-outline" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('empty_cart')}</h2>
            <p className="text-outline mb-8 max-w-md">
              {t('empty_cart_desc')}
            </p>
            <Link to="/">
              <Button className="px-8 h-12 text-base">{t('start_shopping')}</Button>
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
                  <Button 
                    variant="ghost" 
                    className="p-2 text-error hover:bg-error/10 rounded-full"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">{t('summary')}</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-outline">
                    <span>{t('subtotal')}</span>
                    <span>RWF {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-outline">
                    <span>{t('delivery_fee')}</span>
                    <span className="text-primary font-bold">{t('free')}</span>
                  </div>
                  <div className="h-px bg-outline-variant my-4" />
                  <div className="flex justify-between text-xl font-black">
                    <span>{t('total')}</span>
                    <span className="text-primary">RWF {getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full py-4 h-auto text-lg font-bold rounded-2xl">
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
