
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import WeatherMap from '@/components/weather/WeatherMap';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';

const PrecipitationMapPage = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentCity, setCurrentCity] = useState('Loading...');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { toast } = useToast();
  const { background } = useWeatherTheme(currentWeather);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Try to get user's current location first
      try {
        const location = await weatherService.getCurrentLocation();
        const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
        setCurrentWeather(weather);
        setCurrentCity(`${weather.city}, ${weather.country}`);
        return;
      } catch (locationError) {
        console.log('Location access failed, using fallback');
      }

      // Fallback to last searched city or Chennai
      const lastCity = weatherService.getLastCity() || 'Chennai';
      const weather = await weatherService.getWeatherByCity(lastCity);
      setCurrentWeather(weather);
      setCurrentCity(`${weather.city}, ${weather.country}`);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      setIsLocationLoading(true);
      const weather = await weatherService.getWeatherByCity(cityName);
      setCurrentWeather(weather);
      setCurrentCity(`${weather.city}, ${weather.country}`);
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
    <div className={`min-h-screen ${background} transition-all duration-1000`}>
      <Header
        currentCity={isLocationLoading ? 'Updating...' : currentCity}
        onSearch={handleSearch}
        onLocationClick={handleLocationClick}
      />
      <Navigation />
      <main className="max-w-7xl mx-auto p-4">
        <WeatherMap location={currentWeather ? { lat: currentWeather.lat, lon: currentWeather.lon } : undefined} />
      </main>
    </div>
  );
};

export default PrecipitationMapPage;
