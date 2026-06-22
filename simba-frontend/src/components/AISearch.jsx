import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Search, X, Sparkles, ShoppingCart, Plus, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from './Button';
import ProductCard from './ProductCard';
import { API_URL, fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const AISearch = ({ placeholder, autoOpen = false, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(autoOpen);
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);
  // refs for controlling/focusing inputs when showing empty states
  const topInputRef = useRef(null);
  const bottomInputRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // helpers to inspect recent messages for empty-result handling
  const lastAi = messages.slice().reverse().find(m => m.role === 'ai');
  const lastUser = messages.slice().reverse().find(m => m.role === 'user');

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
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);
    setIsExpanded(true);

    try {
      const res = await fetch(`${API_URL}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMessage.text,
          history: newMessages 
        }),
      });
      const data = await res.json();
      
      const aiMessage = { 
        role: 'ai', 
        text: data.message, 
        products: data.products || [] 
      };
      setMessages(prev => [...prev, aiMessage]);
      // ensure results panel is visible and scrolled into view
      setIsExpanded(true);
      // allow render to complete then scroll
      setTimeout(() => scrollToBottom(), 80);
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
    <div className="relative w-full md:max-w-xl mx-0 md:mx-4" ref={containerRef}>
      {/* Search Input Bar */}
      <form 
        onSubmit={handleSearch}
        className={`relative flex items-center transition-all duration-300 ${isExpanded ? 'opacity-0 pointer-events-none h-0 overflow-hidden md:h-auto md:overflow-visible md:opacity-100 md:pointer-events-auto' : ''}`}
      >
        <div className="absolute left-4 text-primary">
          <div className="relative">
            <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${messages.length > 0 && !isExpanded ? 'animate-pulse text-primary' : ''}`} />
            {messages.length > 0 && !isExpanded && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </div>
        </div>
        <input
          ref={topInputRef}
          type="text"
          placeholder={messages.length > 0 && !isExpanded ? "Continue conversation..." : (placeholder || "Ask Simba AI...")}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-12 py-2.5 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (messages.length > 0) setIsExpanded(true);
            else if (window.innerWidth < 768) setIsExpanded(true);
          }}
        />
        <button 
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-1.5 md:right-2 p-2 bg-primary text-on-primary rounded-lg md:rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        </button>
      </form>

      {/* Results Dropdown / Chat Panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-[200] md:bg-transparent md:backdrop-blur-none md:absolute md:top-full md:inset-auto md:left-0 md:right-0 md:mt-3 flex flex-col md:items-start justify-end md:justify-start animate-in fade-in duration-300">
          {/* Mobile backdrop */}
          <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setIsExpanded(false)} />

          <div className="relative bg-surface w-full h-[85dvh] md:h-[70dvh] rounded-t-[28px] md:rounded-[24px] border-t md:border border-outline-variant shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-top-2 duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant bg-surface-container-low rounded-t-[28px] md:rounded-t-[24px] shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-on-surface">Simba AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setIsExpanded(false); onClose?.(); }} title="Minimize" className="p-2 hover:bg-primary/10 rounded-xl text-outline hover:text-primary transition-all">
                  <Minimize2 className="w-5 h-5" />
                </button>
                <button onClick={() => { handleClose(); onClose?.(); }} title="Close" className="p-2 hover:bg-error/10 rounded-xl text-outline hover:text-error transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-container-lowest p-4 space-y-6 min-h-[120px] md:min-h-[180px]">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="font-black text-on-surface tracking-tight">How can I help you today?</p>
                    <p className="text-xs text-outline max-w-[200px] mx-auto mt-1">Try searching for recipes, categories, or specific items.</p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-surface border border-outline-variant rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/10 p-1 rounded-lg">
                          <Sparkles className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">Simba AI</span>
                      </div>
                    )}
                    <p className={`text-sm ${msg.role === 'user' ? 'font-medium' : 'font-semibold leading-relaxed'}`}>{msg.text}</p>
                  </div>

                  {msg.role === 'ai' && msg.products?.length > 0 && (
                    <div className="mt-4 w-full max-w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.products.map((product) => (
                          <div key={product.id} onClick={() => handleProductClick(product.id)}
                            className="group bg-surface border border-outline-variant rounded-2xl p-3 flex gap-3 hover:border-primary hover:shadow-md transition-all cursor-pointer">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-outline-variant/50">
                              <img src={optimizeCloudinaryUrl(product.image, { width: 150, height: 150 })} alt={product.name}
                                onError={(e) => fallbackToOriginalImage(e, product.image)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0 flex-grow">
                              <h5 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors mb-1">{product.name}</h5>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-black text-primary">{product.price.toLocaleString()}</p>
                                <span className="text-[9px] font-bold text-outline">RWF</span>
                              </div>
                            </div>
                            <button onClick={(e) => handleAddToCart(e, product)}
                              className="self-center p-2.5 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-all border border-primary/10">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty-state when AI returns no products */}
              {lastAi && !loading && (lastAi.products?.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center w-full">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-bold text-on-surface">No results found</p>
                  <p className="text-xs text-outline max-w-[280px]">We couldn't find products matching your request. Try different keywords, check spelling, or broaden the search.</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setQuery(''); bottomInputRef.current?.focus(); }} className="px-3 py-2 bg-primary text-on-primary rounded-xl text-sm">Try again</button>
                    <button onClick={() => { setMessages([]); setIsExpanded(false); }} className="px-3 py-2 bg-surface border border-outline-variant rounded-xl text-sm">Close</button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl animate-pulse">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-surface border border-outline-variant rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input — always visible at bottom, never overlapping */}
            <div className="shrink-0 p-4 bg-surface border-t border-outline-variant">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={bottomInputRef}
                  autoFocus
                  type="text"
                  placeholder="Send a message..."
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" disabled={loading || !query.trim()}
                  className="shrink-0 w-11 h-11 bg-primary text-on-primary rounded-2xl disabled:opacity-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearch;
