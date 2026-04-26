import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { CheckCircle2, ShoppingBag, ArrowRight, Home, MapPin, Clock } from 'lucide-react';

const SuccessPage = () => {
  const location = useLocation();
  const { pickupLocation, pickupTime, totalPrice } = location.state || {};

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="max-w-xl w-full bg-surface border border-outline-variant rounded-[48px] p-10 md:p-14 text-center shadow-sm animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>

          <h1 className="text-4xl font-black text-on-surface mb-3 tracking-tight uppercase">Order Confirmed! 🎉</h1>
          <p className="text-outline font-medium mb-10 leading-relaxed text-lg">
            Your items are being prepared. Please arrive at your selected location and time.
          </p>

          {/* Pickup Details Card */}
          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 mb-10 text-left space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shadow-sm border border-outline-variant/50">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Pickup Location</p>
                <p className="text-lg font-black text-on-surface">{pickupLocation || 'Simba Supermarket'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shadow-sm border border-outline-variant/50">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Pickup Time</p>
                <p className="text-lg font-black text-on-surface">Today at {pickupTime || '30 minutes'}</p>
              </div>
            </div>

            <div className="h-px bg-outline-variant/50" />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest">Total Price</p>
                <p className="text-xl font-black text-primary">RWF {totalPrice?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest">Deposit Paid</p>
                <p className="text-sm font-black text-success">RWF 500 (MoMo)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/dashboard/client">
              <Button className="w-full py-4 h-auto rounded-2xl font-black flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                My Orders
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" className="w-full py-4 h-auto rounded-2xl font-bold flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Home
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-outline-variant/50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">
              Simba Market • Rwanda's Choice
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessPage;
