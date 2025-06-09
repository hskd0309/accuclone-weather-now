
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, Calendar, Heart, Map } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { id: 'current', label: 'Current', icon: Home, path: '/' },
    { id: 'hourly', label: 'Hourly', icon: Clock, path: '/hourly' },
    { id: 'daily', label: 'Daily', icon: Calendar, path: '/daily' },
    { id: 'favorites', label: 'Favorites', icon: Heart, path: '/favorites' },
    { id: 'map', label: 'Map', icon: Map, path: '/precipitation-map' },
  ];

  const getActiveTab = () => {
    const pathMap = {
      '/': 'current',
      '/hourly': 'hourly',
      '/daily': 'daily',
      '/favorites': 'favorites',
      '/precipitation-map': 'map'
    };
    return pathMap[currentPath as keyof typeof pathMap] || 'current';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 whitespace-nowrap transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
