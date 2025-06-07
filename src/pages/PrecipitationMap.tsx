
import React, { useEffect } from 'react';
import { Map, ExternalLink, ArrowLeft, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrecipitationMap = () => {
  const openMap = () => {
    window.open('https://zoom.earth/maps/precipitation/', '_blank');
  };

  const redirectToMap = () => {
    window.location.href = 'https://zoom.earth/maps/precipitation/';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  to="/" 
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    <Map className="w-6 h-6 text-blue-500 mr-2" />
                    Precipitation Map
                  </h1>
                  <p className="text-gray-600 mt-2">Real-time precipitation radar from Zoom Earth</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center p-8 max-w-md">
              <Globe className="w-20 h-20 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Interactive Precipitation Map</h2>
              <p className="text-gray-600 mb-6">
                View real-time precipitation data and weather patterns from around the world with our interactive radar map.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={redirectToMap}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Map className="w-5 h-5 mr-2" />
                  Open Precipitation Map
                </button>
                
                <button
                  onClick={openMap}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Powered by Zoom Earth's real-time weather data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationMap;
