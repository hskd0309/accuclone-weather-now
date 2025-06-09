
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import CurrentWeather from '@/components/weather/CurrentWeather';
import HourlyForecast from '@/components/weather/HourlyForecast';
import DailyForecast from '@/components/weather/DailyForecast';
import Favorites from '@/components/weather/Favorites';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lon: 0 });
  const [currentCity, setCurrentCity] = useState('Loading...');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { toast } = useToast();

  const activeTab = searchParams.get('tab') || 'current';
  const { background } = useWeatherTheme(currentWeather);

  useEffect(() => {
    // Show loading screen for 2 seconds, then load weather
    const timer = setTimeout(() => {
      setIsLoading(false);
      loadInitialWeather();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const loadInitialWeather = async () => {
    try {
      // Try to get user's real location first
      setIsLocationLoading(true);
      console.log('Attempting to get user location...');
      
      try {
        const location = await weatherService.getCurrentLocation();
        console.log('Got user location:', location);
        await loadWeatherByCoords(location.lat, location.lon);
        return;
      } catch (locationError) {
        console.log('Location access failed:', locationError);
      }

      // Check if we have a saved city
      const lastCity = weatherService.getLastCity();
      if (lastCity) {
        console.log('Loading last searched city:', lastCity);
        await loadWeatherByCity(lastCity);
        return;
      }

      // Check if we have a saved location
      const lastLocation = weatherService.getLastLocation();
      if (lastLocation) {
        console.log('Loading last known location:', lastLocation);
        await loadWeatherByCoords(lastLocation.lat, lastLocation.lon);
        setCurrentCity(lastLocation.name);
        return;
      }

      // Fallback to Chennai
      console.log('Falling back to Chennai');
      await loadWeatherByCity('Chennai');

    } catch (error) {
      console.error('Failed to load initial weather:', error);
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive",
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  const loadWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const weather = await weatherService.getCurrentWeather(lat, lon);
      setCurrentWeather(weather);
      setCurrentLocation({ lat, lon });
      setCurrentCity(`${weather.city}, ${weather.country}`);
      console.log('Weather loaded:', weather);
    } catch (error) {
      console.error('Failed to load weather by coordinates:', error);
      throw error;
    }
  };

  const loadWeatherByCity = async (cityName: string) => {
    try {
      const weather = await weatherService.getWeatherByCity(cityName);
      setCurrentWeather(weather);
      // Note: We don't have exact coordinates from city search, 
      // but we can use approximate ones for other API calls
      setCurrentLocation({ lat: 0, lon: 0 }); // Will be updated if user uses location
      setCurrentCity(`${weather.city}, ${weather.country}`);
      console.log('Weather loaded for city:', weather);
    } catch (error) {
      console.error('Failed to load weather by city:', error);
      throw error;
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      setIsLocationLoading(true);
      await loadWeatherByCity(cityName);
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
      await loadWeatherByCoords(location.lat, location.lon);
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
      default:
        return <CurrentWeather weather={currentWeather} location={currentLocation} />;
    }
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      {!isLoading && (
        <div className={`min-h-screen ${background} transition-all duration-1000`}>
          <Header
            currentCity={isLocationLoading ? 'Updating...' : currentCity}
            onSearch={handleSearch}
            onLocationClick={handleLocationClick}
          />
          <Navigation />
          <main className="max-w-7xl mx-auto p-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
              {renderActiveTab()}
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default Index;
