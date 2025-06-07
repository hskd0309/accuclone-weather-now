
import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import CurrentWeather from '@/components/weather/CurrentWeather';
import HourlyForecast from '@/components/weather/HourlyForecast';
import DailyForecast from '@/components/weather/DailyForecast';
import Favorites from '@/components/weather/Favorites';
import WeatherMap from '@/components/weather/WeatherMap';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lon: 0 });
  const [currentCity, setCurrentCity] = useState('Loading...');
  const { toast } = useToast();

  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      loadInitialWeather();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const loadInitialWeather = async () => {
    try {
      const location = await weatherService.getCurrentLocation();
      await loadWeatherData(location.lat, location.lon);
    } catch (error) {
      console.error('Failed to get location:', error);
      // Fallback to a default city (New York)
      await loadWeatherData(40.7128, -74.0060);
      setCurrentCity('New York, NY');
    }
  };

  const loadWeatherData = async (lat: number, lon: number) => {
    try {
      const weather = await weatherService.getCurrentWeather(lat, lon);
      setCurrentWeather(weather);
      setCurrentLocation({ lat, lon });
      setCurrentCity(`${weather.city}, ${weather.country}`);
    } catch (error) {
      console.error('Failed to load weather:', error);
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      const location = await weatherService.searchCity(cityName);
      await loadWeatherData(location.lat, location.lon);
      setCurrentCity(location.name);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Error",
        description: "City not found",
        variant: "destructive",
      });
    }
  };

  const handleLocationClick = async () => {
    try {
      const location = await weatherService.getCurrentLocation();
      await loadWeatherData(location.lat, location.lon);
    } catch (error) {
      console.error('Location access failed:', error);
      toast({
        title: "Error",
        description: "Failed to access location",
        variant: "destructive",
      });
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'current':
        return <CurrentWeather weather={currentWeather} location={currentLocation} />;
      case 'hourly':
        return <HourlyForecast location={currentLocation} />;
      case 'daily':
        return <DailyForecast location={currentLocation} />;
      case 'favorites':
        return <Favorites onCitySelect={handleSearch} />;
      case 'map':
        return <WeatherMap location={currentLocation} />;
      default:
        return <CurrentWeather weather={currentWeather} location={currentLocation} />;
    }
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      {!isLoading && (
        <div className="min-h-screen bg-gray-50">
          <Header
            currentCity={currentCity}
            onSearch={handleSearch}
            onLocationClick={handleLocationClick}
          />
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="max-w-7xl mx-auto p-4">
            {renderActiveTab()}
          </main>
        </div>
      )}
    </>
  );
};

export default Index;
