
import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  currentCity: string;
  onSearch: (cityName: string) => void;
  onLocationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentCity, onSearch, onLocationClick }) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          {/* Logo and Current Location */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-bounce-in">
                <span className="text-white font-bold text-lg">🌤️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WeatherNow</h1>
                <p className="text-sm text-gray-600">Real-time weather updates</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{currentCity}</span>
            </div>
          </div>

          {/* Search Bar and Location Button */}
          <div className="flex items-center space-x-4 flex-1 max-w-md ml-8">
            <GlobalSearch 
              onSearch={onSearch}
              placeholder="Search for any city..."
              className="flex-1"
            />
            
            <button
              onClick={onLocationClick}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              title="Use current location"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Location</span>
            </button>
          </div>
        </div>
        
        {/* Mobile current location */}
        <div className="md:hidden mt-3 flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 w-fit">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{currentCity}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
