
import React, { useState, useEffect } from 'react';
import { Map, ExternalLink, ArrowLeft, Globe, Radar, Satellite, Search, TrendingUp, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { weatherService } from '@/services/weatherService';
import { useWeatherBackground } from '@/hooks/useWeatherBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherChart from '@/components/weather/WeatherChart';
import SearchSuggestions from '@/components/weather/SearchSuggestions';

const PrecipitationMap = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 18.229, lon: 83.32 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const weatherBackground = useWeatherBackground(weather);

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    try {
      const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to load weather:', error);
      // Fallback to New York
      const fallbackWeather = await weatherService.getCurrentWeather(40.7128, -74.0060);
      setWeather(fallbackWeather);
    }
  };

  const handleSearch = async (cityName: string) => {
    try {
      const newLocation = await weatherService.searchCity(cityName);
      setLocation({ lat: newLocation.lat, lon: newLocation.lon });
      setSearchQuery('');
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const windyMapUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=4&overlay=rain&product=ecmwf&level=surface&lat=${location.lat}&lon=${location.lon}`;

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

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={() => setIsFullscreen(false)}
            className="bg-white/90 text-black hover:bg-white"
            size="sm"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
        {!iframeError ? (
          <iframe
            width="100%"
            height="100%"
            src={windyMapUrl}
            frameBorder="0"
            allowFullScreen
            onError={() => setIframeError(true)}
            title="Windy Weather Map"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <div className="text-center">
              <Globe className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Map Temporarily Unavailable</h3>
              <p className="text-gray-400 mb-4">
                The embedded map cannot be displayed due to browser restrictions.
              </p>
              <Button
                onClick={() => window.open(windyMapUrl, '_blank')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${weatherBackground} transition-all duration-1000`}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
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

            {/* Enhanced Search Bar */}
            <div className="relative max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 2);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleSearch(searchQuery);
                    }
                  }}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
              {showSuggestions && (
                <SearchSuggestions
                  query={searchQuery}
                  onSelect={handleSearch}
                  onClose={() => setShowSuggestions(false)}
                />
              )}
            </div>
          </div>
          
          <div className="p-6">
            {/* Windy.com Precipitation Map */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Radar className="w-5 h-5 text-blue-500 mr-2" />
                  Live Precipitation Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!iframeError ? (
                  <div className="relative">
                    <iframe
                      width="100%"
                      height="500"
                      src={windyMapUrl}
                      frameBorder="0"
                      allowFullScreen
                      onError={() => setIframeError(true)}
                      className="rounded-lg border border-gray-200"
                      title="Windy Weather Map"
                    />
                    <Button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Fullscreen
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <Globe className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Map Temporarily Unavailable</h3>
                    <p className="text-gray-600 mb-4">
                      The embedded map cannot be displayed due to browser restrictions.
                    </p>
                    <Button
                      onClick={() => window.open(windyMapUrl, '_blank')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Full Map
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weather Charts */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  Weather Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeatherChart location={location} />
              </CardContent>
            </Card>

            {/* Alternative Maps */}
            <div className="grid md:grid-cols-3 gap-6">
              {mapOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      <Button
                        onClick={() => window.open(option.url, '_blank')}
                        className="w-full"
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Map
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationMap;
