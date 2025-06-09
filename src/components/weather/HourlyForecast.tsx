
import React, { useState, useEffect } from 'react';
import { weatherService, HourlyForecast as HourlyData } from '@/services/weatherService';
import { Droplets } from 'lucide-react';

interface HourlyForecastProps {
  location: { lat: number; lon: number };
  city?: string;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ location, city }) => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((location.lat && location.lon) || city) {
      loadHourlyData();
    }
  }, [location, city]);

  const loadHourlyData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getHourlyForecast(location.lat, location.lon, city);
      setHourlyData(data);
    } catch (error) {
      console.error('Failed to load hourly data:', error);
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading hourly forecast...</p>
      </div>
    );
  }

  if (hourlyData.length === 0) {
    return (
      <div className="text-center py-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <p className="text-gray-600">No hourly forecast data available.</p>
        <p className="text-sm text-gray-500 mt-2">Try searching for a specific city or enable location services.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">🕒</span>
        24-Hour Forecast
      </h2>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {hourlyData.map((hour, index) => {
            const date = new Date(hour.time);
            const isCurrentHour = index === 0;
            
            return (
              <div 
                key={index} 
                className={`flex-shrink-0 text-center p-4 rounded-lg min-w-[120px] transition-all duration-300 hover:scale-105 ${
                  isCurrentHour 
                    ? 'bg-blue-100 border-2 border-blue-300 shadow-lg animate-pulse' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {isCurrentHour ? 'Now' : date.toLocaleTimeString('en-US', { 
                    hour: 'numeric',
                    hour12: true 
                  })}
                </p>
                
                <img
                  src={`https:${hour.icon}`}
                  alt={hour.description}
                  className="w-12 h-12 mx-auto mb-2 animate-bounce-in"
                />
                
                <p className="font-bold text-lg mb-1">{Math.round(hour.temperature)}°</p>
                <p className="text-xs text-gray-500 capitalize mb-2">{hour.description}</p>
                
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-center space-x-1 text-blue-600">
                    <Droplets className="w-3 h-3" />
                    <span>{hour.chanceOfRain}%</span>
                  </div>
                  <p className="text-gray-500">Feels {Math.round(hour.feelsLike)}°</p>
                  <p className="text-gray-500">{Math.round(hour.windSpeed)} km/h</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Hourly summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center animate-scale-in">
          <div className="text-2xl mb-2">🌡️</div>
          <h4 className="font-semibold text-gray-800">Temperature Range</h4>
          <p className="text-sm text-gray-600">
            {Math.min(...hourlyData.map(h => h.temperature))}° - {Math.max(...hourlyData.map(h => h.temperature))}°
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center animate-scale-in animation-delay-150">
          <div className="text-2xl mb-2">💧</div>
          <h4 className="font-semibold text-gray-800">Rain Chance</h4>
          <p className="text-sm text-gray-600">
            Max {Math.max(...hourlyData.map(h => h.chanceOfRain))}%
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center animate-scale-in animation-delay-300">
          <div className="text-2xl mb-2">💨</div>
          <h4 className="font-semibold text-gray-800">Wind Speed</h4>
          <p className="text-sm text-gray-600">
            Up to {Math.max(...hourlyData.map(h => h.windSpeed))} km/h
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 text-center animate-scale-in animation-delay-450">
          <div className="text-2xl mb-2">💦</div>
          <h4 className="font-semibold text-gray-800">Humidity</h4>
          <p className="text-sm text-gray-600">
            Avg {Math.round(hourlyData.reduce((sum, h) => sum + h.humidity, 0) / hourlyData.length)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
