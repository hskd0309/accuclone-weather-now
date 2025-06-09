
import { useMemo, useEffect } from 'react';

export const useWeatherTheme = (weather: any) => {
  const theme = useMemo(() => {
    if (!weather) return {
      background: 'bg-gradient-to-br from-blue-50 to-blue-100',
      bodyClass: 'weather-default'
    };
    
    const condition = weather.condition || weather.description?.toLowerCase() || '';
    const temp = weather.temperature;
    
    let background = '';
    let bodyClass = '';
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      background = 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
      bodyClass = 'weather-rain';
    } else if (condition.includes('snow')) {
      background = 'bg-gradient-to-br from-blue-100 via-blue-200 to-white';
      bodyClass = 'weather-snow';
    } else if (condition.includes('cloud')) {
      background = 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400';
      bodyClass = 'weather-cloudy';
    } else if (condition.includes('clear') || condition.includes('sun')) {
      if (temp > 25) {
        background = 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400';
        bodyClass = 'weather-clear-hot';
      } else {
        background = 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500';
        bodyClass = 'weather-clear';
      }
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      background = 'bg-gradient-to-br from-purple-600 via-gray-700 to-black';
      bodyClass = 'weather-storm';
    } else if (condition.includes('mist') || condition.includes('fog')) {
      background = 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
      bodyClass = 'weather-mist';
    } else {
      // Temperature-based fallback
      if (temp < 0) {
        background = 'bg-gradient-to-br from-blue-200 to-blue-400';
        bodyClass = 'weather-cold';
      } else if (temp < 10) {
        background = 'bg-gradient-to-br from-blue-100 to-blue-300';
        bodyClass = 'weather-cool';
      } else if (temp < 20) {
        background = 'bg-gradient-to-br from-green-200 to-green-400';
        bodyClass = 'weather-mild';
      } else if (temp < 30) {
        background = 'bg-gradient-to-br from-yellow-200 to-yellow-400';
        bodyClass = 'weather-warm';
      } else {
        background = 'bg-gradient-to-br from-orange-300 to-red-400';
        bodyClass = 'weather-hot';
      }
    }
    
    return { background, bodyClass };
  }, [weather]);

  // Apply body class for global theming
  useEffect(() => {
    // Remove all weather classes
    const weatherClasses = [
      'weather-default', 'weather-rain', 'weather-snow', 'weather-cloudy',
      'weather-clear', 'weather-clear-hot', 'weather-storm', 'weather-mist',
      'weather-cold', 'weather-cool', 'weather-mild', 'weather-warm', 'weather-hot'
    ];
    
    document.body.classList.remove(...weatherClasses);
    document.body.classList.add(theme.bodyClass);
    
    return () => {
      document.body.classList.remove(...weatherClasses);
    };
  }, [theme.bodyClass]);

  return theme;
};
