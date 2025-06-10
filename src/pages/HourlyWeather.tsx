
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import HourlyForecast from '@/components/weather/HourlyForecast';
import { weatherService } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useWeatherTheme } from '@/hooks/useWeatherTheme';
import { useLocation } from '@/contexts/LocationContext';

const HourlyWeatherPage = () => {
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
      // Try to get user's current location first
      try {
        const location = await weatherService.getCurrentLocation();
        await updateLocationByCoords(location.lat, location.lon);
        return;
      } catch (locationError) {
        console.log('Location access failed, using fallback');
      }

      // Fallback to last searched city or Chennai
      const lastCity = weatherService.getLastCity() || 'Chennai';
      await updateLocationByCity(lastCity);
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
