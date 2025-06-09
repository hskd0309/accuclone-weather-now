
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
  condition: string;
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
  private readonly LAST_CITY_KEY = 'lastSearchedCity';
  private readonly LAST_LOCATION_KEY = 'lastKnownLocation';

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    
    // Save location for future use
    this.saveLastLocation({ lat, lon, name: `${data.city}, ${data.country}` });
    return data;
  }

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(cityName)}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    
    // Save city for future use
    this.saveLastCity(cityName);
    return data;
  }

  async getHourlyForecast(lat: number, lon: number): Promise<HourlyForecast[]> {
    const response = await fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch hourly forecast');
    const data = await response.json();
    return data.hourly || [];
  }

  async getDailyForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    const response = await fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch daily forecast');
    const data = await response.json();
    return data.daily || [];
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // LocalStorage methods
  saveLastCity(cityName: string): void {
    localStorage.setItem(this.LAST_CITY_KEY, cityName);
  }

  getLastCity(): string | null {
    return localStorage.getItem(this.LAST_CITY_KEY);
  }

  saveLastLocation(location: {lat: number, lon: number, name: string}): void {
    localStorage.setItem(this.LAST_LOCATION_KEY, JSON.stringify(location));
  }

  getLastLocation(): {lat: number, lon: number, name: string} | null {
    const stored = localStorage.getItem(this.LAST_LOCATION_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  clearStorage(): void {
    localStorage.removeItem(this.LAST_CITY_KEY);
    localStorage.removeItem(this.LAST_LOCATION_KEY);
  }
}

export const weatherService = new WeatherService();
