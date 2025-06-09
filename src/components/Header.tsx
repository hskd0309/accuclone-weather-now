
import React from 'react';
import { MapPin } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  currentCity: string;
  onSearch: (city: string) => void;
  onLocationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentCity, onSearch, onLocationClick }) => {
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
        
        <div className="w-80">
          <GlobalSearch 
            onSearch={onSearch}
            onLocationClick={onLocationClick}
            placeholder="Search city..."
            className="text-gray-900"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
