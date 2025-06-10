
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
      weatherService.saveLastLocation(weather.lat, weather.lon);
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
      weatherService.saveLastLocation(lat, lon);
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
    }}>
      {children}
    </LocationContext.Provider>
  );
};
