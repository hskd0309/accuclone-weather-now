
import React, { useState, useEffect } from 'react';
import { Map, ExternalLink, ArrowLeft, Globe, Radar, Satellite } from 'lucide-react';
import { Link } from 'react-router-dom';
import { weatherService } from '@/services/weatherService';

const PrecipitationMap = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 0, lon: 0 });

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      const currentLocation = await weatherService.getCurrentLocation();
      setLocation(currentLocation);
      const weatherData = await weatherService.getCurrentWeather(currentLocation.lat, currentLocation.lon);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to load weather:', error);
      // Fallback to New York
      setLocation({ lat: 40.7128, lon: -74.0060 });
      const fallbackWeather = await weatherService.getCurrentWeather(40.7128, -74.0060);
      setWeather(fallbackWeather);
    }
  };

  const getWeatherBackground = () => {
    if (!weather) return 'bg-gradient-to-br from-blue-50 to-blue-100';
    
    const temp = weather.temperature;
    const description = weather.description.toLowerCase();
    
    if (description.includes('rain') || description.includes('drizzle')) {
      return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    } else if (description.includes('snow')) {
      return 'bg-gradient-to-br from-blue-100 via-blue-200 to-white';
    } else if (description.includes('cloud')) {
      return 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400';
    } else if (description.includes('clear') || description.includes('sun')) {
      if (temp > 25) {
        return 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400';
      } else {
        return 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500';
      }
    } else if (description.includes('thunder') || description.includes('storm')) {
      return 'bg-gradient-to-br from-purple-600 via-gray-700 to-black';
    } else if (description.includes('mist') || description.includes('fog')) {
      return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
    }
    
    // Temperature-based fallback
    if (temp < 0) {
      return 'bg-gradient-to-br from-blue-200 to-blue-400';
    } else if (temp < 10) {
      return 'bg-gradient-to-br from-blue-100 to-blue-300';
    } else if (temp < 20) {
      return 'bg-gradient-to-br from-green-200 to-green-400';
    } else if (temp < 30) {
      return 'bg-gradient-to-br from-yellow-200 to-yellow-400';
    } else {
      return 'bg-gradient-to-br from-orange-300 to-red-400';
    }
  };

  const mapOptions = [
    {
      title: "Zoom Earth - Precipitation",
      description: "Real-time precipitation radar",
      url: "https://zoom.earth/maps/precipitation/",
      icon: Radar
    },
    {
      title: "Zoom Earth - Satellite",
      description: "Live satellite imagery",
      url: "https://zoom.earth/maps/satellite/",
      icon: Satellite
    },
    {
      title: "Zoom Earth - Wind",
      description: "Wind patterns and speed",
      url: "https://zoom.earth/maps/wind/",
      icon: Map
    }
  ];

  return (
    <div className={`min-h-screen ${getWeatherBackground()} p-4 transition-all duration-1000`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  to="/" 
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    <Map className="w-6 h-6 text-blue-500 mr-2" />
                    Weather Maps
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {weather ? `${weather.city}, ${weather.country} - ${Math.round(weather.temperature)}°C` : 'Loading location...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <Globe className="w-20 h-20 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Interactive Weather Maps</h2>
              <p className="text-gray-600 mb-6">
                Access real-time weather data, precipitation radar, and satellite imagery from around the world.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mapOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <Icon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-center mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-center mb-4">{option.description}</p>
                    <button
                      onClick={() => window.open(option.url, '_blank')}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Map
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Why External Maps?</h3>
              <p className="text-gray-700 leading-relaxed">
                Due to cross-origin security policies, weather maps cannot be embedded directly. 
                These external links provide the most accurate and up-to-date weather visualization 
                tools available, including real-time radar, satellite imagery, and wind patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationMap;
