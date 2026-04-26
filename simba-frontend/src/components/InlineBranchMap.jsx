import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, MapPin, Navigation, ChevronUp } from 'lucide-react';
import Button from './Button';
import { useBranch } from '../context/BranchContext';

const createMarkerIcon = (color) => L.divIcon({
  html: `
    <div class="relative group">
      <div class="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2" style="border-color: ${color}">
        <div class="w-2.5 h-2.5 rounded-full animate-pulse" style="background-color: ${color}"></div>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border-b border-r rotate-45" style="border-color: ${color}"></div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const BranchIcon = createMarkerIcon('#ff6b00');
const UserIcon = createMarkerIcon('#2563eb');

// Helper component to change map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
      map.invalidateSize(); 
    }
  }, [center, zoom, map]);
  return null;
}

const InlineBranchMap = () => {
  const { branches, setSelectedBranch, selectedBranch, isMapVisible, toggleMap } = useBranch();
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-1.9441, 30.0619]);

  useEffect(() => {
    if (isMapVisible) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = [position.coords.latitude, position.coords.longitude];
            setUserLocation(loc);
            setMapCenter(loc);
          },
          () => console.error("Geolocation failed")
        );
      }
      return () => clearTimeout(timer);
    }
  }, [isMapVisible]);

  const handleSelectBranch = (branchName) => {
    setSelectedBranch(branchName);
  };

  if (!isMapVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-7xl bg-surface border border-outline-variant animate-in slide-in-from-top duration-700 overflow-hidden shadow-2xl rounded-[24px] md:rounded-[32px] flex flex-col md:flex-row h-full max-h-[90vh]">
        
        {/* Branch List - Modern Sidebar */}
        <div className="w-full md:w-80 flex flex-col border-r border-outline-variant bg-surface-container-lowest shrink-0 order-2 md:order-1 relative z-10 h-1/2 md:h-full">
          <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface">
            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">
                Simba Branches
              </h3>
              <p className="text-[10px] text-outline font-bold">KIGALI, RWANDA</p>
            </div>
            <button 
              onClick={toggleMap}
              className="group w-9 h-9 rounded-full bg-surface-container-high text-outline hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center justify-center border border-outline-variant hover:border-primary/30"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar bg-surface-container-lowest/50">
            {branches.map((branch) => (
              <button
                key={branch.name}
                onClick={() => {
                  handleSelectBranch(branch.name);
                  setMapCenter([branch.lat, branch.lng]);
                }}
                className={`w-full text-left p-4 rounded-3xl border transition-all duration-300 group ${
                  selectedBranch === branch.name
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 translate-x-1'
                    : 'border-outline-variant/50 hover:border-primary/30 bg-surface'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      selectedBranch === branch.name ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-black text-[11px] leading-tight ${selectedBranch === branch.name ? 'text-primary' : 'text-on-surface'}`}>
                        {branch.name.replace('Simba Supermarket ', '')}
                      </p>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">District Branch</p>
                    </div>
                  </div>
                  {selectedBranch === branch.name && (
                    <div className="w-2 h-2 rounded-full bg-primary shadow-glow shadow-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map - Cleaner Tiles & Modern Popups */}
        <div className="flex-grow relative order-1 md:order-2 h-1/2 md:h-full group bg-surface-container-low">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ChangeView center={mapCenter} zoom={13} />

            {userLocation && (
              <Marker position={userLocation} icon={UserIcon}>
                <Popup className="custom-popup">
                  <span className="font-black text-[10px] uppercase tracking-widest">You are here</span>
                </Popup>
              </Marker>
            )}

            {branches.map((branch) => (
              <Marker 
                key={branch.name} 
                position={[branch.lat, branch.lng]}
                icon={BranchIcon}
                eventHandlers={{ click: () => handleSelectBranch(branch.name) }}
              >
                <Popup closeButton={false} className="custom-popup-container">
                  <div className="p-2 text-center">
                    <p className="font-black text-[9px] uppercase tracking-[0.2em] text-primary mb-1">Simba Branch</p>
                    <p className="font-black text-xs text-on-surface">{branch.name.replace('Simba Supermarket ', '')}</p>
                    <div className="mt-2 pt-2 border-t border-outline-variant text-[8px] font-bold text-outline">
                      SELECTED AS PICKUP
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <div className="absolute top-6 left-6 z-[1000] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <div className="bg-surface/80 backdrop-blur-md border border-outline-variant px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">Interactive Map Mode</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineBranchMap;
