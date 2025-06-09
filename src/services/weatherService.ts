
const API_BASE_URL = 'http://localhost:3001/api';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windDir: string;
  uvIndex: number;
  visibility: number;
  pressure: number;
  dewPoint: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  region: string;
  condition: string;
  lat: number;
  lon: number;
  localtime: string;
  aqi?: {
    co: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    us_epa_index: number;
    gb_defra_index: number;
  };
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
  chanceOfRain: number;
  feelsLike: number;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
  chanceOfRain: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  uvIndex: number;
}

export interface CityData {
  name: string;
  country: string;
  region?: string;
  lat: number;
  lon: number;
  url?: string;
}

export interface AstronomyData {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  moonIllumination: string;
}

class WeatherService {
  private readonly LAST_CITY_KEY = 'lastSearchedCity';
  private readonly LAST_LOCATION_KEY = 'lastKnownLocation';
  private readonly RECENT_SEARCHES_KEY = 'recentSearches';
  private currentCoordinates: { lat: number; lon: number } | null = null;

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    
    this.currentCoordinates = { lat, lon };
    
    // Save location for future use
    this.saveLastLocation({ lat, lon, name: `${data.city}, ${data.country}` });
    return data;
  }

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(cityName)}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    
    this.currentCoordinates = { lat: data.lat, lon: data.lon };
    
    // Save city for future use
    this.saveLastCity(cityName);
    this.addToRecentSearches(cityName);
    return data;
  }

  async getHourlyForecast(lat?: number, lon?: number, city?: string): Promise<HourlyForecast[]> {
    let url = `${API_BASE_URL}/forecast`;
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
    } else if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    } else if (this.currentCoordinates) {
      url += `?lat=${this.currentCoordinates.lat}&lon=${this.currentCoordinates.lon}`;
    } else {
      throw new Error('No location specified');
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch hourly forecast');
    const data = await response.json();
    return data.hourly || [];
  }

  async getDailyForecast(lat?: number, lon?: number, city?: string): Promise<DailyForecast[]> {
    let url = `${API_BASE_URL}/forecast`;
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
    } else if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    } else if (this.currentCoordinates) {
      url += `?lat=${this.currentCoordinates.lat}&lon=${this.currentCoordinates.lon}`;
    } else {
      throw new Error('No location specified');
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch daily forecast');
    const data = await response.json();
    return data.daily || [];
  }

  async searchCities(query: string): Promise<CityData[]> {
    if (query.trim().length < 2) return [];
    
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data;
  }

  async getAstronomyData(lat?: number, lon?: number, city?: string): Promise<AstronomyData> {
    let url = `${API_BASE_URL}/astronomy`;
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
    } else if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    } else if (this.currentCoordinates) {
      url += `?lat=${this.currentCoordinates.lat}&lon=${this.currentCoordinates.lon}`;
    } else {
      throw new Error('No location specified');
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch astronomy data');
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
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          this.currentCoordinates = coords;
          resolve(coords);
        },
        (error) => {
          reject(new Error('Failed to get location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  getCurrentCoordinates(): { lat: number; lon: number } | null {
    return this.currentCoordinates;
  }

  // Popular world cities for initial suggestions
  async getPopularCities(): Promise<CityData[]> {
    return [
      { name: 'New York', country: 'United States', region: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', country: 'United Kingdom', region: 'England', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', country: 'Japan', region: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', country: 'France', region: 'Ile-de-France', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', country: 'Australia', region: 'New South Wales', lat: -33.8688, lon: 151.2093 },
      { name: 'Mumbai', country: 'India', region: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
      { name: 'Dubai', country: 'United Arab Emirates', region: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'Singapore', country: 'Singapore', region: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Chennai', country: 'India', region: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
      { name: 'Los Angeles', country: 'United States', region: 'California', lat: 34.0522, lon: -118.2437 }
    ];
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

  addToRecentSearches(cityName: string): void {
    const recent = this.getRecentSearches();
    const updated = [cityName, ...recent.filter(city => city !== cityName)].slice(0, 5);
    localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }

  getRecentSearches(): string[] {
    const stored = localStorage.getItem(this.RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  clearStorage(): void {
    localStorage.removeItem(this.LAST_CITY_KEY);
    localStorage.removeItem(this.LAST_LOCATION_KEY);
    localStorage.removeItem(this.RECENT_SEARCHES_KEY);
  }
}

export const weatherService = new WeatherService();
