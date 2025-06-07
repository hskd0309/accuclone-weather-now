
import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-blue-500 flex items-center justify-center z-50">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-3xl font-bold mb-2">Weather App</h1>
        <p className="text-lg">Loading your weather...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
