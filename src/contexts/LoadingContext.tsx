
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isInitialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    // Check if app has been loaded before in this session
    return !sessionStorage.getItem('appLoadedThisSession');
  });

  const setInitialLoading = (loading: boolean) => {
    setIsInitialLoading(loading);
    if (!loading) {
      sessionStorage.setItem('appLoadedThisSession', 'true');
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
