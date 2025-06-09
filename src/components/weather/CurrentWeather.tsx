
import React, { useState, useEffect } from 'react';
import { WeatherData, AstronomyData, weatherService } from '@/services/weatherService';
import { Wind, Droplets, Eye, Gauge, Sun, Thermometer, Sunrise, Sunset, Moon } from 'lucide-react';

interface CurrentWeatherProps {
  weather: WeatherData | null;
  location: { lat: number; lon: number };
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weather, location }) => {
  const [astronomy, setAstronomy] = useState<AstronomyData | null>(null);

  useEffect(() => {
    if (location.lat && location.lon) {
      loadAstronomyData();
    }
  }, [location]);

  const loadAstronomyData = async () => {
    try {
      const data = await weatherService.getAstronomyData(location.lat, location.lon);
      setAstronomy(data);
    } catch (error) {
      console.error('Failed to load astronomy data:', error);
    }
  };

  const getAQIColor = (index: number) => {
    if (index <= 50) return 'text-green-600 bg-green-100';
    if (index <= 100) return 'text-yellow-600 bg-yellow-100';
    if (index <= 150) return 'text-orange-600 bg-orange-100';
    if (index <= 200) return 'text-red-600 bg-red-100';
    if (index <= 300) return 'text-purple-600 bg-purple-100';
    return 'text-red-800 bg-red-200';
  };

  const getAQILabel = (index: number) => {
    if (index <= 50) return 'Good';
    if (index <= 100) return 'Moderate';
    if (index <= 150) return 'Unhealthy for Sensitive';
    if (index <= 200) return 'Unhealthy';
    if (index <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

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
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</h2>
            <p className="text-gray-600 capitalize text-lg">{weather.description}</p>
            <p className="text-sm text-gray-500">Feels like {Math.round(weather.feelsLike)}°C</p>
            <p className="text-sm text-gray-500">{weather.city}, {weather.region}, {weather.country}</p>
          </div>
          <div className="text-right">
            <img
              src={`https:${weather.icon}`}
              alt={weather.description}
              className="w-20 h-20 animate-bounce-in"
            />
            <p className="text-xs text-gray-500 mt-1">{new Date(weather.localtime).toLocaleString()}</p>
          </div>
        </div>

        {/* Air Quality Index */}
        {weather.aqi && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Air Quality Index</h3>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAQIColor(weather.aqi.us_epa_index)}`}>
                {weather.aqi.us_epa_index} - {getAQILabel(weather.aqi.us_epa_index)}
              </div>
              <div className="text-xs text-gray-500">
                PM2.5: {weather.aqi.pm2_5.toFixed(1)} μg/m³
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in">
          <Wind className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Wind</p>
          <p className="font-semibold">{Math.round(weather.windSpeed)} km/h</p>
          <p className="text-xs text-gray-500">{weather.windDir}</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-150">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Humidity</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-200">
          <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Visibility</p>
          <p className="font-semibold">{weather.visibility} km</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-300">
          <Gauge className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Pressure</p>
          <p className="font-semibold">{weather.pressure} mb</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-450">
          <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">UV Index</p>
          <p className="font-semibold">{weather.uvIndex}</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-600">
          <Thermometer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Dew Point</p>
          <p className="font-semibold">{Math.round(weather.dewPoint)}°C</p>
        </div>

        {/* Astronomy Data */}
        {astronomy && (
          <>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-750">
              <Sunrise className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sunrise</p>
              <p className="font-semibold">{astronomy.sunrise}</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 text-center hover-lift animate-scale-in animation-delay-900">
              <Sunset className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sunset</p>
              <p className="font-semibold">{astronomy.sunset}</p>
            </div>
          </>
        )}
      </div>

      {/* Moon Phase Card */}
      {astronomy && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Moon className="w-5 h-5 mr-2 text-indigo-500" />
            Moon Phase
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Phase</p>
              <p className="font-semibold capitalize">{astronomy.moonPhase}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Illumination</p>
              <p className="font-semibold">{astronomy.moonIllumination}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Moonrise</p>
              <p className="font-semibold">{astronomy.moonrise}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Moonset</p>
              <p className="font-semibold">{astronomy.moonset}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentWeather;
