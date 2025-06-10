import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import CurrentWeather from '@/components/weather/CurrentWeather';
import WeatherChart from '@/components/weather/WeatherChart';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';

const CurrentWeatherPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(() => {
    // Check if loading screen has been shown in this session
    return !sessionStorage.getItem('weatherAppLoaded');
  });
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lon: 0 });
  const [currentCity, setCurrentCity] = useState('Loading...');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { toast } = useToast();
  const { background } = useWeatherTheme(currentWeather);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Mark that loading screen has been shown
        sessionStorage.setItem('weatherAppLoaded', 'true');
        loadInitialWeather();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // If not showing loading screen, load weather immediately
      loadInitialWeather();
    }
  }, []);

  const loadInitialWeather = async () => {
    try {
      setIsLocationLoading(true);
      
      try {
        const location = await weatherService.getCurrentLocation();
        await loadWeatherByCoords(location.lat, location.lon);
        return;
      } catch (locationError) {
        console.log('Location access failed:', locationError);
      }

      const lastCity = weatherService.getLastCity();
      if (lastCity) {
        await loadWeatherByCity(lastCity);
        return;
      }

      const lastLocation = weatherService.getLastLocation();
      if (lastLocation) {
        await loadWeatherByCoords(lastLocation.lat, lastLocation.lon);
        setCurrentCity(lastLocation.name);
        return;
      }

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
    } catch (error) {
      console.error('Failed to load weather by coordinates:', error);
      throw error;
    }
  };

  const loadWeatherByCity = async (cityName: string) => {
    try {
      const weather = await weatherService.getWeatherByCity(cityName);
      setCurrentWeather(weather);
      if (weather.lat && weather.lon) {
        setCurrentLocation({ lat: weather.lat, lon: weather.lon });
      }
      setCurrentCity(`${weather.city}, ${weather.country}`);
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
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in">
              <CurrentWeather weather={currentWeather} location={currentLocation} />
              
              {/* Add some visual elements */}
              <div className="mt-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 animate-scale-in">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Weather Trends</h3>
                    {currentLocation.lat !== 0 && <WeatherChart location={currentLocation} />}
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 animate-scale-in">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Weather Tips</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      {currentWeather && (
                        <>
                          {currentWeather.temperature > 30 && (
                            <p className="flex items-center"><span className="mr-2">☀️</span> It's hot! Stay hydrated and wear sunscreen.</p>
                          )}
                          {currentWeather.temperature < 10 && (
                            <p className="flex items-center"><span className="mr-2">🧥</span> Bundle up! It's quite cold today.</p>
                          )}
                          {currentWeather.humidity > 80 && (
                            <p className="flex items-center"><span className="mr-2">💧</span> High humidity today - you might feel muggy.</p>
                          )}
                          {currentWeather.windSpeed > 20 && (
                            <p className="flex items-center"><span className="mr-2">💨</span> Windy conditions - secure loose items.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Animated weather pattern */}
                <div className="text-center py-8">
                  <div className="inline-flex space-x-4 animate-bounce">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-150"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animation-delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default CurrentWeatherPage;
