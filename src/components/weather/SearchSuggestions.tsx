
import React, { useState, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (city: string) => void;
  onClose: () => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ query, onSelect, onClose }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentWeatherSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      // Simulate city suggestions (in a real app, this would be an API call)
      const popularCities = [
        'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Berlin',
        'Toronto', 'Moscow', 'Beijing', 'Los Angeles', 'Chicago', 'Miami',
        'Barcelona', 'Amsterdam', 'Rome', 'Dubai', 'Singapore', 'Hong Kong'
      ];
      
      const filtered = popularCities
        .filter(city => city.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSelect = (city: string) => {
    // Save to recent searches
    const updated = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentWeatherSearches', JSON.stringify(updated));
    
    onSelect(city);
    onClose();
  };

  const showRecent = query.length <= 2 && recentSearches.length > 0;

  if (!showRecent && suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {showRecent && (
        <div className="p-2">
          <div className="flex items-center text-xs text-gray-500 mb-2 px-2">
            <Clock className="w-3 h-3 mr-1" />
            Recent searches
          </div>
          {recentSearches.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center"
            >
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              {city}
            </button>
          ))}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="p-2">
          {showRecent && <div className="border-t border-gray-100 my-2" />}
          {suggestions.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center"
            >
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
