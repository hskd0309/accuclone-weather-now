
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface HeaderProps {
  currentCity: string;
  onSearch: (city: string) => void;
  onLocationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentCity, onSearch, onLocationClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Weather</h1>
          <div className="flex items-center space-x-2 text-blue-100">
            <MapPin size={16} />
            <span>{currentCity}</span>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              className="bg-white text-gray-900 px-4 py-2 rounded-lg pl-10 w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button
            type="button"
            onClick={onLocationClick}
            className="bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded-lg"
            title="Use current location"
          >
            <MapPin size={16} />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
