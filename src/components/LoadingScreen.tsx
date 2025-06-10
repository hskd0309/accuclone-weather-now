
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 2;
        });
      }, 40);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-blue-500 flex items-center justify-center z-50">
      <div className="text-center text-white max-w-md w-full px-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
        <h1 className="text-3xl font-bold mb-2">Weather App</h1>
        <p className="text-lg mb-6">Loading your weather...</p>
        
        {/* Animated Progress Bar */}
        <div className="w-full space-y-2">
          <Progress value={progress} className="w-full h-2 bg-blue-600/30" />
          <p className="text-sm opacity-80">{progress}% Complete</p>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-150"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
