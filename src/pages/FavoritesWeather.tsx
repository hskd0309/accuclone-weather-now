
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Favorites from '@/components/weather/Favorites';
import { weatherService } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';
import { useLocation } from '@/contexts/LocationContext';

const FavoritesWeatherPage = () => {
  const { toast } = useToast();
  const { 
    currentWeather, 
    currentLocation, 
    currentCity, 
    isLocationLoading,
    updateLocationByCity,
    updateLocationByCoords 
  } = useLocation();
  const { background } = useWeatherTheme(currentWeather);

  useEffect(() => {
    // Initialize location if not already set
    if (!currentWeather && currentLocation.lat === 0) {
      loadInitialData();
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const lastLocation = weatherService.getLastLocation();
      if (lastLocation) {
        await updateLocationByCoords(lastLocation.lat, lastLocation.lon);
      } else {
        await updateLocationByCity('Chennai');
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      await updateLocationByCity(cityName);
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
    }
  };

  const handleLocationClick = async () => {
    try {
      const location = await weatherService.getCurrentLocation();
      await updateLocationByCoords(location.lat, location.lon);
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
          <Favorites onCitySelect={handleSearch} />
          
          {/* Add decorative elements */}
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-4 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg animate-scale-in">
                <div className="animate-pulse">⭐</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Quick Access</h3>
                  <p className="text-sm text-gray-600">Save your favorite cities for instant weather updates</p>
                </div>
                <div className="animate-pulse animation-delay-300">❤️</div>
              </div>
            </div>
            
            {/* Animated heart pattern */}
            <div className="flex justify-center space-x-6 py-4">
              <div className="text-red-400 animate-bounce">💖</div>
              <div className="text-pink-400 animate-bounce animation-delay-200">💕</div>
              <div className="text-purple-400 animate-bounce animation-delay-400">💜</div>
              <div className="text-blue-400 animate-bounce animation-delay-600">💙</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FavoritesWeatherPage;
