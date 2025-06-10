
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Favorites from '@/components/weather/Favorites';
import LoadingScreen from '@/components/LoadingScreen';
import UserSidebar from '@/components/UserSidebar';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from '@/contexts/AuthContext';

const FavoritesWeatherPage = () => {
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

  const handleFavoriteSelect = async (cityName: string) => {
    await handleSearch(cityName);
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in">
            <Favorites onCitySelect={handleFavoriteSelect} />
            
            {/* Show current weather info if available */}
            {currentWeather && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg animate-fade-in">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  🌤️ Current Weather in {currentCity}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(currentWeather.temperature)}°C
                    </div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {currentWeather.humidity}%
                    </div>
                    <div className="text-sm text-gray-600">Humidity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {currentWeather.windSpeed} km/h
                    </div>
                    <div className="text-sm text-gray-600">Wind Speed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 capitalize">
                      {currentWeather.description}
                    </div>
                    <div className="text-sm text-gray-600">Condition</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Animated heart pattern */}
            <div className="flex justify-center space-x-6 py-4">
              <div className="text-red-400 animate-bounce">💖</div>
              <div className="text-pink-400 animate-bounce animation-delay-200">💕</div>
              <div className="text-purple-400 animate-bounce animation-delay-400">💜</div>
              <div className="text-blue-400 animate-bounce animation-delay-600">💙</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FavoritesWeatherPage;
