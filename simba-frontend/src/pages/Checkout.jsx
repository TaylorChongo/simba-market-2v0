import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import { API_URL, MINIMUM_ORDER_AMOUNT, formatRwf } from '../lib/utils';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Store,
  MapPin,
} from 'lucide-react';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const { selectedBranch } = useBranch();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'creating', 'initiating', 'polling', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const totalPrice = getTotalPrice();
  const remainingMinimum = Math.max(MINIMUM_ORDER_AMOUNT - totalPrice, 0);
  const isBelowMinimum = totalPrice < MINIMUM_ORDER_AMOUNT;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && status !== 'success') {
      navigate('/cart');
    }
  }, [cart, navigate, status]);

  const RW_PHONE_REGEX = /^\+2507[2389]\d{7}$/;

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    setPhoneError(val && !RW_PHONE_REGEX.test(val) ? t('invalid_phone') : '');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (isBelowMinimum) {
      setErrorMessage(t('minimum_order_error').replace('{amount}', formatRwf(MINIMUM_ORDER_AMOUNT)));
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!selectedBranch || !deliveryAddress || !RW_PHONE_REGEX.test(phone)) {
      setErrorMessage(t('fill_all_details'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      // 1. Create Order with Delivery Details
      setStatus('creating');
      const cartSnapshot = [...cart];
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          items: orderItems,
          fulfillmentBranch: selectedBranch,
          deliveryAddress,
          deliveryInstructions,
          phone,
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');
      
      const createdOrderId = orderData.id;

      // 2. Success - Simplified Flow (Navigate immediately)
      setStatus('success');
      setLoading(false);
      clearCart();
      
      setTimeout(() => navigate('/success', { 
        state: { 
          fulfillmentBranch: selectedBranch,
          deliveryAddress, 
          deliveryInstructions,
          totalPrice,
          phone,
          orderId: createdOrderId,
          items: cartSnapshot,
        } 
      }), 1500);

    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  const isFormComplete = selectedBranch && deliveryAddress && RW_PHONE_REGEX.test(phone) && !isBelowMinimum;

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 md:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/cart">
            <Button variant="ghost" className="p-2 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black">{t('secure_checkout')}</h1>
        </div>

        {/* Mobile sticky total bar */}
        <div className="lg:hidden sticky top-[55px] z-30 bg-surface border-b border-outline-variant px-4 py-3 -mx-4 mb-6 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-outline">{cart.length} items</span>
          <span className="text-lg font-black text-primary">{formatRwf(totalPrice)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Left Side: Forms */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Fulfillment Branch (Automatic) */}
            <section className="bg-surface border border-outline-variant rounded-[28px] md:rounded-[40px] p-5 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black">{t('select_fulfillment_branch')}</h2>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">{t('where_collect')}</p>
                </div>
              </div>
              <div className="p-5 bg-surface-container-low border border-outline-variant rounded-2xl flex items-center justify-between font-bold text-on-surface">
                <span>{selectedBranch || 'Simba Supermarket'}</span>
                <span className="text-[10px] bg-primary/15 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-black">Selected</span>
              </div>
            </section>

            {/* Step 2: Delivery Address */}
            <section className="bg-surface border border-outline-variant rounded-[28px] md:rounded-[40px] p-5 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black">{t('delivery_address')}</h2>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">{t('delivery_address_desc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input 
                  type="text" 
                  placeholder={t('delivery_address_placeholder')} 
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="h-14 rounded-2xl text-base font-bold"
                />
                <Input 
                  type="tel" 
                  placeholder="+250 78X XXX XXX"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="h-14 rounded-2xl text-base font-bold"
                />
                {phoneError && (
                  <p className="text-xs font-bold text-error flex items-center gap-1 ml-1">
                    <AlertCircle className="w-3 h-3" /> {phoneError}
                  </p>
                )}
              </div>
            </section>

            {/* Step 3: Delivery Instructions & Landmarks */}
            <section className="bg-surface border border-outline-variant rounded-[28px] md:rounded-[40px] p-5 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black">{t('delivery_instructions')}</h2>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">{t('delivery_instructions_desc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input 
                  type="text" 
                  placeholder={t('delivery_instructions_placeholder')} 
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="h-14 rounded-2xl text-base font-bold"
                />
              </div>
            </section>
          </div>

          {/* Right Side: Summary & Action */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-outline-variant rounded-[28px] md:rounded-[40px] p-5 md:p-8 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-xl font-bold mb-6 md:mb-8 flex items-center gap-2">
                {t('summary')}
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6 md:mb-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-outline font-black uppercase">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-on-surface whitespace-nowrap">
                      RWF {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-outline-variant">
                <div className="flex justify-between font-black text-lg">
                  <span>{t('grand_total')}</span>
                  <span>{formatRwf(totalPrice)}</span>
                </div>
                {isBelowMinimum && status !== 'success' && (
                  <div className="p-4 bg-error/5 border border-error/10 rounded-2xl flex items-start gap-3 text-error">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black">
                        {t('minimum_order_title').replace('{amount}', formatRwf(MINIMUM_ORDER_AMOUNT))}
                      </p>
                      <p className="text-[11px] font-bold text-on-surface mt-1 leading-tight">
                        {t('minimum_order_desc').replace('{remaining}', formatRwf(remainingMinimum))}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="mt-8 flex flex-col items-center gap-4 py-4">
                   <Loader2 className="w-10 h-10 animate-spin text-primary" />
                   <div className="text-center">
                    <p className="text-sm font-black text-on-surface">
                      {status === 'creating' && t('creating_order')}
                    </p>
                   </div>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {errorMessage && (
                    <div className="p-4 bg-error/5 border border-error/10 rounded-2xl flex items-center gap-3 text-error animate-shake">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-xs font-bold">{errorMessage}</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handlePayment}
                    className="w-full py-4 h-auto text-lg font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                    disabled={!isFormComplete}
                  >
                    {t('place_order')}
                  </Button>

                  <p className="text-[10px] text-center text-outline uppercase tracking-[0.2em] font-black">
                    {t('secure_delivery_badge')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
