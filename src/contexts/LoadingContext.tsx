
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoadingContextType {
  isInitialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    // Check if app has been loaded before
    return !localStorage.getItem('appLoaded');
  });

  const setInitialLoading = (loading: boolean) => {
    setIsInitialLoading(loading);
    if (!loading) {
      localStorage.setItem('appLoaded', 'true');
    }
  };

  return (
    <LoadingContext.Provider value={{ isInitialLoading, setInitialLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};
