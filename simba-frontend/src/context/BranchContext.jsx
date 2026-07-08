import React, { createContext, useContext, useState, useEffect } from 'react';
import { findClosestBranch } from '../lib/utils';
import { resolveSectorCoords, BRANCH_COORDS } from '../lib/deliveryFee';
import { getDefaultAddress } from '../lib/addresses';

const BranchContext = createContext();

const BRANCHES = [
  { name: "Simba Supermarket UTC", lat: -1.9495461, lng: 30.0599714 },
  { name: "Simba Supermarket Kigali Heights", lat: -1.9523434, lng: 30.0937551 },
  { name: "Simba Supermarket Kimironko", lat: -1.9497712, lng: 30.1262879 },
  { name: "Simba Supermarket Gishushu", lat: -1.9530302, lng: 30.1014069 },
  { name: "Simba Supermarket Kicukiro", lat: -1.9818128, lng: 30.1044453 },
  { name: "Simba Supermarket Rebero", lat: -1.9900556, lng: 30.0616547 },
  { name: "Simba Kisimenti", lat: -1.9596980, lng: 30.1069614 },
  { name: "Simba Gikondo Branch", lat: -1.9797293, lng: 30.0772419 },
  { name: "Simba Nyamirambo", lat: -1.9638560, lng: 30.0599307 },
];

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem('simba_selected_branch') || '';
  });
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [closestBranch, setClosestBranch] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const toggleMap = () => setIsMapVisible((visible) => !visible);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('simba_selected_branch', selectedBranch);
    } else {
      localStorage.removeItem('simba_selected_branch');
    }
  }, [selectedBranch]);

  /** Shared logic: resolve closest branch from a raw address string and set it */
  const resolveAndSetBranch = (rawAddress) => {
    const defaultAddr = getDefaultAddress(rawAddress);
    if (!defaultAddr) return;
    const coords = resolveSectorCoords(defaultAddr.sector, defaultAddr.district);
    if (!coords) return;
    const branchList = Object.entries(BRANCH_COORDS).map(([name, c]) => ({ name, lat: c.lat, lng: c.lng }));
    const closest = findClosestBranch(branchList, coords.lat, coords.lng);
    if (closest) {
      setClosestBranch(closest);
      setSelectedBranch(closest.name);
    }
  };

  // On app mount: if user is already logged in but no branch selected, auto-select
  useEffect(() => {
    if (selectedBranch) return;
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      if (user?.address) resolveAndSetBranch(user.address);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Auto-select the branch closest to the user's saved default address.
   * Called right after login — only runs if no branch has already been selected.
   */
  const autoSelectNearestBranch = (rawAddress) => {
    if (selectedBranch) return;
    resolveAndSetBranch(rawAddress);
  };

  // Fetch user location and find closest branch only when the map needs it.
  useEffect(() => {
    if (!isMapVisible || userLocation || isFetchingLocation) return;

    if (!navigator.geolocation) return;

    const handleLocation = () => {
      setIsFetchingLocation(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);

          // Find closest branch
          const closest = findClosestBranch(BRANCHES, userLat, userLng);
          setClosestBranch(closest);
          setIsFetchingLocation(false);
        },
        (error) => {
          setLocationError(error.message);
          setIsFetchingLocation(false);
        }
      );
    };

    handleLocation();
  }, [isMapVisible, userLocation, isFetchingLocation]);

  const value = {
    selectedBranch,
    setSelectedBranch,
    branches: BRANCHES,
    isMapVisible,
    setIsMapVisible,
    toggleMap,
    userLocation,
    closestBranch,
    locationError,
    isFetchingLocation,
    autoSelectNearestBranch,
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};