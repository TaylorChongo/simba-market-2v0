import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FAQ = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: "Orders",
      questions: [
        {
          q: "How do I place an order?",
          a: "You can place an order by selecting your preferred Simba branch, adding items to your cart, and proceeding to checkout. You'll need to choose a pickup time and pay a small deposit via MoMo to confirm your order."
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, you can cancel your order up to 2 hours before your scheduled pickup time. Deposits are refundable for cancellations made within this timeframe. Please contact our support team for assistance."
        },
        {
          q: "What if an item I ordered is out of stock?",
          a: "While we try to keep our online inventory synced with our branch shelves, occasionally items may run out. If an item is missing from your order, we will notify you and adjust your final bill at the pickup counter."
        }
      ]
    },
    {
      category: "Payment",
      questions: [
        {
          q: "Which payment methods do you accept?",
          a: "For online confirmation, we currently accept MTN MoMo. For the remaining balance at the pickup counter, we accept Cash, MoMo, and all major Debit/Credit cards (Visa, Mastercard)."
        },
        {
          q: "Is the online deposit secure?",
          a: "Absolutely. Our payment gateway uses industry-standard encryption and security protocols. We never store your MoMo PIN or sensitive financial data."
        }
      ]
    },
    {
      category: "Pickup & Delivery",
      questions: [
        {
          q: "Do you offer home delivery?",
          a: "Currently, our website focuses on the 'Click & Collect' model where you order online and pick up at your selected branch. However, we are rolling out home delivery for select areas in Kigali. Contact our support for delivery availability."
        },
        {
          q: "How long will you hold my order?",
          a: "We will hold your prepared order for up to 3 hours after your selected pickup time. If you're running late, please give the branch a call so we can keep your items fresh."
        }
      ]
    }
  ];

  const categories = ['All', ...faqData.map(d => d.category)];

  const filteredFaqs = faqData.filter(cat => activeCategory === 'All' || cat.category === activeCategory)
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-primary py-16 md:py-24 text-on-primary">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
              Frequently Asked <span className="text-primary-container">Questions.</span>
            </h1>
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} />
              <input 
                type="text" 
                placeholder="Search for answers..."
                className="w-full bg-white text-on-surface rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12 md:px-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map(cat => (
                <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-surface-container-high text-outline hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto space-y-12">
            {filteredFaqs.map((cat, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-6 border-b border-primary/20 pb-2 inline-block">
                  {cat.category}
                </h3>
                <div className="space-y-4">
                  {cat.questions.map((item, j) => (
                    <FaqItem key={j} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <HelpCircle size={64} className="mx-auto mb-4" />
                <p className="font-bold">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </section>

        {/* Support CTA */}
        <section className="bg-surface-container-low py-16 border-t border-outline-variant/30">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">Still have questions?</h2>
            <p className="text-outline mb-8">If you cannot find an answer in our FAQ, you can always contact our support team. We're here to help you 24/7.</p>
            <a href="/contact">
              <button className="bg-on-surface text-surface px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
                Contact Support
              </button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-surface border border-outline-variant rounded-[24px] overflow-hidden transition-all ${isOpen ? 'shadow-lg border-primary/30 ring-1 ring-primary/5' : 'hover:border-primary/20'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
      >
        <span className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-primary' : 'group-hover:text-primary'}`}>
          {question}
        </span>
        <div className={`p-1.5 rounded-lg transition-all ${isOpen ? 'bg-primary text-on-primary rotate-180' : 'bg-surface-container-high text-outline group-hover:bg-primary/10 group-hover:text-primary'}`}>
          <ChevronDown size={18} />
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
          <p className="text-outline text-sm md:text-base leading-relaxed border-t border-outline-variant/30 pt-4">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQ;
