import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Truck, Package, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ShippingPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="max-w-3xl">
              <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block">
                Logistics & Care
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 leading-none tracking-tighter">
                Shipping & <span className="text-primary">Delivery Policy.</span>
              </h1>
              <p className="text-outline text-sm md:text-lg font-medium leading-relaxed">
                At Simba Supermarket, we prioritize the freshness of your groceries and the 
                speed of our service. Whether you choose to pick up your order or have it 
                delivered, we ensure the highest standards of handling and care.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Order Fulfillment</h3>
                </div>
                <p className="text-outline text-sm md:text-base leading-relaxed">
                  All orders placed before 4:00 PM are processed same-day. Orders placed after 4:00 PM 
                  will be scheduled for the following morning. Our staff meticulously selects the 
                  freshest produce and checks expiry dates on all packaged goods before packing 
                  your order.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Truck className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Delivery Zones</h3>
                </div>
                <p className="text-outline text-sm md:text-base leading-relaxed mb-4">
                  We currently offer home delivery within the following zones in Kigali:
                </p>
                <ul className="grid grid-cols-2 gap-2 text-xs font-bold text-on-surface">
                  <li className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Nyarugenge</li>
                  <li className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Gasabo</li>
                  <li className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Kicukiro</li>
                  <li className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Remera</li>
                </ul>
              </div>
            </div>

            <div className="space-y-12">
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Clock className="text-primary" /> 
                    Pickup Windows
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                      <span className="text-sm font-bold">Morning Session</span>
                      <span className="text-xs font-black uppercase tracking-widest text-primary">8:00 AM - 11:30 AM</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                      <span className="text-sm font-bold">Afternoon Session</span>
                      <span className="text-xs font-black uppercase tracking-widest text-primary">1:00 PM - 5:30 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Evening Session</span>
                      <span className="text-xs font-black uppercase tracking-widest text-primary">6:00 PM - 9:30 PM</span>
                    </div>
                  </div>
                  <p className="mt-6 text-[11px] text-outline italic">
                    * Please arrive within your selected 1-hour window to ensure your items (especially cold goods) are at peak quality.
                  </p>
               </div>

               <div className="flex gap-4 p-6 bg-primary/5 rounded-3xl border border-primary/20">
                  <ShieldCheck className="text-primary shrink-0" size={24} />
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">Safe Handling Guarantee</h4>
                    <p className="text-xs text-outline leading-relaxed">
                      All delivery personnel and pickup staff follow strict hygiene protocols, 
                      including the use of thermal bags for frozen items and fresh meat.
                    </p>
                  </div>
               </div>
            </div>

          </div>
        </section>

        <section className="bg-on-surface text-surface py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Track your <span className="text-primary">freshness.</span></h2>
              <p className="text-surface/70 text-sm md:text-lg mb-8">
                Once your order is confirmed and prepared, you will receive an SMS notification with 
                your pickup code or your driver's contact information for home delivery.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-surface/10 px-6 py-3 rounded-2xl border border-surface/20 flex items-center gap-3">
                   <div className="w-2 h-2 bg-success rounded-full animate-ping"></div>
                   <span className="text-xs font-black uppercase tracking-widest">Real-time SMS Alerts</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-gradient-to-tr from-primary to-primary-container rounded-[60px] flex items-center justify-center p-12 shadow-2xl shadow-primary/40 relative overflow-hidden group">
               <Truck size={120} className="text-on-primary group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500" />
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;
