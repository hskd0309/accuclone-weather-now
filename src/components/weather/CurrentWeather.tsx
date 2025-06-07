
import React from 'react';
import { WeatherData } from '@/services/weatherService';
import { Wind, Droplets, Eye, Gauge, Sun, Thermometer } from 'lucide-react';

interface CurrentWeatherProps {
  weather: WeatherData | null;
  location: { lat: number; lon: number };
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weather }) => {
  if (!weather) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Weather Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{Math.round(weather.temperature)}°</h2>
            <p className="text-gray-600 capitalize">{weather.description}</p>
            <p className="text-sm text-gray-500">Feels like {Math.round(weather.feelsLike)}°</p>
          </div>
          <div className="text-right">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="w-16 h-16"
            />
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Wind className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Wind</p>
          <p className="font-semibold">{Math.round(weather.windSpeed)} mph</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Humidity</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Visibility</p>
          <p className="font-semibold">{Math.round(weather.visibility / 1000)} km</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Gauge className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Pressure</p>
          <p className="font-semibold">{weather.pressure} mb</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Sun className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">UV Index</p>
          <p className="font-semibold">{weather.uvIndex}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Thermometer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Feels Like</p>
          <p className="font-semibold">{Math.round(weather.feelsLike)}°</p>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
