
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Clock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { weatherService, CityData } from '@/services/weatherService';

interface GlobalSearchProps {
  onSearch: (city: string) => void;
  onLocationClick: () => void;
  placeholder?: string;
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onSearch, 
  onLocationClick, 
  placeholder = "Search city...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [worldCities, setWorldCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches and world cities
    const stored = localStorage.getItem('recentWeatherSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
    
    loadWorldCities();
  }, []);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadWorldCities = async () => {
    try {
      const cities = await weatherService.getWorldCities();
      setWorldCities(cities);
    } catch (error) {
      console.error('Failed to load world cities:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = worldCities
        .filter(city => 
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, worldCities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSuggestionSelect(searchQuery.trim());
    }
  };

  const handleSuggestionSelect = (city: string) => {
    setLoading(true);
    
    // Save to recent searches
    const updated = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentWeatherSearches', JSON.stringify(updated));
    
    onSearch(city);
    setSearchQuery('');
    setShowSuggestions(false);
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const showRecent = searchQuery.length === 0 && recentSearches.length > 0;
  const showWorldCities = searchQuery.length === 0 && worldCities.length > 0;

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-white/90 backdrop-blur-sm"
            disabled={loading}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={onLocationClick}
          variant="outline"
          size="sm"
          title="Use current location"
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm"
          disabled={loading}
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </form>
      
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto animate-fade-in">
          {showRecent && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center text-xs text-gray-500 mb-2 px-1">
                <Clock className="w-3 h-3 mr-1" />
                Recent searches
              </div>
              {recentSearches.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(city)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center transition-colors"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{city}</span>
                </button>
              ))}
            </div>
          )}
          
          {suggestions.length > 0 ? (
            <div className="p-3">
              <div className="flex items-center text-xs text-gray-500 mb-2 px-1">
                <Globe className="w-3 h-3 mr-1" />
                Search results
              </div>
              {suggestions.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(`${city.name}, ${city.country}`)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{city.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{city.country}</span>
                </button>
              ))}
            </div>
          ) : showWorldCities && (
            <div className="p-3">
              <div className="flex items-center text-xs text-gray-500 mb-2 px-1">
                <Globe className="w-3 h-3 mr-1" />
                Popular cities
              </div>
              {worldCities.slice(0, 10).map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(`${city.name}, ${city.country}`)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{city.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{city.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
