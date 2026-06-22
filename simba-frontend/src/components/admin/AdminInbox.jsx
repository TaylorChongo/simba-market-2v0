import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Clock, Search, MessageSquare, Filter, ChevronRight, User } from 'lucide-react';
import { API_URL } from '../../lib/utils';
import Button from '../Button';

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('simba_token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/admin/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('simba_token')}` }
      });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetch(`${API_URL}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('simba_token')}` }
      });
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'unread') return matchesSearch && !m.isRead;
    if (filter === 'read') return matchesSearch && m.isRead;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black mb-1">Customer Inbox</h3>
          <p className="text-sm text-outline font-medium">Manage inquiries and feedback from Simba clients.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20">
                {messages.filter(m => !m.isRead).length} Unread
            </div>
            <Button variant="outline" onClick={fetchMessages} className="h-10">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
        {/* Message List */}
        <div className="lg:col-span-5 bg-surface border border-outline-variant rounded-[32px] overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low/50">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
                {['all', 'unread', 'read'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline hover:bg-primary/10 hover:text-primary'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-outline animate-pulse font-bold">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center opacity-40">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="font-bold">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {filteredMessages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMessage(m); if (!m.isRead) markAsRead(m.id); }}
                    className={`w-full text-left p-4 hover:bg-surface-container-low transition-colors group relative ${selectedMessage?.id === m.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                  >
                    {!m.isRead && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-black truncate max-w-[150px] ${!m.isRead ? 'text-on-surface' : 'text-outline'}`}>
                        {m.name}
                      </span>
                      <span className="text-[10px] text-outline font-bold">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold mb-1 truncate ${!m.isRead ? 'text-on-surface' : 'text-outline-variant'}`}>
                      {m.subject}
                    </h4>
                    <p className="text-xs text-outline line-clamp-1 italic">
                      {m.message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-7 bg-surface border border-outline-variant rounded-[32px] overflow-hidden flex flex-col shadow-lg shadow-primary/5">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl">
                    {selectedMessage.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg leading-none mb-1">{selectedMessage.name}</h4>
                    <p className="text-xs text-primary font-bold">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="p-2 text-error hover:bg-error/10" onClick={() => deleteMessage(selectedMessage.id)}>
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Subject</span>
                  <h2 className="text-2xl font-black text-on-surface leading-tight">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2 mt-4 text-xs text-outline font-bold">
                    <Clock size={14} />
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-on-surface text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant bg-surface-container-low/30">
                <a href={`mailto:${selectedMessage.email}`}>
                  <Button className="w-full flex items-center justify-center gap-2 py-4">
                    <Mail size={18} />
                    Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
              <div className="w-24 h-24 bg-surface-container-high rounded-[40px] flex items-center justify-center mb-6">
                <Mail size={48} className="text-outline" />
              </div>
              <h4 className="text-xl font-black mb-2">Select a Message</h4>
              <p className="max-w-xs font-bold">Choose an inquiry from the sidebar to read the full details and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;
