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
import { API_URL } from '../lib/utils';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  Store,
  Clock,
  MapPin,
  ChevronDown
} from 'lucide-react';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const { selectedBranch, branches } = useBranch();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState(selectedBranch || '');
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'creating', 'initiating', 'polling', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  // Generate time slots (every 30 mins from 8:00 to 20:00)
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && status !== 'success') {
      navigate('/cart');
    }
  }, [cart, navigate, status]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!pickupLocation || !pickupTime || !phone) {
      setErrorMessage(t('fill_all_details'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      // 1. Create Order with Pickup Details and Deposit
      setStatus('creating');
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
          pickupLocation,
          pickupTime,
          depositPaid: false,
          depositAmount: 500
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');
      
      const createdOrderId = orderData.id;
      setOrderId(createdOrderId);

      // 2. Initiate Payment (500 RWF Deposit)
      setStatus('initiating');
      const payRes = await fetch(`${API_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orderId: createdOrderId, 
          phoneNumber: phone 
        })
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.message || 'Failed to initiate payment');

      // 3. Start Polling
      setStatus('polling');
      startPolling(createdOrderId);

    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  const startPolling = (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/status/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status === 'SUCCESSFUL') {
          clearInterval(interval);
          setStatus('success');
          setLoading(false);
          clearCart();
          setTimeout(() => navigate('/success', { 
            state: { 
              pickupLocation, 
              pickupTime,
              totalPrice: getTotalPrice()
            } 
          }), 1500);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setStatus('error');
          setErrorMessage(t('payment_failed'));
          setLoading(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (status === 'polling') {
        setStatus('error');
        setErrorMessage(t('payment_timeout'));
        setLoading(false);
      }
    }, 120000);
  };

  const isFormComplete = pickupLocation && pickupTime && phone.length >= 10;

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 md:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart">
            <Button variant="ghost" className="p-2 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black">{t('secure_checkout')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: Forms */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Pickup Location */}
            <section className="bg-surface border border-outline-variant rounded-[40px] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">{t('select_pickup_location')}</h2>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">{t('where_collect')}</p>
                </div>
              </div>

              <div className="relative">
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                >
                  <option value="">{t('choose_branch')}</option>
                  {branches.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </section>

            {/* Step 2: Pickup Time */}
            <section className="bg-surface border border-outline-variant rounded-[40px] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">{t('select_pickup_time')}</h2>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">{t('when_arriving')}</p>
                </div>
              </div>

              <div className="relative">
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                >
                  <option value="">{t('choose_time')}</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </section>

            {/* Step 3: Payment */}
            <section className="bg-surface border border-outline-variant rounded-[40px] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black">{t('momo_deposit')}</h2>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg" 
                      alt="MTN MoMo" 
                      className="h-8 w-auto object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">{t('secure_order_deposit')}</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 mb-8">
                <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                  {t('deposit_desc').replace('{amount}', '500')}
                </p>
                <p className="text-[11px] font-bold text-outline mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {t('remaining_balance_desc')}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-on-surface ml-1">{t('mtn_phone')}</label>
                <Input 
                  type="tel" 
                  placeholder="078XXXXXXX" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 rounded-2xl text-lg font-bold tracking-widest"
                />
              </div>
            </section>
          </div>

          {/* Right Side: Summary & Action */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-outline-variant rounded-[40px] p-8 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                {t('summary')}
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
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
                <div className="flex justify-between text-outline font-bold text-sm">
                  <span>{t('grand_total')}</span>
                  <span>RWF {getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-primary font-black text-lg">
                  <span>{t('pay_now')}</span>
                  <span>RWF 500</span>
                </div>
                <div className="flex justify-between text-on-surface font-bold text-sm">
                  <span>{t('pay_at_pickup')}</span>
                  <span>RWF {(getTotalPrice() - 500).toLocaleString()}</span>
                </div>
              </div>

              {loading ? (
                <div className="mt-8 flex flex-col items-center gap-4 py-4">
                   <Loader2 className="w-10 h-10 animate-spin text-primary" />
                   <div className="text-center">
                    <p className="text-sm font-black text-on-surface">
                      {status === 'creating' && t('creating_order')}
                      {status === 'initiating' && t('connecting_momo')}
                      {status === 'polling' && t('waiting_confirmation')}
                    </p>
                    <p className="text-[10px] text-outline font-medium mt-1">{t('confirm_prompt').replace('{amount}', '500')}</p>
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
                    <Smartphone className="w-5 h-5" />
                    {t('pay_now')}
                  </Button>

                  <p className="text-[10px] text-center text-outline uppercase tracking-[0.2em] font-black">
                    {t('secure_pickup_badge')}
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
