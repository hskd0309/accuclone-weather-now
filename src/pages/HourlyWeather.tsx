
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
      // Try to get user's current location first
      try {
        const location = await weatherService.getCurrentLocation();
        const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
        setCurrentWeather(weather);
        setCurrentLocation({ lat: weather.lat, lon: weather.lon });
        setCurrentCity(`${weather.city}, ${weather.country}`);
        return;
      } catch (locationError) {
        console.log('Location access failed, using fallback');
      }

      // Fallback to last searched city or Chennai
      const lastCity = weatherService.getLastCity() || 'Chennai';
      const weather = await weatherService.getWeatherByCity(lastCity);
      setCurrentWeather(weather);
      setCurrentLocation({ lat: weather.lat, lon: weather.lon });
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
      setCurrentLocation({ lat: weather.lat, lon: weather.lon });
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
        <HourlyForecast 
          location={currentLocation} 
          city={currentWeather ? `${currentWeather.city}, ${currentWeather.country}` : undefined}
        />
        
        {/* Add engaging visual elements */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6 animate-scale-in glass-effect">
              <div className="text-3xl mb-2">🌅</div>
              <h3 className="font-semibold text-gray-800">Morning Hours</h3>
              <p className="text-sm text-gray-600">Perfect for planning your day</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-6 animate-scale-in animation-delay-150 glass-effect">
              <div className="text-3xl mb-2">☀️</div>
              <h3 className="font-semibold text-gray-800">Peak Hours</h3>
              <p className="text-sm text-gray-600">Highest temperature period</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6 animate-scale-in animation-delay-300 glass-effect">
              <div className="text-3xl mb-2">🌙</div>
              <h3 className="font-semibold text-gray-800">Evening Hours</h3>
              <p className="text-sm text-gray-600">Cool and comfortable weather</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HourlyWeatherPage;
