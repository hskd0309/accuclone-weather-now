
import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Plus, MapPin, Thermometer, Eye, Wind } from 'lucide-react';
import { weatherService, WeatherData } from '@/services/weatherService';

interface FavoritesProps {
  onCitySelect: (cityName: string) => void;
}

interface FavoriteCity {
  id: string;
  name: string;
  addedAt: string;
  weather?: WeatherData;
}

const Favorites: React.FC<FavoritesProps> = ({ onCitySelect }) => {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [newCity, setNewCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const stored = localStorage.getItem('weatherFavorites');
    if (stored) {
      const favoriteCities = JSON.parse(stored);
      setFavorites(favoriteCities);
      
      // Load weather data for each favorite city
      loadWeatherForFavorites(favoriteCities);
    }
  };

  const loadWeatherForFavorites = async (favoriteCities: FavoriteCity[]) => {
    const updatedFavorites = await Promise.all(
      favoriteCities.map(async (city) => {
        try {
          const weather = await weatherService.getWeatherByCity(city.name);
          return { ...city, weather };
        } catch (error) {
          console.error(`Failed to load weather for ${city.name}:`, error);
          return city;
        }
      })
    );
    setFavorites(updatedFavorites);
  };

  const saveFavorites = (newFavorites: FavoriteCity[]) => {
    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addFavorite = async () => {
    if (!newCity.trim()) return;
    
    setIsLoading(true);
    try {
      // Verify the city exists by fetching its weather
      const weather = await weatherService.getWeatherByCity(newCity.trim());
      
      const newFavorite: FavoriteCity = {
        id: Date.now().toString(),
        name: `${weather.city}, ${weather.country}`,
        addedAt: new Date().toISOString(),
        weather: weather,
      };

      const updated = [...favorites, newFavorite];
      saveFavorites(updated);
      setNewCity('');
    } catch (error) {
      console.error('Failed to add favorite city:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(fav => fav.id !== id);
    saveFavorites(updated);
  };

  const refreshWeather = async (cityId: string) => {
    const city = favorites.find(f => f.id === cityId);
    if (!city) return;

    try {
      const weather = await weatherService.getWeatherByCity(city.name);
      const updated = favorites.map(fav => 
        fav.id === cityId ? { ...fav, weather } : fav
      );
      setFavorites(updated);
    } catch (error) {
      console.error(`Failed to refresh weather for ${city.name}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center animate-fade-in">
          <Heart className="w-8 h-8 text-red-500 mr-3 animate-pulse" />
          Favorite Cities
          <Heart className="w-8 h-8 text-red-500 ml-3 animate-pulse animation-delay-300" />
        </h2>
        <p className="text-muted-foreground">Keep track of weather in your favorite places</p>
      </div>

      {/* Add New City */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 animate-scale-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Add New Favorite
        </h3>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Enter city name (e.g., New York, London, Tokyo)..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && addFavorite()}
            disabled={isLoading}
          />
          <button
            onClick={addFavorite}
            disabled={isLoading || !newCity.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="mb-6">
            <Heart size={64} className="mx-auto text-gray-300 animate-bounce" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorite cities yet</h3>
          <p className="text-gray-500 mb-6">Add cities above to quickly access their weather</p>
          <div className="flex justify-center space-x-4 text-2xl animate-pulse">
            <span>🌍</span>
            <span>🌤️</span>
            <span>⭐</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((city, index) => (
            <div 
              key={city.id} 
              className="bg-white/90 backdrop-blur-sm border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in glass-effect"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <button
                    onClick={() => onCitySelect(city.name)}
                    className="text-left w-full group"
                  >
                    <h3 className="font-bold text-lg hover:text-blue-600 transition-colors flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Added {new Date(city.addedAt).toLocaleDateString()}
                    </p>
                  </button>
                </div>
                <button
                  onClick={() => removeFavorite(city.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                  title="Remove from favorites"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Weather Info */}
              {city.weather ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={city.weather.icon} 
                        alt={city.weather.description}
                        className="w-12 h-12 mr-3"
                      />
                      <div>
                        <div className="text-2xl font-bold text-gray-800">
                          {Math.round(city.weather.temperature)}°C
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {city.weather.description}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => refreshWeather(city.id)}
                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-all"
                      title="Refresh weather"
                    >
                      🔄
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
                      <span>Feels {Math.round(city.weather.feelsLike)}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{city.weather.humidity}% humidity</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{city.weather.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 text-yellow-500">🌡️</span>
                      <span>{city.weather.pressure} mb</span>
                    </div>
                  </div>

                  {/* Air Quality */}
                  {city.weather.aqi && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Air Quality Index</div>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className={`h-2 rounded-full ${
                            city.weather.aqi.us_epa_index <= 2 ? 'bg-green-400' :
                            city.weather.aqi.us_epa_index <= 4 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium">
                          {city.weather.aqi.us_epa_index <= 2 ? 'Good' :
                           city.weather.aqi.us_epa_index <= 4 ? 'Moderate' : 'Unhealthy'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-500">Loading weather...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      {favorites.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg animate-fade-in">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Pro Tips
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click on any city name to view detailed weather information</li>
            <li>• Use the refresh button to get the latest weather updates</li>
            <li>• Weather data is automatically refreshed when you visit this page</li>
            <li>• Your favorite cities are saved locally and persist between sessions</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Favorites;
