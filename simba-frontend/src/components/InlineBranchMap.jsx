import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, MapPin, Navigation } from 'lucide-react';
import { useBranch } from '../context/BranchContext';
import { calculateDistance, shortName } from '../lib/utils';

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
const ClosestBranchIcon = createMarkerIcon('#dc2626');
const UserIcon = createMarkerIcon('#2563eb');
const ROUTE_SERVICE_URL = 'https://router.project-osrm.org/route/v1/driving';

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
  const {
    branches,
    setSelectedBranch,
    selectedBranch,
    isMapVisible,
    toggleMap,
    userLocation,
    closestBranch,
    locationError,
    isFetchingLocation
  } = useBranch();
  const [mapCenter, setMapCenter] = useState(() => {
    // Default to Kigali city center
    return userLocation ? userLocation : [-1.9441, 30.0619];
  });
  const [branchRoutes, setBranchRoutes] = useState({});
  const [routeStatus, setRouteStatus] = useState('idle');
  const [routeError, setRouteError] = useState('');

  const branchesWithDistance = useMemo(() => {
    if (!userLocation) return branches;

    return branches
      .map((branch) => ({
        ...branch,
        directDistance: calculateDistance(userLocation[0], userLocation[1], branch.lat, branch.lng),
        route: branchRoutes[branch.name]
      }))
      .sort((a, b) => {
        const aDistance = a.route?.distanceKm ?? a.directDistance;
        const bDistance = b.route?.distanceKm ?? b.directDistance;
        return aDistance - bDistance;
      });
  }, [branches, branchRoutes, userLocation]);

  useEffect(() => {
    if (!isMapVisible || !userLocation) return undefined;

    const controller = new AbortController();

    const fetchRoutes = async () => {
      setRouteStatus('loading');
      setRouteError('');

      const routeEntries = await Promise.allSettled(
        branches.map(async (branch) => {
          const [userLat, userLng] = userLocation;
          const url = `${ROUTE_SERVICE_URL}/${userLng},${userLat};${branch.lng},${branch.lat}?overview=full&geometries=geojson`;
          const response = await fetch(url, { signal: controller.signal });

          if (!response.ok) {
            throw new Error(`Route request failed for ${branch.name}`);
          }

          const data = await response.json();
          const route = data.routes?.[0];

          if (!route?.geometry?.coordinates?.length) {
            throw new Error(`No route returned for ${branch.name}`);
          }

          return [
            branch.name,
            {
              coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
              distanceKm: route.distance / 1000,
              durationMin: Math.round(route.duration / 60)
            }
          ];
        })
      );

      if (controller.signal.aborted) return;

      const nextRoutes = {};
      routeEntries.forEach((entry) => {
        if (entry.status === 'fulfilled') {
          const [branchName, route] = entry.value;
          nextRoutes[branchName] = route;
        }
      });

      setBranchRoutes(nextRoutes);

      if (Object.keys(nextRoutes).length === 0) {
        setRouteStatus('error');
        setRouteError('Road routes are temporarily unavailable.');
      } else if (Object.keys(nextRoutes).length < branches.length) {
        setRouteStatus('partial');
        setRouteError('Some road routes could not be loaded.');
      } else {
        setRouteStatus('ready');
      }
    };

    fetchRoutes().catch((error) => {
      if (error.name === 'AbortError') return;
      setBranchRoutes({});
      setRouteStatus('error');
      setRouteError('Road routes are temporarily unavailable.');
    });

    return () => controller.abort();
  }, [branches, isMapVisible, userLocation]);

  useEffect(() => {
    if (isMapVisible) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        if (userLocation) {
          setMapCenter(userLocation);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isMapVisible, userLocation]);

  const handleSelectBranch = (branchName) => {
    setSelectedBranch(branchName);
    toggleMap(); // Auto-close map after selection
  };

  if (!isMapVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-7xl bg-surface border border-outline-variant animate-in slide-in-from-top duration-700 overflow-hidden shadow-2xl rounded-[24px] md:rounded-[32px] flex flex-col md:flex-row h-full max-h-[90vh]">

        {/* Branch List - Modern Sidebar */}
        <div className="w-full md:w-80 flex flex-col border-r border-outline-variant bg-surface-container-lowest shrink-0 order-2 md:order-1 relative z-10 h-1/2 md:h-full">
          <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface">
            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Simba Branches</h3>
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
            {branchesWithDistance.map((branch, index) => (
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
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      selectedBranch === branch.name ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate font-black text-[11px] leading-tight ${selectedBranch === branch.name ? 'text-primary' : 'text-on-surface'}`}>
                        {shortName(branch.name)}
                      </p>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">
                        {branch.route
                          ? `${branch.route.distanceKm.toFixed(1)} km by road`
                          : branch.directDistance !== undefined
                            ? `${branch.directDistance.toFixed(1)} km nearby`
                            : 'District Branch'}
                      </p>
                    </div>
                  </div>
                  {userLocation && index === 0 ? (
                    <span className="shrink-0 rounded-full bg-error/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-error">
                      Closest
                    </span>
                  ) : selectedBranch === branch.name && (
                    <div className="w-2 h-2 shrink-0 rounded-full bg-primary shadow-glow shadow-primary" />
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

            {userLocation && branchesWithDistance.map((branch, index) => {
              const isClosest = index === 0;
              if (!branch.route) return null;

              return (
                <Polyline
                  key={`path-${branch.name}`}
                  positions={branch.route.coordinates}
                  pathOptions={{
                    color: '#dc2626',
                    weight: isClosest ? 5 : 3,
                    opacity: isClosest ? 0.9 : 0.45,
                    dashArray: isClosest ? undefined : '8 10'
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-xs font-bold">
                      {shortName(branch.name)}: {branch.route.distanceKm.toFixed(1)} km by road
                    </div>
                  </Tooltip>
                </Polyline>
              );
            })}

            {branchesWithDistance.map((branch, index) => (
              <Marker
                key={branch.name}
                position={[branch.lat, branch.lng]}
                icon={userLocation && index === 0 ? ClosestBranchIcon : BranchIcon}
                eventHandlers={{ click: () => handleSelectBranch(branch.name) }}
              >
                <Popup closeButton={false} className="custom-popup-container">
                  <div className="p-2 text-center">
                    <p className={`font-black text-[9px] uppercase tracking-[0.2em] mb-1 ${userLocation && index === 0 ? 'text-error' : 'text-primary'}`}>
                      {userLocation && index === 0 ? 'Closest Branch' : 'Simba Branch'}
                    </p>
                    <p className="font-black text-xs text-on-surface">{shortName(branch.name)}</p>
                    {branch.route && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black text-outline">
                        <Navigation className="h-3 w-3" />
                        {branch.route.distanceKm.toFixed(1)} km by road
                        {branch.route.durationMin ? `, ${branch.route.durationMin} min` : ''}
                      </div>
                    )}
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

          <div className="absolute bottom-5 left-5 right-5 z-[1000] pointer-events-none md:right-auto">
            <div className="max-w-md rounded-2xl border border-outline-variant bg-surface/90 px-4 py-3 shadow-2xl backdrop-blur-md">
              {userLocation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface">
                    <span className="h-1.5 w-8 rounded-full bg-error" />
                    Closest branch road route
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-outline">
                    <span className="h-px w-8 border-t-2 border-dashed border-error" />
                    Road routes to surrounding branches
                  </div>
                  {routeStatus === 'loading' && (
                    <p className="text-xs font-bold text-outline">Loading road routes...</p>
                  )}
                  {routeError && (
                    <p className="text-xs font-bold text-warning">{routeError}</p>
                  )}
                  {branchesWithDistance[0]?.route ? (
                    <p className="text-xs font-black text-error">
                      Nearest by road: {shortName(branchesWithDistance[0].name)} ({branchesWithDistance[0].route.distanceKm.toFixed(1)} km)
                    </p>
                  ) : closestBranch && (
                    <p className="text-xs font-black text-error">
                      Nearest nearby: {shortName(closestBranch.name)} ({closestBranch.distance.toFixed(1)} km)
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs font-bold text-outline">
                  {isFetchingLocation
                    ? 'Finding your location to draw branch paths...'
                    : locationError || 'Allow location access to show distance and paths to each branch.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineBranchMap;
