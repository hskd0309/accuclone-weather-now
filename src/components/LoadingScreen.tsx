
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-50">
      <div className="text-center text-white max-w-md w-full px-6">
        <div className="animate-bounce mb-8">
          <div className="text-6xl mb-4">🌤️</div>
          <h1 className="text-4xl font-bold mb-2">Weather App</h1>
          <p className="text-lg opacity-90">Loading your weather...</p>
        </div>
        
        <div className="w-full">
          <Progress 
            value={progress} 
            className="h-3 bg-white/20"
          />
          <p className="text-sm mt-2 opacity-75">
            {progress < 30 ? 'Getting your location...' :
             progress < 60 ? 'Fetching weather data...' :
             progress < 90 ? 'Preparing interface...' : 'Almost ready!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
