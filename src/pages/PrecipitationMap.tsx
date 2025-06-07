
import React from 'react';
import { Map } from 'lucide-react';

const PrecipitationMap = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold flex items-center">
              <Map className="w-6 h-6 text-blue-500 mr-2" />
              Precipitation Map
            </h1>
            <p className="text-gray-600 mt-2">Real-time precipitation radar from Zoom Earth</p>
          </div>
          
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            <iframe
              src="https://zoom.earth/maps/precipitation/"
              className="w-full h-full border-0"
              title="Precipitation Map"
              allow="geolocation"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationMap;
