
import React, { createContext, useContext, useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/services/weatherService';

interface LocationState {
  currentWeather: WeatherData | null;
  currentLocation: { lat: number; lon: number };
  currentCity: string;
  isLocationLoading: boolean;
}

interface LocationContextType extends LocationState {
  updateLocationByCity: (cityName: string) => Promise<void>;
  updateLocationByCoords: (lat: number, lon: number) => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locationState, setLocationState] = useState<LocationState>({
    currentWeather: null,
    currentLocation: { lat: 0, lon: 0 },
    currentCity: 'Loading...',
    isLocationLoading: false,
  });

  const requestLocationPermission = async (): Promise<boolean> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return false;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      console.error('Geolocation requires HTTPS or localhost');
      return false;
    }

    // Check current permission status
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Geolocation permission status:', permission.state);
        
        if (permission.state === 'denied') {
          return false;
        }
      } catch (error) {
        console.warn('Could not query geolocation permission:', error);
      }
    }

    // Try to get location to trigger permission prompt
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          console.log('Location permission granted');
          resolve(true);
        },
        (error) => {
          console.error('Location permission denied or error:', error);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const updateLocationByCity = async (cityName: string) => {
    try {
      setLocationState(prev => ({ ...prev, isLocationLoading: true }));
      const weather = await weatherService.getWeatherByCity(cityName);
      setLocationState({
        currentWeather: weather,
        currentLocation: { lat: weather.lat, lon: weather.lon },
        currentCity: `${weather.city}, ${weather.country}`,
        isLocationLoading: false,
      });
      
      // Save the location for persistence without navigation
      weatherService.saveLastCity(cityName);
      weatherService.saveLastLocation({ 
        lat: weather.lat, 
        lon: weather.lon, 
        name: `${weather.city}, ${weather.country}` 
      });
    } catch (error) {
      console.error('Failed to update location by city:', error);
      setLocationState(prev => ({ ...prev, isLocationLoading: false }));
      throw error;
    }
  };

  const updateLocationByCoords = async (lat: number, lon: number) => {
    try {
      setLocationState(prev => ({ ...prev, isLocationLoading: true }));
      const weather = await weatherService.getCurrentWeather(lat, lon);
      setLocationState({
        currentWeather: weather,
        currentLocation: { lat, lon },
        currentCity: `${weather.city}, ${weather.country}`,
        isLocationLoading: false,
      });
      
      // Save the location for persistence without navigation
      weatherService.saveLastLocation({ 
        lat, 
        lon, 
        name: `${weather.city}, ${weather.country}` 
      });
    } catch (error) {
      console.error('Failed to update location by coords:', error);
      setLocationState(prev => ({ ...prev, isLocationLoading: false }));
      throw error;
    }
  };

  return (
    <LocationContext.Provider value={{
      ...locationState,
      updateLocationByCity,
      updateLocationByCoords,
      requestLocationPermission,
    }}>
      {children}
    </LocationContext.Provider>
  );
};
