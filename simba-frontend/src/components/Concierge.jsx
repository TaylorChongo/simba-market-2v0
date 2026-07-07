import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ArrowRight, CornerDownRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';

const getConciergeSessionId = () => {
  const existingSession = sessionStorage.getItem('simba_concierge_session');
  if (existingSession) return existingSession;

  const nextSession = `simba-concierge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem('simba_concierge_session', nextSession);
  return nextSession;
};

const Concierge = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId] = useState(() => getConciergeSessionId());

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }, [messages, loading, isOpen]);

  // Hide on admin dashboard
  if (location.pathname.startsWith('/dashboard/admin')) {
    return null;
  }

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? query).trim();
    if (!text || loading) return;

    pushMessage({ role: 'user', text });
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai-concierge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          language,
        }),
      });
      const data = await res.json();
      pushMessage({
        role: 'ai',
        text: data.message,
        suggestions: data.suggestions || [],
        actions: data.actions || [],
      });
    } catch (error) {
      console.error('Concierge error:', error);
      pushMessage({
        role: 'ai',
        text: language === 'fr'
          ? "Désolé, le concierge est indisponible pour le moment. Réessayez plus tard."
          : language === 'kin'
            ? "Ntabwo umukozi waboneka ubu. Mwongere mugerageze."
            : "Sorry, the concierge is unavailable right now. Please try again shortly.",
        suggestions: [],
        actions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleAction = (action) => {
    if (action.action === 'open_page' && action.url) {
      setIsOpen(false);
      navigate(action.url);
    }
  };

  const welcomeText = t('concierge_welcome');

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[9998] flex flex-col items-end max-w-[calc(100vw-2rem)]">
      {isOpen && (
        <div className="mb-4 w-full sm:w-[380px] h-[520px] max-h-[calc(100vh-160px)] bg-surface border border-outline-variant rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-primary text-on-primary flex items-center justify-between shadow-lg min-h-[64px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest leading-none">Simba Concierge</h3>
                <p className="text-[10px] font-medium opacity-80 uppercase mt-1">{t('concierge_subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-3 hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close concierge"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest"
          >
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-3xl p-4 shadow-sm bg-surface border border-outline-variant rounded-tl-none">
                <p className="text-sm font-medium leading-relaxed">{welcomeText}</p>
              </div>
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-surface border border-outline-variant rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.actions.map((action, actionIndex) => (
                        <button
                          key={`${action.page}-${actionIndex}`}
                          onClick={() => handleAction(action)}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
                        >
                          {t(`concierge_open_${action.page.replace(/-/g, '_')}`) || action.page.replace(/[-_]/g, ' ')}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {msg.suggestions.map((suggestion, suggestionIndex) => (
                        <button
                          key={`suggestion-${suggestionIndex}`}
                          onClick={() => handleSend(suggestion)}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2 text-left text-[11px] font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
                        >
                          <CornerDownRight className="w-3 h-3 shrink-0 text-outline" />
                          {suggestion}
                        </button>
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-outline">{t('concierge_thinking')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-surface border-t border-outline-variant">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={t('concierge_placeholder')}
                className="w-full bg-surface-container-low border border-outline-variant rounded-2xl pl-4 pr-14 py-3 min-h-[48px] text-sm focus:outline-none focus:border-primary transition-all font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-1 top-[4px] p-3 bg-primary text-on-primary rounded-xl disabled:opacity-50 transition-all hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button (bottom-left, separate from Simba AI) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group z-[100] ${
          isOpen ? 'bg-surface text-primary border border-outline-variant' : 'bg-primary text-on-primary'
        }`}
        aria-label="Open Simba Concierge"
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-8 md:h-8" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
            </div>
          </div>
        )}

        {!isOpen && (
          <div className="absolute right-full mr-4 bg-surface px-4 py-2 rounded-2xl shadow-xl border border-outline-variant whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-2 group-hover:translate-x-0 duration-300">
            <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              {t('concierge_tooltip')} <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
            </p>
          </div>
        )}
      </button>
    </div>
  );
};

export default Concierge;
