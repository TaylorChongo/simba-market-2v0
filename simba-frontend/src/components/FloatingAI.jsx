import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, MessageSquare, ShoppingBag, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL, fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const FloatingAI = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [messages, setMessages] = useState([
    { role: 'ai', text: t('ai_welcome') }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentQuery,
          history: messages,
          language: language
        }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.message,
        products: data.products 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: language === 'fr' ? "Désolé, j'ai des difficultés à me connecter." : language === 'kin' ? "Ntabwo nshoboye guhura na seriveri ubu." : "Sorry, I'm having trouble connecting right now."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setIsOpen(false);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-surface border border-outline-variant rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-primary text-on-primary flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Simba AI</h3>
                <p className="text-[10px] font-medium opacity-80 uppercase">{t('hero_badge')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-surface border border-outline-variant rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  
                  {/* Embedded Products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 space-y-2 pt-4 border-t border-outline-variant/30">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{t('recommended_items')}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.products.slice(0, 3).map(product => (
                          <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product.id)}
                            className="flex items-center gap-3 p-3 bg-surface border border-outline-variant hover:border-primary hover:shadow-md transition-all cursor-pointer group relative rounded-2xl"
                          >
                             <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                                <img 
                                  src={optimizeCloudinaryUrl(product.image, { width: 100, height: 100 })} 
                                  alt={product.name}
                                  onError={(e) => fallbackToOriginalImage(e, product.image)}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                             </div>
                             <div className="min-w-0 flex flex-col justify-center flex-grow">
                                <p className="text-[12px] font-bold text-on-surface truncate group-hover:text-primary transition-colors leading-tight">{product.name}</p>
                                <p className="text-[10px] font-medium text-outline uppercase tracking-tight mt-0.5">{product.category}</p>
                                <p className="text-[13px] font-black text-primary mt-1">{product.price.toLocaleString()} RWF</p>
                             </div>
                             <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                className="p-2.5 bg-primary text-on-primary rounded-xl hover:scale-105 active:scale-95 shadow-sm transition-all"
                                title="Add to Cart"
                             >
                                <Plus className="w-4 h-4" />
                             </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-outline-variant rounded-3xl rounded-tl-none p-4 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-outline">{t('ai_thinking')}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-surface border-t border-outline-variant">
            <div className="relative">
              <input 
                type="text"
                placeholder={t('type_message')}
                className="w-full bg-surface-container-low border border-outline-variant rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1.2 p-2 bg-primary text-on-primary rounded-xl disabled:opacity-50 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-surface text-primary border border-outline-variant' : 'bg-primary text-on-primary'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-8 md:h-8" />
        ) : (
          <div className="relative">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 bg-surface px-4 py-2 rounded-2xl shadow-xl border border-outline-variant whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-x-2 group-hover:translate-x-0 duration-300">
            <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              {t('chat_with_ai')} <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
            </p>
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingAI;
