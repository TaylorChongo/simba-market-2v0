import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, MapPin, Navigation, Loader2, ChevronDown } from 'lucide-react';
import Button from './Button';
import { useBranch } from '../context/BranchContext';

// Custom CSS-only Marker Icons (Zero dependency on images)
const createMarkerIcon = (color) => L.divIcon({
  html: `
    <div style="position: relative;">
      <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
      <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%; position: absolute; top: 8px; left: 8px;"></div>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24]
});

const BranchIcon = createMarkerIcon('#ff6b00'); // Simba Orange
const UserIcon = createMarkerIcon('#2563eb');   // User Blue

// Helper component to change map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
      map.invalidateSize(); // Force recalculate container size
    }
  }, [center, zoom, map]);
  return null;
}

const BranchMapModal = ({ isOpen, onClose }) => {
  const { branches, setSelectedBranch, selectedBranch } = useBranch();
  const [userLocation, setUserLocation] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState([-1.9441, 30.0619]); // Kigali Default

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure container is rendered before Leaflet tries to calculate its size
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
  }, [isOpen]);

  const handleSelectBranch = (branchName) => {
    setSelectedBranch(branchName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-surface flex flex-col animate-in slide-in-from-top duration-500">
      {/* Header */}
      <header className="h-16 border-b border-outline-variant flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Select Branch</h1>
            <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Find your nearest Simba Supermarket</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 hover:bg-primary/10 text-outline hover:text-primary rounded-full flex items-center justify-center transition-all group border border-transparent hover:border-primary/20"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </header>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Map Container - Fixed Height for Visibility */}
        <div className="w-full h-[50vh] md:h-auto md:flex-grow relative bg-surface-container-low border-b md:border-b-0 border-outline-variant">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} zoom={13} />

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={UserIcon}>
                <Popup className="rounded-xl overflow-hidden">
                  <span className="font-bold text-xs p-2 block">You are here</span>
                </Popup>
              </Marker>
            )}

            {/* Branch Markers */}
            {branches.map((branch) => (
              <Marker 
                key={branch.name} 
                position={[branch.lat, branch.lng]}
                icon={BranchIcon}
                eventHandlers={{
                  click: () => setActiveMarker(branch),
                }}
              >
                <Popup closeButton={false} className="custom-popup-container">
                  <div className="p-1 min-w-[140px]">
                    <h3 className="font-black text-xs mb-2 text-primary">{branch.name.replace('Simba Supermarket ', '')}</h3>
                    <Button 
                      size="sm" 
                      className="w-full h-8 text-[10px] font-black rounded-lg"
                      onClick={() => handleSelectBranch(branch.name)}
                    >
                      CONFIRM BRANCH
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Overlay Hint */}
          <div className="absolute bottom-4 left-4 z-[500] pointer-events-none">
             <div className="bg-surface/90 backdrop-blur-md border border-outline-variant px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-wider">Live Map Active</span>
             </div>
          </div>
        </div>

        {/* Right Side: List & Branch Selector */}
        <div className="w-full md:w-96 flex flex-col bg-surface border-l border-outline-variant">
          <div className="p-6 shrink-0">
            <h2 className="text-lg font-black mb-2 flex items-center gap-2">
              Available Locations
            </h2>
            <p className="text-xs text-outline font-medium">Click on a branch to see it on the map</p>
          </div>

          <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
            {branches.map((branch) => (
              <div 
                key={branch.name}
                onClick={() => {
                  setActiveMarker(branch);
                  setMapCenter([branch.lat, branch.lng]);
                }}
                className={`group cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 ${
                  selectedBranch === branch.name
                    ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5'
                    : 'border-outline-variant hover:border-primary/40 bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedBranch === branch.name ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  {selectedBranch === branch.name && (
                    <span className="bg-primary text-on-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Current</span>
                  )}
                </div>

                <h3 className={`font-black text-sm mb-1 ${selectedBranch === branch.name ? 'text-primary' : 'text-on-surface'}`}>
                  {branch.name.replace('Simba Supermarket ', '')}
                </h3>
                <p className="text-[10px] text-outline font-medium uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <Navigation className="w-3 h-3" /> Kigali, Rwanda
                </p>

                {(activeMarker?.name === branch.name || selectedBranch === branch.name) && (
                  <Button 
                    className="w-full h-10 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBranch(branch.name);
                    }}
                  >
                    Select this branch
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-outline-variant bg-surface-container-lowest shrink-0">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest border-outline-variant hover:border-primary transition-all"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchMapModal;
