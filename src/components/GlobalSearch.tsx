
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { weatherService, CityData } from '@/services/weatherService';

interface GlobalSearchProps {
  onSearch: (cityName: string) => void;
  placeholder?: string;
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onSearch, 
  placeholder = "Search for a city...",
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setRecentSearches(weatherService.getRecentSearches());
  }, []);

  useEffect(() => {
    const searchCities = async () => {
      if (query.trim().length < 2) {
        if (query.length === 0) {
          // Show popular cities when input is empty
          const popular = await weatherService.getPopularCities();
          setSuggestions(popular);
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await weatherService.searchCities(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = async () => {
    setIsOpen(true);
    if (query.length === 0) {
      const popular = await weatherService.getPopularCities();
      setSuggestions(popular);
    }
  };

  const handleSuggestionClick = (suggestion: CityData | string) => {
    const cityName = typeof suggestion === 'string' ? suggestion : suggestion.name;
    setQuery(cityName);
    setIsOpen(false);
    
    // Call the search handler without navigation
    onSearch(cityName);
    setRecentSearches(weatherService.getRecentSearches());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Just update the location, don't navigate
      onSearch(query.trim());
      setIsOpen(false);
      setRecentSearches(weatherService.getRecentSearches());
    }
  };

  const clearQuery = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeFromRecent = (cityName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(city => city !== cityName);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50 animate-scale-in">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!isLoading && query.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Recent Searches
              </h3>
              <div className="space-y-1">
                {recentSearches.map((city, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(city)}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group"
                  >
                    <span className="text-gray-700">{city}</span>
                    <button
                      onClick={(e) => removeFromRecent(city, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {query.length === 0 ? 'Popular Cities' : 'Search Results'}
              </h3>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer group"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">
                        {suggestion.region && `${suggestion.region}, `}{suggestion.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No cities found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
