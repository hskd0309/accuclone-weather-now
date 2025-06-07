
import React, { useState } from 'react';
import { Map, ExternalLink, AlertTriangle } from 'lucide-react';

const PrecipitationMap = () => {
  const [hasError, setHasError] = useState(false);

  const handleIframeError = () => {
    setHasError(true);
  };

  const openInNewTab = () => {
    window.open('https://zoom.earth/maps/precipitation/', '_blank');
  };

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
            <button
              onClick={openInNewTab}
              className="mt-3 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </button>
          </div>
          
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            {hasError ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center p-8">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Unable to Load Map</h3>
                  <p className="text-gray-600 mb-4">
                    The precipitation map couldn't be loaded directly. Please use the button above to open it in a new tab.
                  </p>
                  <button
                    onClick={openInNewTab}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Zoom Earth Map
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                src="https://zoom.earth/maps/precipitation/"
                className="w-full h-full border-0"
                title="Precipitation Map"
                allow="geolocation"
                onError={handleIframeError}
                onLoad={(e) => {
                  // Check if iframe loaded successfully
                  try {
                    const iframe = e.target as HTMLIFrameElement;
                    if (!iframe.contentWindow) {
                      setHasError(true);
                    }
                  } catch (error) {
                    setHasError(true);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationMap;
