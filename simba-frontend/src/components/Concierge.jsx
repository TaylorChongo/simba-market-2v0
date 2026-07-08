import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ArrowRight, CornerDownRight, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';

const getConciergeSessionId = () => {
  const existing = sessionStorage.getItem('simba_concierge_session');
  if (existing) return existing;
  const next = `simba-concierge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem('simba_concierge_session', next);
  return next;
};

const Concierge = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen]     = useState(false);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId]             = useState(() => getConciergeSessionId());
  const [aiSearchOpen, setAiSearchOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Listen for AISearch panel toggle to hide FAB
  useEffect(() => {
    const handleAISearchToggle = (e) => {
      setAiSearchOpen(e.detail.open);
    };
    window.addEventListener('aisearch:toggle', handleAISearchToggle);
    return () => window.removeEventListener('aisearch:toggle', handleAISearchToggle);
  }, []);

  // Hide on admin dashboard
  if (location.pathname.startsWith('/dashboard/admin')) return null;

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
        body: JSON.stringify({ message: text, sessionId, language }),
      });
      const data = await res.json();
      pushMessage({
        role: 'ai',
        text: data.message,
        suggestions: data.suggestions || [],
        actions: data.actions || [],
      });
    } catch {
      pushMessage({
        role: 'ai',
        text: language === 'fr'
          ? 'Désolé, le concierge est indisponible pour le moment.'
          : language === 'kin'
            ? 'Ntabwo umukozi waboneka ubu.'
            : 'Sorry, the concierge is unavailable right now.',
        suggestions: [],
        actions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleSend(); };

  const handleAction = (action) => {
    if (action.action === 'open_page' && action.url) {
      setIsOpen(false);
      navigate(action.url);
    }
  };

  const welcomeText = t('concierge_welcome');

  /* ─── shared message list ─────────────────────────────────────────── */
  const MessageList = () => (
    <>
      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-black text-base text-on-surface mb-1">How can I help you?</p>
            <p className="text-xs text-outline max-w-[220px] leading-relaxed">
              {welcomeText}
            </p>
          </div>
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {['Track my order', 'Store hours', 'Contact support'].map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="px-3 py-1.5 bg-surface border border-outline-variant rounded-full text-xs font-bold text-outline hover:border-primary hover:text-primary transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
            msg.role === 'user'
              ? 'bg-primary text-on-primary rounded-tr-none'
              : 'bg-surface border border-outline-variant rounded-tl-none'
          }`}>
            {msg.role === 'ai' && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bot className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">Concierge</span>
              </div>
            )}
            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>

            {msg.actions?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {msg.actions.map((action, ai) => (
                  <button
                    key={`${action.page}-${ai}`}
                    onClick={() => handleAction(action)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    {t(`concierge_open_${action.page.replace(/-/g, '_')}`) || action.page.replace(/[-_]/g, ' ')}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {msg.suggestions?.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {msg.suggestions.map((s, si) => (
                  <button
                    key={`s-${si}`}
                    onClick={() => handleSend(s)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2 text-left text-[11px] font-semibold text-on-surface hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
                  >
                    <CornerDownRight className="w-3 h-3 shrink-0 text-outline" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-surface border border-outline-variant rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-outline">{t('concierge_thinking')}</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );

  /* ─── input bar ───────────────────────────────────────────────────── */
  const InputBar = () => (
    <form onSubmit={handleSubmit} className="shrink-0 px-4 py-3 bg-surface border-t border-outline-variant pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('concierge_placeholder')}
          className="flex-1 bg-surface-container-low border border-outline-variant rounded-2xl pl-4 pr-14 py-3 min-h-[48px] text-sm focus:outline-none focus:border-primary transition-all font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-on-primary rounded-xl disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );

  return (
    <>
      {/* ── Mobile: full bottom sheet ────────────────────────────────────── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[9997] flex flex-col">
          {/* Backdrop */}
          <div
            className="flex-shrink-0 flex-grow bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div
            className="bg-surface flex flex-col rounded-t-[28px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ maxHeight: '88vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 bg-outline-variant rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight leading-none">Simba Concierge</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-success rounded-full" />
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{t('concierge_subtitle')}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high text-outline active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant/50 mx-4 shrink-0" />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest min-h-0">
              <MessageList />
            </div>

            {/* Input */}
            <InputBar />
          </div>
        </div>
      )}

      {/* ── Desktop: floating panel ──────────────────────────────────────── */}
      {isOpen && (
        <div className="hidden md:flex fixed bottom-24 right-6 z-[9997] flex-col w-[400px] h-[560px] max-h-[calc(100vh-160px)] bg-surface border border-outline-variant rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-primary to-secondary flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight leading-none text-white">Simba Concierge</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Always here to help</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest min-h-0">
            <MessageList />
          </div>

          {/* Input */}
          <InputBar />
        </div>
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <div className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[9998] transition-all duration-300 ${
        aiSearchOpen || isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
      }`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group bg-gradient-to-br from-primary to-secondary text-white hover:scale-110 hover:shadow-primary/40"
          aria-label="Open Simba Concierge"
        >
          <div className="relative">
            <Bot className="w-6 h-6 md:w-7 md:h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            </span>
          </div>
        </button>

        {/* Hover tooltip — desktop only */}
        <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-surface px-4 py-2.5 rounded-2xl shadow-xl border border-outline-variant whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Bot className="w-3 h-3" />
            {t('concierge_tooltip')}
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
          </p>
        </div>
      </div>
    </>
  );
};

export default Concierge;
