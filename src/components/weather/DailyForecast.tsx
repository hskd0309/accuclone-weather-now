
import React, { useState, useEffect } from 'react';
import { weatherService, DailyForecast as DailyData } from '@/services/weatherService';
import { Droplets, Sun, Wind, Sunrise, Sunset } from 'lucide-react';

interface DailyForecastProps {
  location: { lat: number; lon: number };
  city?: string;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ location, city }) => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyData | null>(null);

  useEffect(() => {
    if ((location.lat && location.lon) || city) {
      loadDailyData();
    }
  }, [location, city]);

  const loadDailyData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getDailyForecast(location.lat, location.lon, city);
      setDailyData(data);
      if (data.length > 0) {
        setSelectedDay(data[0]);
      }
    } catch (error) {
      console.error('Failed to load daily data:', error);
      setDailyData([]);
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
      <div className="text-center py-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <p className="text-gray-600">No daily forecast data available.</p>
        <p className="text-sm text-gray-500 mt-2">Try searching for a specific city or enable location services.</p>
      </div>
    );
  }

  const getDayName = (dateString: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="space-y-6">
      {/* 7-Day Overview */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="mr-2">📅</span>
          7-Day Forecast
        </h2>
        
        <div className="space-y-3">
          {dailyData.map((day, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedDay(day)}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                selectedDay?.date === day.date 
                  ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={`https:${day.icon}`}
                  alt={day.description}
                  className="w-12 h-12 animate-bounce-in"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {getDayName(day.date, index)}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{day.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">{day.chanceOfRain}%</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    <span className="text-gray-900">{Math.round(day.maxTemp)}°</span>
                    <span className="text-gray-500 ml-2 text-base">{Math.round(day.minTemp)}°</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-scale-in">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <img src={`https:${selectedDay.icon}`} alt={selectedDay.description} className="w-8 h-8 mr-3" />
            {getDayName(selectedDay.date, dailyData.findIndex(d => d.date === selectedDay.date))} Details
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
              <Sunrise className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sunrise</p>
              <p className="font-semibold">{selectedDay.sunrise}</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
              <Sunset className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sunset</p>
              <p className="font-semibold">{selectedDay.sunset}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
              <Wind className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Max Wind</p>
              <p className="font-semibold">{Math.round(selectedDay.windSpeed)} km/h</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
              <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">UV Index</p>
              <p className="font-semibold">{selectedDay.uvIndex}</p>
            </div>
          </div>
          
          {/* Moon Phase for selected day */}
          <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center">
              <span className="mr-2">🌙</span>
              Moon Phase: {selectedDay.moonPhase}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Moonrise:</span>
                <span className="font-medium ml-2">{selectedDay.moonrise}</span>
              </div>
              <div>
                <span className="text-gray-600">Moonset:</span>
                <span className="font-medium ml-2">{selectedDay.moonset}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyForecast;
