import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, X, Send, Plus, Search, Navigation, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL, fallbackToOriginalImage, optimizeCloudinaryUrl } from '../lib/utils';

const getAssistantSessionId = () => {
  const existingSession = sessionStorage.getItem('simba_assistant_session');
  if (existingSession) return existingSession;

  const nextSession = `simba-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem('simba_assistant_session', nextSession);
  return nextSession;
};

const FloatingAI = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, removeFromCart } = useCart();
  const { selectedBranch } = useBranch();
  const [sessionId] = useState(() => getAssistantSessionId());
  const [messages, setMessages] = useState([
    { role: 'ai', text: t('ai_welcome') }
  ]);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const branchQuery = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : '';
        const res = await fetch(`${API_URL}/api/products${branchQuery}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Assistant catalog context error:', error);
      }
    };

    fetchProducts();
  }, [selectedBranch]);

  useEffect(() => {
    // Update welcome message if it's the only message and language changed
    if (messages.length === 1 && messages[0].role === 'ai') {
      setMessages([{ role: 'ai', text: t('ai_welcome') }]);
    }
  }, [language, t]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Use a slight delay to ensure the DOM has fully rendered the new message
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      const assistantContext = buildAssistantContext(currentQuery);
      const res = await fetch(`${API_URL}/api/ai-search/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentQuery,
          sessionId,
          context: assistantContext,
          language: language,
        }),
      });
      const data = await res.json();
      const aiMessage = { 
        role: 'ai', 
        text: data.message,
        products: data.products,
        actions: data.actions || [],
      };
      
      setMessages(prev => [...prev, aiMessage]);
      executeAssistantActions(data.actions || [], data.products || []);
    } catch (error) {
      console.error('Shopping assistant error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: language === 'fr' ? "Désolé, j'ai des difficultés à me connecter." : language === 'kin' ? "Ntabwo nshoboye guhura na seriveri ubu." : "Sorry, I'm having trouble connecting right now."
      }]);
    } finally {
      setLoading(false);
      // Extra scroll after loading finishes
      scrollToBottom();
    }
  };

  const buildAssistantContext = (message) => {
    const currentPage = getCurrentPage();
    const searchResults = getSearchResults(message);
    const productDetails = getCurrentProductDetails();

    return {
      currentPage,
      currentCart: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category,
      })),
      selectedBranch,
      language,
      categories,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        stock: product.stock,
        inStock: product.inStock ?? product.stock !== 0,
      })),
      searchResults,
      productDetails,
    };
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/category/')) return decodeURIComponent(path.split('/category/')[1] || 'Category');
    if (path.startsWith('/product/')) return 'Product Detail';
    if (path.startsWith('/cart')) return 'Cart';
    if (path.startsWith('/checkout')) return 'Checkout';
    if (path.startsWith('/dashboard/client')) return 'Orders';
    if (path.startsWith('/login')) return 'Login';
    return path.replace('/', '') || 'Home';
  };

  const getCurrentProductDetails = () => {
    if (!location.pathname.startsWith('/product/')) return null;
    const productId = location.pathname.split('/product/')[1];
    return products.find((product) => String(product.id) === String(productId)) || null;
  };

  const getSearchResults = (message) => {
    const terms = normalizeText(message).split(' ').filter((term) => term.length > 2);
    if (!terms.length) return [];

    return products
      .filter((product) => {
        const haystack = normalizeText(`${product.name} ${product.category} ${product.description || ''}`);
        return terms.some((term) => haystack.includes(term));
      })
      .slice(0, 12)
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        stock: product.stock,
        inStock: product.inStock ?? product.stock !== 0,
      }));
  };

  const executeAssistantActions = (actions, responseProducts) => {
    // We are disabling all automatic side-effects to prevent the AI from 
    // changing pages or affecting the "outside world" without user interaction.
    console.log('AI proposed actions (disabled):', actions);
    
    actions.forEach((action) => {
      // Automatic navigation is disabled to isolate the AI assistant
      /*
      if (action.action === 'navigate') {
        const route = getRouteForPage(action.page);
        if (route) {
          const currentPath = location.pathname.replace(/\/$/, '') || '/';
          const targetPath = route.replace(/\/$/, '') || '/';
          if (currentPath !== targetPath) {
            navigate(route);
          }
        }
      }
      */

      if (action.action === 'search') {
        console.log('AI search action triggered:', action.query);
      }

      if (action.action === 'add_to_cart') {
        const product = findProductByName(action.product, responseProducts);
        if (product) {
          const quantity = Math.max(1, Number.parseInt(action.quantity || 1, 10));
          for (let index = 0; index < quantity; index += 1) {
            addToCart(product);
          }
        }
      }

      if (action.action === 'remove_from_cart') {
        const item = findCartItemByName(action.product);
        if (item) {
          removeFromCart(item.id);
        }
      }

      /*
      if (action.action === 'track_order') {
        const targetPath = '/dashboard/client';
        if (location.pathname.replace(/\/$/, '') !== targetPath) {
          navigate(targetPath);
        }
      }
      */
    });
  };

  const getRouteForPage = (page = '') => {
    const normalized = normalizeText(page);
    
    // Core pages
    if (normalized.includes('cart')) return '/cart';
    if (normalized.includes('checkout')) return '/checkout';
    if (normalized.includes('order') || normalized.includes('history') || normalized.includes('track')) return '/dashboard/client';
    if (normalized.includes('login') || normalized.includes('signin')) return '/login';
    if (normalized.includes('register') || normalized.includes('signup')) return '/register';
    if (normalized.includes('profile') || normalized.includes('dashboard')) return '/dashboard/client';
    if (normalized.includes('home') || normalized.includes('main') || normalized.includes('index')) return '/';

    // Category matching
    const matchedCategory = categories.find((category) => {
      const normCat = normalizeText(category);
      return normCat.includes(normalized) || normalized.includes(normCat);
    });
    if (matchedCategory) return `/category/${encodeURIComponent(matchedCategory)}`;

    // Fallback aliases for common departments
    if (normalized.includes('grocery') || normalized.includes('groceries') || normalized.includes('food') || normalized.includes('eat')) {
      return '/category/Food%20Products';
    }
    if (normalized.includes('electronic') || normalized.includes('phone') || normalized.includes('tech') || normalized.includes('appliance')) {
      return '/category/Kitchenware%20%26%20Electronics';
    }
    if (normalized.includes('household') || normalized.includes('kitchen') || normalized.includes('home')) {
      return '/category/Home%20%26%20Kitchen';
    }
    if (normalized.includes('drink') || normalized.includes('alcohol') || normalized.includes('wine') || normalized.includes('beer')) {
      return '/category/Alcoholic%20Drinks';
    }
    if (normalized.includes('beauty') || normalized.includes('care') || normalized.includes('cosmetic') || normalized.includes('soap')) {
      return '/category/Cosmetics%20%26%20Personal%20Care';
    }

    return null;
  };

  const findProductByName = (name, responseProducts = []) => {
    const candidates = [...responseProducts, ...products];
    const normalizedName = normalizeText(name);

    return candidates.find((product) => normalizeText(product.name) === normalizedName)
      || candidates.find((product) => normalizeText(product.name).includes(normalizedName))
      || candidates.find((product) => normalizedName.includes(normalizeText(product.name)));
  };

  const findCartItemByName = (name) => {
    const normalizedName = normalizeText(name);

    return cart.find((item) => normalizeText(item.name) === normalizedName)
      || cart.find((item) => normalizeText(item.name).includes(normalizedName))
      || cart.find((item) => normalizedName.includes(normalizeText(item.name)));
  };

  const normalizeText = (value = '') => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setIsOpen(false);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col items-end max-w-[calc(100vw-2rem)]">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-full sm:w-[400px] h-[500px] max-h-[calc(100vh-120px)] bg-surface border border-outline-variant rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
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
          <div 
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest"
          >
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
                    <div className="mt-4 space-y-3 pt-4 border-t border-outline-variant/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Recommendations</p>
                        <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{msg.products.length}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.products.slice(0, 4).map(product => (
                          <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product.id)}
                            className="flex items-center gap-3 p-2 bg-surface border border-outline-variant hover:border-primary hover:shadow-md hover:bg-surface-container-low transition-all duration-300 cursor-pointer group relative rounded-2xl"
                          >
                             <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-outline-variant/50">
                                <img 
                                  src={optimizeCloudinaryUrl(product.image, { width: 120, height: 120 })} 
                                  alt={product.name}
                                  onError={(e) => fallbackToOriginalImage(e, product.image)}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                             </div>
                             <div className="min-w-0 flex flex-col justify-center flex-grow py-0.5">
                                <p className="text-[12px] font-extrabold text-on-surface truncate group-hover:text-primary transition-colors leading-tight">{product.name}</p>
                                <p className="text-[9px] font-bold text-outline uppercase tracking-tight mt-0.5">{product.category}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <p className="text-[14px] font-black text-on-surface">{product.price.toLocaleString()}</p>
                                  <span className="text-[9px] font-bold text-outline">RWF</span>
                                </div>
                             </div>
                             <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                className="p-2.5 bg-primary text-on-primary rounded-xl hover:scale-110 active:scale-90 shadow-md shadow-primary/20 transition-all"
                                title="Add to Cart"
                             >
                                <Plus className="w-4 h-4" />
                             </button>
                          </div>
                        ))}
                      </div>
                      {msg.products.length > 4 && (
                        <p className="text-center text-[9px] font-black uppercase tracking-widest text-outline pt-1">+ {msg.products.length - 4} more items</p>
                      )}
                    </div>
                  )}

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.actions.slice(0, 3).map((action, actionIndex) => (
                        <span
                          key={`${action.action}-${actionIndex}`}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-primary"
                        >
                          {action.action === 'search' && <Search className="w-3 h-3" />}
                          {action.action === 'navigate' && <Navigation className="w-3 h-3" />}
                          {(action.action === 'add_to_cart' || action.action === 'remove_from_cart') && <ShoppingCart className="w-3 h-3" />}
                          {action.action.replace(/_/g, ' ')}
                        </span>
                      ))}
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
                className="absolute right-2 top-[5px] p-2 bg-primary text-on-primary rounded-xl disabled:opacity-50 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
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
