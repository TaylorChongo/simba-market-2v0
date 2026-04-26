import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Search, X, Sparkles, ShoppingCart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from './Button';
import ProductCard from './ProductCard';
import { API_URL, optimizeCloudinaryUrl } from '../lib/utils';

const AISearch = ({ placeholder }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${API_URL}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('AI Search error:', error);
      setResponse({ message: "Sorry, I couldn't process that. Please try again.", products: [] });
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <input
          type="text"
          placeholder={placeholder || "Ask Simba AI..."}
          className="w-full bg-surface-container-low border border-outline-variant rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />
        <button 
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 p-2 bg-primary text-on-primary rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Results Dropdown */}
      {isExpanded && (query.trim() || response) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-surface border border-outline-variant rounded-[32px] shadow-2xl z-[100] max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="font-black text-lg">Thinking...</h3>
                <p className="text-outline text-sm">Searching our catalog for the best matches</p>
              </div>
            ) : response ? (
              <div className="space-y-6">
                {/* AI Message */}
                <div className="bg-primary/5 border border-primary/10 p-5 rounded-3xl relative">
                  <div className="absolute -top-3 left-6 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3 h-3" /> Simba AI
                  </div>
                  <p className="text-sm font-medium leading-relaxed mt-2">{response.message}</p>
                </div>

                {/* Product Results */}
                {response.products && response.products.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-outline">Matched Products</h4>
                      <span className="text-[10px] font-bold bg-surface-container-high px-2 py-0.5 rounded-full">{response.products.length} found</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {response.products.map((product) => (
                        <div 
                          key={product.id} 
                          onClick={() => handleProductClick(product.id)}
                          className="group bg-surface border border-outline-variant rounded-2xl p-3 flex gap-4 hover:border-primary hover:shadow-md transition-all cursor-pointer relative"
                        >
                           <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                              <img 
                                src={optimizeCloudinaryUrl(product.image, { width: 120, height: 120 })} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                           </div>
                           <div className="flex flex-col justify-center min-w-0 flex-grow">
                              <h5 className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors leading-tight">{product.name}</h5>
                              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">{product.category}</p>
                              <p className="text-base font-black text-primary mt-1">{product.price.toLocaleString()} RWF</p>
                           </div>
                           <button 
                              onClick={(e) => handleAddToCart(e, product)}
                              className="self-center p-2.5 bg-primary text-on-primary rounded-xl hover:scale-105 active:scale-95 shadow-sm transition-all"
                           >
                              <Plus className="w-5 h-5" />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-60">
                    <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-outline" />
                    </div>
                    <p className="text-sm font-bold">No products found matching those criteria.</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1">Try a broader search</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-outline italic text-sm">
                Type something to start your conversational search...
              </div>
            )}
          </div>

          {response && (
            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant flex justify-center">
               <button 
                onClick={() => setIsExpanded(false)}
                className="text-[10px] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors"
               >
                 Dismiss Search
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearch;
