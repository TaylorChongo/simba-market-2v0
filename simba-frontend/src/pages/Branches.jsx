import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Clock, ArrowLeft } from 'lucide-react';

const BRANCHES = [
  {
    name: 'Simba Supermarket Union Trade Centre (UTC)',
    area: 'KN 4 Ave, Nyarugenge',
    phone: '+250 788 123 001',
    lat: -1.9495461,
    lng: 30.0599714,
  },
  {
    name: 'Simba Supermarket Kigali Heights',
    area: 'Kigali Heights, KG 541 St, Kimihurura',
    phone: '+250 788 123 002',
    lat: -1.9523434,
    lng: 30.0937551,
  },
  {
    name: 'Simba Supermarket Kimironko',
    area: 'KG 192 St, Kimironko',
    phone: '+250 788 123 004',
    lat: -1.9497712,
    lng: 30.1262879,
  },
  {
    name: 'Simba Supermarket Gishushu',
    area: 'KN 5 Rd, Gishushu',
    phone: '+250 788 123 003',
    lat: -1.9530302,
    lng: 30.1014069,
  },
  {
    name: 'Simba Supermarket Kicukiro',
    area: 'Kicukiro',
    phone: '+250 788 123 005',
    lat: -1.9818128,
    lng: 30.1044453,
  },
  {
    name: 'Simba Supermarket Rebero',
    area: 'KK 35 Ave, Rebero',
    phone: '+250 788 123 006',
    lat: -1.9900556,
    lng: 30.0616547,
  },
  {
    name: 'Simba Kisimenti',
    area: 'Kisimenti, Remera',
    phone: '+250 788 123 007',
    lat: -1.9596980,
    lng: 30.1069614,
  },
  {
    name: 'Simba Gikondo Branch',
    area: 'KK 31 Ave, Gikondo',
    phone: '+250 788 123 008',
    lat: -1.9797293,
    lng: 30.0772419,
  },
  {
    name: 'Simba Nyamirambo',
    area: 'Nyamirambo',
    phone: '+250 788 123 009',
    lat: -1.9638560,
    lng: 30.0599307,
  },
];

const HOURS = [
  { days: 'Monday – Friday', hours: '7:00 AM – 9:00 PM' },
  { days: 'Saturday', hours: '7:00 AM – 9:00 PM' },
  { days: 'Sunday', hours: '8:00 AM – 8:00 PM' },
];

const Branches = () => (
  <div className="min-h-screen bg-surface-container-lowest flex flex-col">
    <Navbar />

    <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-12 md:px-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-outline hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tight mb-3">Our Branches</h1>
        <p className="text-outline font-medium max-w-md mx-auto">
          Visit any of our locations across Kigali — we're always nearby.
        </p>
      </div>

      {/* Opening Hours Banner */}
      <div className="bg-primary/5 border border-primary/15 rounded-[32px] p-8 mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black">Opening Hours</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {HOURS.map(({ days, hours }) => (
            <div key={days} className="bg-surface border border-outline-variant rounded-2xl p-4">
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">{days}</p>
              <p className="text-base font-black text-on-surface">{hours}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {BRANCHES.map((branch) => (
          <div
            key={branch.name}
            className="bg-surface border border-outline-variant rounded-[32px] p-7 flex flex-col gap-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight">{branch.name}</h3>
                <p className="text-sm text-outline font-medium mt-0.5">{branch.area}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-on-surface">
              <Phone className="w-4 h-4 text-outline flex-shrink-0" />
              <a href={`tel:${branch.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                {branch.phone}
              </a>
            </div>

            <a
              href={`https://www.google.com/maps?q=${branch.lat},${branch.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" /> View on Google Maps
            </a>
          </div>
        ))}
      </div>
    </main>

    <Footer />
  </div>
);

export default Branches;
