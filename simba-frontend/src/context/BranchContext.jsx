import React, { createContext, useContext, useState, useEffect } from 'react';

const BranchContext = createContext();

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

  const branches = [
    { name: "Simba Supermarket Centenary (City Centre)", lat: -1.94606, lng: 30.05990 },
    { name: "Simba Supermarket Kigali Heights", lat: -1.95521, lng: 30.09706 },
    { name: "Simba Supermarket Gishushu", lat: -1.95150, lng: 30.10310 },
    { name: "Simba Supermarket Kimironko", lat: -1.94986, lng: 30.12472 },
    { name: "Simba Supermarket Kicukiro", lat: -1.97321, lng: 30.10358 }
  ];

  const toggleMap = () => setIsMapVisible(!isMapVisible);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('simba_selected_branch', selectedBranch);
    } else {
      localStorage.removeItem('simba_selected_branch');
    }
  }, [selectedBranch]);

  const value = {
    selectedBranch,
    setSelectedBranch,
    branches,
    isMapVisible,
    setIsMapVisible,
    toggleMap
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};
