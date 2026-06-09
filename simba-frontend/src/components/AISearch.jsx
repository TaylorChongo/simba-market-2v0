import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Search, X, Sparkles, ShoppingCart, Plus, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from './Button';
import ProductCard from './ProductCard';
import { API_URL, fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const AISearch = ({ placeholder }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, loading, isExpanded]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setIsExpanded(true);

    try {
      const res = await fetch(`${API_URL}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMessage.text,
          history: messages 
        }),
      });
      const data = await res.json();
      
      const aiMessage = { 
        role: 'ai', 
        text: data.message, 
        products: data.products || [] 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Search error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Sorry, I couldn't process that. Please try again.", 
        products: [] 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setIsExpanded(false);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleClose = () => {
    setMessages([]);
    setIsExpanded(false);
    setQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-4" ref={containerRef}>
      {/* Search Input Bar */}
      <form 
        onSubmit={handleSearch}
        className={`relative flex items-center transition-all duration-300 ${isExpanded ? 'scale-[1.02]' : ''}`}
      >
        <div className="absolute left-4 text-primary">
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${messages.length > 0 && !isExpanded ? 'animate-pulse text-primary' : ''}`} />
            {messages.length > 0 && !isExpanded && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            )}
          </div>
        </div>
        <input
          type="text"
          placeholder={messages.length > 0 && !isExpanded ? "Continue conversation..." : (placeholder || "Ask Simba AI...")}
          className="w-full bg-surface-container-low border border-outline-variant rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => messages.length > 0 && setIsExpanded(true)}
        />
        <button 
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 p-2 bg-primary text-on-primary rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      {/* Results Dropdown / Chat Panel */}
      {isExpanded && (messages.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-surface border border-outline-variant rounded-[24px] shadow-2xl z-[100] h-[60vh] md:h-[70vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-on-surface">Simba AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(false)} 
                title="Minimize"
                className="p-2 hover:bg-primary/10 rounded-xl text-outline hover:text-primary transition-all active:scale-90"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleClose} 
                title="Close and Clear"
                className="p-2 hover:bg-error/10 rounded-xl text-outline hover:text-error transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-container-lowest p-4 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-surface border border-outline-variant rounded-tl-none'
                }`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-primary/10 p-1 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">Simba AI</span>
                    </div>
                  )}
                  <p className={`text-sm ${msg.role === 'user' ? 'font-medium' : 'font-semibold leading-relaxed'}`}>
                    {msg.text}
                  </p>
                </div>

                {/* AI Products Section */}
                {msg.role === 'ai' && msg.products && msg.products.length > 0 && (
                  <div className="mt-4 w-full max-w-[95%]">
                    <div className="grid grid-cols-1 gap-2">
                      {msg.products.map((product) => (
                        <div 
                          key={product.id} 
                          onClick={() => handleProductClick(product.id)}
                          className="group bg-surface border border-outline-variant rounded-xl p-2.5 flex gap-3 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                        >
                           <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 border border-outline-variant/50">
                              <img 
                                src={optimizeCloudinaryUrl(product.image, { width: 100, height: 100 })} 
                                alt={product.name}
                                onError={(e) => fallbackToOriginalImage(e, product.image)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                           </div>
                           <div className="flex flex-col justify-center min-w-0 flex-grow">
                              <h5 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors mb-0.5">{product.name}</h5>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-black text-on-surface">{product.price.toLocaleString()}</p>
                                <span className="text-[9px] font-bold text-outline">RWF</span>
                              </div>
                           </div>
                           <button 
                              onClick={(e) => handleAddToCart(e, product)}
                              className="self-center p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-on-primary transition-all"
                           >
                              <Plus className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-xl animate-pulse">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-surface border border-outline-variant rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-surface border-t border-outline-variant">
             <form 
               onSubmit={handleSearch}
               className="relative flex items-center"
             >
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 p-2 bg-primary text-on-primary rounded-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearch;
