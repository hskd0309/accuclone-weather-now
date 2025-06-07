
const API_BASE_URL = 'http://localhost:3001/api';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  description: string;
  icon: string;
  city: string;
  country: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  icon: string;
  description: string;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
}

class WeatherService {
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  }

  async getHourlyForecast(lat: number, lon: number): Promise<HourlyForecast[]> {
    const response = await fetch(`${API_BASE_URL}/onecall?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch hourly forecast');
    const data = await response.json();
    return data.hourly.slice(0, 24);
  }

  async getDailyForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    const response = await fetch(`${API_BASE_URL}/onecall?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch daily forecast');
    const data = await response.json();
    return data.daily.slice(0, 7);
  }

  async searchCity(cityName: string): Promise<{lat: number, lon: number, name: string}> {
    const response = await fetch(`${API_BASE_URL}/city?city=${cityName}`);
    if (!response.ok) throw new Error('City not found');
    return response.json();
  }

  async getCurrentLocation(): Promise<{lat: number, lon: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('Failed to get location'));
        }
      );
    });
  }
}

export const weatherService = new WeatherService();
