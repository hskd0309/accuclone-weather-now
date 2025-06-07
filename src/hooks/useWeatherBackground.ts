
import { useMemo } from 'react';

export const useWeatherBackground = (weather: any) => {
  return useMemo(() => {
    if (!weather) return 'bg-gradient-to-br from-blue-50 to-blue-100';
    
    const temp = weather.temperature;
    const description = weather.description.toLowerCase();
    
    if (description.includes('rain') || description.includes('drizzle')) {
      return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    } else if (description.includes('snow')) {
      return 'bg-gradient-to-br from-blue-100 via-blue-200 to-white';
    } else if (description.includes('cloud')) {
      return 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400';
    } else if (description.includes('clear') || description.includes('sun')) {
      if (temp > 25) {
        return 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400';
      } else {
        return 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500';
      }
    } else if (description.includes('thunder') || description.includes('storm')) {
      return 'bg-gradient-to-br from-purple-600 via-gray-700 to-black';
    } else if (description.includes('mist') || description.includes('fog')) {
      return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
    }
    
    // Temperature-based fallback
    if (temp < 0) {
      return 'bg-gradient-to-br from-blue-200 to-blue-400';
    } else if (temp < 10) {
      return 'bg-gradient-to-br from-blue-100 to-blue-300';
    } else if (temp < 20) {
      return 'bg-gradient-to-br from-green-200 to-green-400';
    } else if (temp < 30) {
      return 'bg-gradient-to-br from-yellow-200 to-yellow-400';
    } else {
      return 'bg-gradient-to-br from-orange-300 to-red-400';
    }
  }, [weather]);
};
