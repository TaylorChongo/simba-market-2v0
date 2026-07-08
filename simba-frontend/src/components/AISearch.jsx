import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, Loader2, X, Sparkles, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL, fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const AISearch = ({ placeholder, autoOpen = false, onClose }) => {
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(autoOpen);

  const containerRef    = useRef(null);
  const chatEndRef      = useRef(null);
  const inputRef        = useRef(null);
  const mobileInputRef  = useRef(null);

  const navigate    = useNavigate();
  const { addToCart } = useCart();

  const lastAi = messages.slice().reverse().find(m => m.role === 'ai');

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isExpanded && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isExpanded]);

  // Notify siblings (e.g. Concierge FAB) when the panel opens or closes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('aisearch:toggle', { detail: { open: isExpanded } }));
  }, [isExpanded]);

  // Focus the in-panel input when expanded
  useEffect(() => {
    if (isExpanded) {
      const ref = window.innerWidth < 768 ? mobileInputRef : inputRef;
      setTimeout(() => ref.current?.focus(), 300);
    }
  }, [isExpanded]);

  // Close on click outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── API call ─────────────────────────────────────────────────────── */
  const handleSearch = async (e, textOverride) => {
    e?.preventDefault();
    const text = (textOverride ?? query).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setQuery('');
    setLoading(true);
    setIsExpanded(true);

    try {
      const res  = await fetch(`${API_URL}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.message, products: data.products || [] }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that. Please try again.", products: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setIsExpanded(false);
    setQuery('');
    onClose?.();
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setIsExpanded(false);
  };

  /* ── shared message thread ────────────────────────────────────────── */
  const MessageThread = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest custom-scrollbar min-h-0">

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-4">
          <div className="w-14 h-14 bg-primary/8 rounded-3xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-black text-base text-on-surface">What are you looking for?</p>
            <p className="text-xs text-outline mt-1 max-w-[200px] mx-auto leading-relaxed">
              Try "tomatoes", "breakfast ideas", or "cleaning products"
            </p>
          </div>
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {['🥦 Vegetables', '🧴 Personal care', '🍳 Breakfast'].map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(null, s.split(' ').slice(1).join(' '))}
                className="px-3 py-1.5 bg-surface border border-outline-variant rounded-full text-xs font-bold text-outline hover:border-primary hover:text-primary transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
          {/* Bubble */}
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
            msg.role === 'user'
              ? 'bg-primary text-on-primary rounded-tr-none'
              : 'bg-surface border border-outline-variant rounded-tl-none'
          }`}>
            {msg.role === 'ai' && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">Simba AI</span>
              </div>
            )}
            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
          </div>

          {/* Product cards */}
          {msg.role === 'ai' && msg.products?.length > 0 && (
            <div className="mt-3 w-full space-y-2">
              {msg.products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="flex items-center gap-3 bg-surface border border-outline-variant rounded-2xl p-3 hover:border-primary hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/40">
                    <img
                      src={optimizeCloudinaryUrl(product.image, { width: 120, height: 120 })}
                      alt={product.name}
                      onError={(e) => fallbackToOriginalImage(e, product.image)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-outline font-medium mt-0.5">{product.category}</p>
                    <p className="text-sm font-black text-primary mt-0.5">
                      RWF {product.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="w-9 h-9 shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No results state */}
          {msg.role === 'ai' && !loading && msg.products?.length === 0 && lastAi === msg && (
            <div className="mt-3 w-full flex flex-col items-center text-center py-4 px-4 bg-surface border border-outline-variant/50 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-outline">No products found</p>
              <p className="text-[11px] text-outline/70 max-w-[220px]">Try different keywords or browse by category</p>
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {loading && (
        <div className="flex items-start gap-2">
          <div className="bg-surface border border-outline-variant rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <div className="flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );

  /* ── shared input bar ─────────────────────────────────────────────── */
  const InputBar = ({ inputRefProp }) => (
    <form
      onSubmit={handleSearch}
      className="shrink-0 px-4 py-3 bg-surface border-t border-outline-variant pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="relative flex items-center">
        <input
          ref={inputRefProp}
          type="text"
          placeholder="Ask about products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-surface-container-low border border-outline-variant rounded-2xl pl-4 pr-14 py-3 min-h-[48px] text-sm focus:outline-none focus:border-primary transition-all font-medium"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-on-primary rounded-xl disabled:opacity-40 flex items-center justify-center transition-all active:scale-95"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>
    </form>
  );

  return (
    <div className="relative w-full md:max-w-xl mx-0 md:mx-4" ref={containerRef}>

      {/* ── Navbar search bar (always visible when not expanded on desktop) ── */}
      <form
        onSubmit={handleSearch}
        className={`relative flex items-center transition-all duration-200 ${
          isExpanded ? 'opacity-0 pointer-events-none h-0 overflow-hidden md:h-auto md:overflow-visible md:opacity-100 md:pointer-events-auto' : ''
        }`}
      >
        <div className="absolute left-3.5 text-primary">
          <Sparkles className={`w-4 h-4 ${messages.length > 0 && !isExpanded ? 'animate-pulse' : ''}`} />
          {messages.length > 0 && !isExpanded && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder={messages.length > 0 && !isExpanded ? 'Continue…' : (placeholder || 'Ask Simba AI…')}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl md:rounded-2xl pl-9 pr-11 py-2.5 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (messages.length > 0 || window.innerWidth < 768) setIsExpanded(true);
          }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-on-primary rounded-lg disabled:opacity-50 transition-all active:scale-95"
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Send className="w-3.5 h-3.5" />
          }
        </button>
      </form>

      {/* ── Desktop dropdown panel ─────────────────────────────────────── */}
      {isExpanded && (
        <div className="hidden md:flex absolute top-full left-0 right-0 mt-3 z-[200] flex-col bg-surface border border-outline-variant rounded-[24px] shadow-2xl overflow-hidden h-[68dvh] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant bg-surface-container-low shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Simba AI Search</span>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-container-high text-outline hover:text-error transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <MessageThread />
          <InputBar inputRefProp={inputRef} />
        </div>
      )}

      {/* ── Mobile bottom sheet (portal) ──────────────────────────────── */}
      {isExpanded && createPortal(
        <div className="md:hidden fixed inset-0 z-[9995] flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />

          {/* Sheet */}
          <div
            className="relative bg-surface rounded-t-[28px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ maxHeight: '90dvh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 bg-outline-variant rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center shadow-md shadow-primary/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black leading-none">Simba AI Search</p>
                  <p className="text-[10px] text-outline font-bold mt-0.5">Ask me anything about products</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-outline active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant/50 mx-4 mb-0 shrink-0" />

            {/* Messages */}
            <MessageThread />

            {/* Input */}
            <InputBar inputRefProp={mobileInputRef} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AISearch;
