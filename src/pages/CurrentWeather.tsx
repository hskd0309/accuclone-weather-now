
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import CurrentWeather from '@/components/weather/CurrentWeather';
import LoadingScreen from '@/components/LoadingScreen';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from '@/contexts/AuthContext';
import UserSidebar from '@/components/UserSidebar';

const CurrentWeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentCity, setCurrentCity] = useState('Loading...');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { toast } = useToast();
  const { background } = useWeatherTheme(currentWeather);
  const { isInitialLoading, setInitialLoading } = useLoading();
  const { addCityToHistory } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const lastLocation = weatherService.getLastLocation();
      if (lastLocation) {
        setCurrentCity(lastLocation.name);
        const weather = await weatherService.getWeatherByCity(lastLocation.name);
        setCurrentWeather(weather);
        addCityToHistory(lastLocation.name);
      } else {
        // Try to get current location
        try {
          const location = await weatherService.getCurrentLocation();
          const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
          setCurrentWeather(weather);
          setCurrentCity(`${weather.city}, ${weather.country}`);
          addCityToHistory(weather.city);
        } catch (error) {
          console.error('Failed to get location:', error);
          // Fallback to a default city
          const weather = await weatherService.getWeatherByCity('London');
          setCurrentWeather(weather);
          setCurrentCity('London, UK');
          addCityToHistory('London');
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      // Set loading to false after a minimum time
      setTimeout(() => {
        setInitialLoading(false);
      }, 2000);
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      setIsLocationLoading(true);
      const weather = await weatherService.getWeatherByCity(cityName);
      setCurrentWeather(weather);
      setCurrentCity(`${weather.city}, ${weather.country}`);
      addCityToHistory(weather.city);
      toast({
        title: "Success",
        description: `Weather updated for ${cityName}`,
      });
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Error",
        description: "City not found",
        variant: "destructive",
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleLocationClick = async () => {
    try {
      setIsLocationLoading(true);
      const location = await weatherService.getCurrentLocation();
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      setCurrentWeather(weather);
      setCurrentCity(`${weather.city}, ${weather.country}`);
      addCityToHistory(weather.city);
      toast({
        title: "Success",
        description: "Location updated",
      });
    } catch (error) {
      console.error('Location access failed:', error);
      toast({
        title: "Error",
        description: "Failed to access location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  return (
    <>
      <LoadingScreen isVisible={isInitialLoading} />
      <div className={`min-h-screen ${background} transition-all duration-1000`}>
        <div className="absolute top-4 right-4 z-50">
          <UserSidebar />
        </div>
        <Header
          currentCity={isLocationLoading ? 'Updating...' : currentCity}
          onSearch={handleSearch}
          onLocationClick={handleLocationClick}
        />
        <Navigation />
        <main className="max-w-7xl mx-auto p-4">
          {currentWeather ? (
            <CurrentWeather weather={currentWeather} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-lg">Loading weather data...</div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CurrentWeatherPage;
