
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import DailyForecast from '@/components/weather/DailyForecast';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';

const DailyWeatherPage = () => {
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
          <DailyForecast location={currentLocation} />
          
          {/* Weekly summary with animations */}
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 text-center animate-scale-in">
                <div className="text-xl mb-1">🗓️</div>
                <h4 className="font-semibold text-gray-800">7 Days</h4>
                <p className="text-xs text-gray-600">Extended forecast</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 text-center animate-scale-in animation-delay-150">
                <div className="text-xl mb-1">📈</div>
                <h4 className="font-semibold text-gray-800">Trends</h4>
                <p className="text-xs text-gray-600">Temperature patterns</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 text-center animate-scale-in animation-delay-300">
                <div className="text-xl mb-1">🌤️</div>
                <h4 className="font-semibold text-gray-800">Conditions</h4>
                <p className="text-xs text-gray-600">Weather changes</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 text-center animate-scale-in animation-delay-450">
                <div className="text-xl mb-1">📊</div>
                <h4 className="font-semibold text-gray-800">Analysis</h4>
                <p className="text-xs text-gray-600">Weekly insights</p>
              </div>
            </div>
            
            {/* Moving weather icons */}
            <div className="flex justify-center space-x-8 py-4">
              <div className="animate-bounce">☀️</div>
              <div className="animate-bounce animation-delay-300">⛅</div>
              <div className="animate-bounce animation-delay-600">🌧️</div>
              <div className="animate-bounce animation-delay-900">❄️</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyWeatherPage;
