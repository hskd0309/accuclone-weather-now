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
  lat?: number;
  lon?: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface CityData {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

class WeatherService {
  private readonly LAST_CITY_KEY = 'lastSearchedCity';
  private readonly LAST_LOCATION_KEY = 'lastKnownLocation';
  private currentCoordinates: { lat: number; lon: number } | null = null;

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    
    // Store coordinates for other API calls
    this.currentCoordinates = { lat, lon };
    data.lat = lat;
    data.lon = lon;
    
    // Save location for future use
    this.saveLastLocation({ lat, lon, name: `${data.city}, ${data.country}` });
    return data;
  }

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(cityName)}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    
    // Get coordinates for this city
    try {
      const cityData = await this.searchCity(cityName);
      this.currentCoordinates = { lat: cityData.lat, lon: cityData.lon };
      data.lat = cityData.lat;
      data.lon = cityData.lon;
    } catch (error) {
      console.warn('Could not get coordinates for city:', error);
    }
    
    // Save city for future use
    this.saveLastCity(cityName);
    return data;
  }

  async getHourlyForecast(lat?: number, lon?: number): Promise<HourlyForecast[]> {
    const coords = this.getCoordinates(lat, lon);
    const response = await fetch(`${API_BASE_URL}/onecall?lat=${coords.lat}&lon=${coords.lon}`);
    if (!response.ok) throw new Error('Failed to fetch hourly forecast');
    const data = await response.json();
    return data.hourly || [];
  }

  async getDailyForecast(lat?: number, lon?: number): Promise<DailyForecast[]> {
    const coords = this.getCoordinates(lat, lon);
    const response = await fetch(`${API_BASE_URL}/onecall?lat=${coords.lat}&lon=${coords.lon}`);
    if (!response.ok) throw new Error('Failed to fetch daily forecast');
    const data = await response.json();
    return data.daily || [];
  }

  private getCoordinates(lat?: number, lon?: number): { lat: number; lon: number } {
    if (lat && lon) return { lat, lon };
    if (this.currentCoordinates) return this.currentCoordinates;
    throw new Error('No coordinates available');
  }

  async searchCity(cityName: string): Promise<CityData> {
    const response = await fetch(`${API_BASE_URL}/city?city=${encodeURIComponent(cityName)}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    return {
      name: data.name.split(',')[0],
      country: data.name.split(',')[1]?.trim() || '',
      lat: data.lat,
      lon: data.lon
    };
  }

  async getWorldCities(): Promise<CityData[]> {
    // Popular world cities for suggestions
    const cities = [
      'New York, US', 'London, GB', 'Tokyo, JP', 'Paris, FR', 'Sydney, AU',
      'Mumbai, IN', 'Berlin, DE', 'Toronto, CA', 'Moscow, RU', 'Beijing, CN',
      'Los Angeles, US', 'Chicago, US', 'Miami, US', 'Barcelona, ES', 'Amsterdam, NL',
      'Rome, IT', 'Dubai, AE', 'Singapore, SG', 'Hong Kong, HK', 'Seoul, KR',
      'Bangkok, TH', 'Istanbul, TR', 'Cairo, EG', 'São Paulo, BR', 'Mexico City, MX',
      'Buenos Aires, AR', 'Lagos, NG', 'Johannesburg, ZA', 'Chennai, IN', 'Delhi, IN',
      'Bangalore, IN', 'Kolkata, IN', 'Hyderabad, IN', 'Pune, IN', 'Ahmedabad, IN'
    ];

    return cities.map(city => {
      const [name, country] = city.split(', ');
      return {
        name,
        country,
        lat: 0, // Will be fetched when selected
        lon: 0
      };
    });
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
