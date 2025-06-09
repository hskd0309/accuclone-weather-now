
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import HourlyForecast from '@/components/weather/HourlyForecast';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';

const HourlyWeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lon: 0 });
  const [currentCity, setCurrentCity] = useState('Loading...');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { toast } = useToast();
  const { background } = useWeatherTheme(currentWeather);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const coords = weatherService.getCurrentCoordinates();
      if (coords) {
        setCurrentLocation(coords);
        // Load current weather for theming
        const weather = await weatherService.getCurrentWeather(coords.lat, coords.lon);
        setCurrentWeather(weather);
        setCurrentCity(`${weather.city}, ${weather.country}`);
      } else {
        const lastLocation = weatherService.getLastLocation();
        if (lastLocation) {
          setCurrentLocation({ lat: lastLocation.lat, lon: lastLocation.lon });
          setCurrentCity(lastLocation.name);
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      setIsLocationLoading(true);
      const weather = await weatherService.getWeatherByCity(cityName);
      setCurrentWeather(weather);
      if (weather.lat && weather.lon) {
        setCurrentLocation({ lat: weather.lat, lon: weather.lon });
      }
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
      setCurrentLocation(location);
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
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in">
          <HourlyForecast location={currentLocation} />
          
          {/* Add engaging visual elements */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6 animate-scale-in">
                <div className="text-2xl mb-2">🌅</div>
                <h3 className="font-semibold text-gray-800">Morning</h3>
                <p className="text-sm text-gray-600">Best time for outdoor activities</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-6 animate-scale-in animation-delay-150">
                <div className="text-2xl mb-2">☀️</div>
                <h3 className="font-semibold text-gray-800">Afternoon</h3>
                <p className="text-sm text-gray-600">Peak temperature hours</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6 animate-scale-in animation-delay-300">
                <div className="text-2xl mb-2">🌙</div>
                <h3 className="font-semibold text-gray-800">Evening</h3>
                <p className="text-sm text-gray-600">Cool and comfortable</p>
              </div>
            </div>
          </div>
          
          {/* Animated loading dots */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-150"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-300"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HourlyWeatherPage;
