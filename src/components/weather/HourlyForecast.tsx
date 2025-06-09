
import React, { useState, useEffect } from 'react';
import { weatherService, HourlyForecast as HourlyData } from '@/services/weatherService';

interface HourlyForecastProps {
  location: { lat: number; lon: number };
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ location }) => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.lat && location.lon) {
      loadHourlyData();
    }
  }, [location]);

  const loadHourlyData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getHourlyForecast(location.lat, location.lon);
      setHourlyData(data);
    } catch (error) {
      console.error('Failed to load hourly data:', error);
      setHourlyData([]); // Set empty array on error
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
      <div className="text-center py-8">
        <p className="text-gray-600">No hourly forecast data available.</p>
        <p className="text-sm text-gray-500 mt-2">Try searching for a specific city or enable location services.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">24-Hour Forecast</h2>
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max">
          {hourlyData.map((hour, index) => (
            <div key={index} className="flex-shrink-0 text-center p-4 border rounded-lg min-w-[100px]">
              <p className="text-sm text-gray-600 mb-2">
                {new Date(hour.time).toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  hour12: true 
                })}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                alt={hour.description}
                className="w-12 h-12 mx-auto mb-2"
              />
              <p className="font-semibold text-lg">{Math.round(hour.temperature)}°</p>
              <p className="text-xs text-gray-500 capitalize">{hour.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
