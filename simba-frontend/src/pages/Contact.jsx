import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: 'Order Inquiry', message: '' });
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-grow">

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-outline hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
        {/* Hero Header */}
        <section className="bg-primary/5 py-16 md:py-24 border-b border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block">
              {t('contact_us')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 leading-none tracking-tighter">
              We're Here to <span className="text-primary">Help You.</span>
            </h1>
            <p className="text-outline max-w-2xl mx-auto text-sm md:text-lg font-medium">
              Have a question about an order, a product, or just want to say hi?
              Our team at Simba Supermarket is ready to assist you.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface border border-outline-variant rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-2">Email Us</h3>
                <p className="text-outline text-sm mb-4">Our support team usually responds within 2 hours.</p>
                <a href="mailto:support@simba.rw" className="text-primary font-bold hover:underline">support@simba.rw</a>
              </div>

              <div className="bg-surface border border-outline-variant rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Phone className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-2">Call Us</h3>
                <p className="text-outline text-sm mb-4">Direct line to our customer service desk.</p>
                <a href="tel:+250788123456" className="text-primary font-bold hover:underline">+250 788 123 456</a>
              </div>

              <div className="bg-surface border border-outline-variant rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-2">Service Hours</h3>
                <p className="text-outline text-sm mb-1">Mon - Sat: 7:00 AM - 10:00 PM</p>
                <p className="text-outline text-sm">Sun: 8:00 AM - 9:00 PM</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-outline-variant rounded-[40px] p-8 md:p-12 shadow-2xl shadow-primary/5">
                {success ? (
                  <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-black mb-4">Message Sent!</h3>
                    <p className="text-outline mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
                    <Button onClick={() => setSuccess(false)}>Send Another Message</Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-3xl font-black mb-8">Send us a Message</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Your Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Email Address</label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Subject</label>
                        <select
                          className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        >
                          <option>Order Inquiry</option>
                          <option>Product Feedback</option>
                          <option>Branch Management</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Message</label>
                        <textarea
                          rows={5}
                          placeholder="How can we help you?"
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all font-bold resize-none"
                        ></textarea>
                      </div>

                      {error && <p className="text-error text-xs font-bold ml-1">{error}</p>}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 group"
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                        {!loading && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Contact;