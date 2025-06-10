
import React from 'react';
import { Map, AlertTriangle } from 'lucide-react';

interface WeatherMapProps {
  location?: { lat: number; lon: number };
}

const WeatherMap: React.FC<WeatherMapProps> = ({ location }) => {
  if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Map className="w-6 h-6 text-blue-500 mr-2" />
          Precipitation Map
        </h2>
        
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Loading Location</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we determine your location...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Map className="w-6 h-6 text-blue-500 mr-2" />
        Precipitation Map
      </h2>
      
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Map Feature Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          Interactive precipitation map will be available in the next update.
        </p>
        <p className="text-sm text-gray-500">
          Current location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
        </p>
      </div>
    </div>
  );
};

export default WeatherMap;
