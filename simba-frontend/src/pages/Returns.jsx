import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { RotateCcw, ShieldCheck, AlertCircle, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Returns = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-outline hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
        <section className="bg-error/5 py-16 md:py-24 border-b border-error/10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <span className="bg-error/10 text-error text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block">
              Satisfaction Guaranteed
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 leading-none tracking-tighter">
              Returns & <span className="text-error">Refunds.</span>
            </h1>
            <p className="text-outline max-w-2xl mx-auto text-sm md:text-lg font-medium">
              We want you to be 100% happy with your Simba shopping experience. 
              If something isn't right, we're here to make it better.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Policy Details */}
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                   <RotateCcw className="text-error" />
                   Return Windows
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-6 bg-surface border border-outline-variant rounded-3xl">
                      <h4 className="font-black text-sm uppercase tracking-widest text-error mb-2">Perishables</h4>
                      <p className="text-xs text-outline mb-2">Fresh food, dairy, meat, and bakery items.</p>
                      <p className="font-bold text-sm">24 Hours</p>
                   </div>
                   <div className="p-6 bg-surface border border-outline-variant rounded-3xl">
                      <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-2">Non-Perishables</h4>
                      <p className="text-xs text-outline mb-2">Packaged goods, home items, and electronics.</p>
                      <p className="font-bold text-sm">7 Days</p>
                   </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                   <FileText className="text-error" />
                   Requirements
                </h3>
                <ul className="space-y-4">
                  {[
                    "Original physical or digital receipt",
                    "Items must be in original, unopened packaging",
                    "Fresh items must have been stored correctly",
                    "Electronics must include all accessories and manuals"
                  ].map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                       <CheckCircle2 className="text-success mt-0.5" size={18} />
                       <span className="text-sm md:text-base font-medium text-outline">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Refund Process */}
            <div className="bg-surface-container-low p-8 md:p-12 rounded-[40px] border border-outline-variant relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-8">How to Return</h3>
                  <div className="space-y-8">
                     <div className="flex gap-4">
                        <div className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center font-black shrink-0">1</div>
                        <div>
                           <h4 className="font-bold mb-1">Visit your Pickup Branch</h4>
                           <p className="text-xs text-outline">Bring the items back to the customer service desk at the same branch where you collected your order.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center font-black shrink-0">2</div>
                        <div>
                           <h4 className="font-bold mb-1">Inspection</h4>
                           <p className="text-xs text-outline">Our branch manager will quickly inspect the items to ensure they meet our return criteria.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center font-black shrink-0">3</div>
                        <div>
                           <h4 className="font-bold mb-1">Immediate Refund</h4>
                           <p className="text-xs text-outline">Once approved, refunds for MoMo deposits are processed within 24 hours. Counter payments are refunded immediately in cash or store credit.</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 p-6 bg-error/10 rounded-3xl border border-error/20 flex gap-4">
                    <AlertCircle className="text-error shrink-0" />
                    <p className="text-xs font-bold text-error leading-relaxed">
                      Note: For health and safety reasons, personal care items, innerwear, 
                      and opened cosmetics cannot be returned once they leave our premises.
                    </p>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-error/5 rounded-full blur-3xl"></div>
            </div>

          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 md:px-8">
          <div className="bg-on-surface rounded-[40px] p-8 md:p-16 text-center text-surface relative overflow-hidden group">
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Need a <span className="text-error">hand?</span></h2>
                <p className="text-surface/70 max-w-xl mx-auto mb-8 text-sm md:text-lg">
                  If you have any specific concerns about a return or an item you received, 
                  our dedicated support team is just a call or message away.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <a href="/contact" className="w-full sm:w-auto">
                     <button className="w-full sm:w-auto bg-error text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-error/20">
                       Contact Support
                     </button>
                   </a>
                   <a href="/faq" className="w-full sm:w-auto">
                     <button className="w-full sm:w-auto bg-surface/10 text-surface border border-surface/20 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-surface/20 transition-all">
                       Read FAQ
                     </button>
                   </a>
                </div>
             </div>
             <RotateCcw size={300} className="absolute -top-20 -left-20 text-surface/5 -rotate-12 group-hover:rotate-0 transition-all duration-1000" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
