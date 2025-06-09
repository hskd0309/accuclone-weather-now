
import React, { useState, useEffect } from 'react';
import { weatherService, DailyForecast as DailyData } from '@/services/weatherService';

interface DailyForecastProps {
  location: { lat: number; lon: number };
}

const DailyForecast: React.FC<DailyForecastProps> = ({ location }) => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.lat && location.lon) {
      loadDailyData();
    }
  }, [location]);

  const loadDailyData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getDailyForecast(location.lat, location.lon);
      setDailyData(data);
    } catch (error) {
      console.error('Failed to load daily data:', error);
      setDailyData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading 7-day forecast...</p>
      </div>
    );
  }

  if (dailyData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No daily forecast data available.</p>
        <p className="text-sm text-gray-500 mt-2">Try searching for a specific city or enable location services.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">7-Day Forecast</h2>
      <div className="space-y-4">
        {dailyData.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
                className="w-12 h-12"
              />
              <div>
                <p className="font-semibold">
                  {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <p className="text-sm text-gray-600 capitalize">{day.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                <span className="text-lg">{Math.round(day.maxTemp)}°</span>
                <span className="text-gray-500 ml-2">{Math.round(day.minTemp)}°</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;
