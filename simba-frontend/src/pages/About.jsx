import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, ShoppingBag, Users, ArrowRight, ArrowLeft } from 'lucide-react';

const STATS = [
  { value: '9', label: 'Branches in Kigali' },
  { value: '5,000+', label: 'Products Available' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '2007', label: 'Founded' },
];

const VALUES = [
  { icon: ShoppingBag, title: 'Quality First', desc: 'We source only the freshest and finest products for every household.' },
  { icon: MapPin, title: 'Always Nearby', desc: '9 locations across Kigali so you\'re never far from a Simba store.' },
  { icon: Users, title: 'Community Driven', desc: 'Proudly Rwandan, committed to serving our local communities every day.' },
];

const About = () => {
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

        {/* Hero */}
        <section className="bg-primary/5 py-16 md:py-24 border-b border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 leading-none tracking-tighter">
              Rwanda's Favourite <span className="text-primary">Supermarket.</span>
            </h1>
            <p className="text-outline max-w-2xl mx-auto text-sm md:text-lg font-medium">
              Since 2007, Simba Supermarket has been delivering quality groceries and household essentials to families across Kigali — in-store and now online.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-surface border border-outline-variant rounded-[28px] p-6 text-center shadow-sm">
                <p className="text-4xl font-black text-primary mb-1">{value}</p>
                <p className="text-xs font-black text-outline uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story */}
        <section className="bg-surface-container-low border-y border-outline-variant/30 py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-black mb-6">Our Story</h2>
            <div className="space-y-4 text-outline font-medium leading-relaxed text-sm md:text-base">
              <p>
                Simba Supermarket was founded in 2007 with a simple mission: make quality food and household products accessible to every Rwandan family. Starting with a single store in Kigali, we've grown to 9 branches spread across the city.
              </p>
              <p>
                We believe shopping should be simple, affordable, and enjoyable. That's why we built Simba Market 2.0 — bringing the full supermarket experience online with AI-powered search, real-time stock, and fast delivery straight to your door.
              </p>
              <p>
                We are proudly Rwandan, deeply rooted in our communities, and committed to growing alongside every family we serve.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <h2 className="text-3xl font-black mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-surface border border-outline-variant rounded-[32px] p-8 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black mb-2">{title}</h3>
                <p className="text-outline text-sm font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Branches CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <Link
            to="/branches"
            className="flex items-center justify-between gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-6 py-5 hover:bg-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-on-surface">Find your nearest branch</p>
                <p className="text-[11px] text-outline font-medium">9 locations across Kigali — view hours & directions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* Contact CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <Link
            to="/contact"
            className="flex items-center justify-between gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-6 py-5 hover:bg-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-on-surface">Have a question? Get in touch</p>
                <p className="text-[11px] text-outline font-medium">support@simba.rw · +250 788 123 456</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
