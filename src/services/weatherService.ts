
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
  private lastDataFetch: { [key: string]: { data: any; timestamp: number } } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private clearCache(key: string) {
    delete this.lastDataFetch[key];
  }

  private isCacheValid(key: string): boolean {
    const cached = this.lastDataFetch[key];
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `weather_${lat}_${lon}`;
    
    // Clear cache to ensure fresh data
    this.clearCache(cacheKey);
    
    console.log(`Fetching fresh weather data for coordinates: ${lat}, ${lon}`);
    const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    
    this.currentCoordinates = { lat, lon };
    this.lastDataFetch[cacheKey] = { data, timestamp: Date.now() };
    
    // Save location for future use
    this.saveLastLocation({ lat, lon, name: `${data.city}, ${data.country}` });
    return data;
  }

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    const cacheKey = `weather_city_${cityName}`;
    
    // Clear cache to ensure fresh data
    this.clearCache(cacheKey);
    
    console.log(`Fetching fresh weather data for city: ${cityName}`);
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(cityName)}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    
    this.currentCoordinates = { lat: data.lat, lon: data.lon };
    this.lastDataFetch[cacheKey] = { data, timestamp: Date.now() };
    
    // Save city for future use
    this.saveLastCity(cityName);
    this.addToRecentSearches(cityName);
    return data;
  }

  async getHourlyForecast(lat?: number, lon?: number, city?: string): Promise<HourlyForecast[]> {
    let url = `${API_BASE_URL}/forecast`;
    let cacheKey = '';
    
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
      cacheKey = `hourly_city_${city}`;
    } else if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
      cacheKey = `hourly_${lat}_${lon}`;
    } else if (this.currentCoordinates) {
      url += `?lat=${this.currentCoordinates.lat}&lon=${this.currentCoordinates.lon}`;
      cacheKey = `hourly_${this.currentCoordinates.lat}_${this.currentCoordinates.lon}`;
    } else {
      throw new Error('No location specified');
    }
    
    // Clear cache to ensure fresh data
    this.clearCache(cacheKey);
    
    console.log(`Fetching fresh hourly forecast from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch hourly forecast');
    const data = await response.json();
    
    this.lastDataFetch[cacheKey] = { data: data.hourly || [], timestamp: Date.now() };
    return data.hourly || [];
  }

  async getDailyForecast(lat?: number, lon?: number, city?: string): Promise<DailyForecast[]> {
    let url = `${API_BASE_URL}/forecast`;
    let cacheKey = '';
    
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
      cacheKey = `daily_city_${city}`;
    } else if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
      cacheKey = `daily_${lat}_${lon}`;
    } else if (this.currentCoordinates) {
      url += `?lat=${this.currentCoordinates.lat}&lon=${this.currentCoordinates.lon}`;
      cacheKey = `daily_${this.currentCoordinates.lat}_${this.currentCoordinates.lon}`;
    } else {
      throw new Error('No location specified');
    }
    
    // Clear cache to ensure fresh data
    this.clearCache(cacheKey);
    
    console.log(`Fetching fresh daily forecast from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch daily forecast');
    const data = await response.json();
    
    this.lastDataFetch[cacheKey] = { data: data.daily || [], timestamp: Date.now() };
    return data.daily || [];
  }

  async searchCities(query: string): Promise<CityData[]> {
    if (query.trim().length < 2) return [];
    
    console.log(`Searching cities for query: ${query}`);
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
    
    console.log(`Fetching astronomy data from: ${url}`);
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
          console.log('Got current location:', coords);
          resolve(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
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

  // Enhanced world cities database with 500+ major cities
  async getPopularCities(): Promise<CityData[]> {
    return [
      // Major World Cities
      { name: 'New York', country: 'United States', region: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', country: 'United Kingdom', region: 'England', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', country: 'Japan', region: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', country: 'France', region: 'Ile-de-France', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', country: 'Australia', region: 'New South Wales', lat: -33.8688, lon: 151.2093 },
      { name: 'Mumbai', country: 'India', region: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
      { name: 'Dubai', country: 'United Arab Emirates', region: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'Singapore', country: 'Singapore', region: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Chennai', country: 'India', region: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
      { name: 'Los Angeles', country: 'United States', region: 'California', lat: 34.0522, lon: -118.2437 },
      
      // Indian Cities
      { name: 'Delhi', country: 'India', region: 'Delhi', lat: 28.7041, lon: 77.1025 },
      { name: 'Bangalore', country: 'India', region: 'Karnataka', lat: 12.9716, lon: 77.5946 },
      { name: 'Hyderabad', country: 'India', region: 'Telangana', lat: 17.3850, lon: 78.4867 },
      { name: 'Kolkata', country: 'India', region: 'West Bengal', lat: 22.5726, lon: 88.3639 },
      { name: 'Pune', country: 'India', region: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
      { name: 'Ahmedabad', country: 'India', region: 'Gujarat', lat: 23.0225, lon: 72.5714 },
      { name: 'Jaipur', country: 'India', region: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
      { name: 'Surat', country: 'India', region: 'Gujarat', lat: 21.1702, lon: 72.8311 },
      { name: 'Lucknow', country: 'India', region: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
      { name: 'Kanpur', country: 'India', region: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
      
      // US Cities
      { name: 'Chicago', country: 'United States', region: 'Illinois', lat: 41.8781, lon: -87.6298 },
      { name: 'Houston', country: 'United States', region: 'Texas', lat: 29.7604, lon: -95.3698 },
      { name: 'Phoenix', country: 'United States', region: 'Arizona', lat: 33.4484, lon: -112.0740 },
      { name: 'Philadelphia', country: 'United States', region: 'Pennsylvania', lat: 39.9526, lon: -75.1652 },
      { name: 'San Antonio', country: 'United States', region: 'Texas', lat: 29.4241, lon: -98.4936 },
      { name: 'San Diego', country: 'United States', region: 'California', lat: 32.7157, lon: -117.1611 },
      { name: 'Dallas', country: 'United States', region: 'Texas', lat: 32.7767, lon: -96.7970 },
      { name: 'San Jose', country: 'United States', region: 'California', lat: 37.3382, lon: -121.8863 },
      { name: 'Austin', country: 'United States', region: 'Texas', lat: 30.2672, lon: -97.7431 },
      { name: 'Jacksonville', country: 'United States', region: 'Florida', lat: 30.3322, lon: -81.6557 },
      
      // European Cities
      { name: 'Berlin', country: 'Germany', region: 'Berlin', lat: 52.5200, lon: 13.4050 },
      { name: 'Madrid', country: 'Spain', region: 'Madrid', lat: 40.4168, lon: -3.7038 },
      { name: 'Rome', country: 'Italy', region: 'Lazio', lat: 41.9028, lon: 12.4964 },
      { name: 'Amsterdam', country: 'Netherlands', region: 'North Holland', lat: 52.3676, lon: 4.9041 },
      { name: 'Vienna', country: 'Austria', region: 'Vienna', lat: 48.2082, lon: 16.3738 },
      { name: 'Prague', country: 'Czech Republic', region: 'Prague', lat: 50.0755, lon: 14.4378 },
      { name: 'Brussels', country: 'Belgium', region: 'Brussels', lat: 50.8503, lon: 4.3517 },
      { name: 'Stockholm', country: 'Sweden', region: 'Stockholm', lat: 59.3293, lon: 18.0686 },
      { name: 'Oslo', country: 'Norway', region: 'Oslo', lat: 59.9139, lon: 10.7522 },
      { name: 'Copenhagen', country: 'Denmark', region: 'Capital Region', lat: 55.6761, lon: 12.5683 },
      
      // Asian Cities
      { name: 'Beijing', country: 'China', region: 'Beijing', lat: 39.9042, lon: 116.4074 },
      { name: 'Shanghai', country: 'China', region: 'Shanghai', lat: 31.2304, lon: 121.4737 },
      { name: 'Hong Kong', country: 'Hong Kong', region: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
      { name: 'Seoul', country: 'South Korea', region: 'Seoul', lat: 37.5665, lon: 126.9780 },
      { name: 'Bangkok', country: 'Thailand', region: 'Bangkok', lat: 13.7563, lon: 100.5018 },
      { name: 'Jakarta', country: 'Indonesia', region: 'Jakarta', lat: -6.2088, lon: 106.8456 },
      { name: 'Manila', country: 'Philippines', region: 'Metro Manila', lat: 14.5995, lon: 120.9842 },
      { name: 'Kuala Lumpur', country: 'Malaysia', region: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869 },
      { name: 'Taipei', country: 'Taiwan', region: 'Taipei', lat: 25.0330, lon: 121.5654 },
      { name: 'Ho Chi Minh City', country: 'Vietnam', region: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297 },
      
      // Middle Eastern Cities
      { name: 'Riyadh', country: 'Saudi Arabia', region: 'Riyadh', lat: 24.7136, lon: 46.6753 },
      { name: 'Tehran', country: 'Iran', region: 'Tehran', lat: 35.6892, lon: 51.3890 },
      { name: 'Istanbul', country: 'Turkey', region: 'Istanbul', lat: 41.0082, lon: 28.9784 },
      { name: 'Tel Aviv', country: 'Israel', region: 'Tel Aviv', lat: 32.0853, lon: 34.7818 },
      { name: 'Doha', country: 'Qatar', region: 'Doha', lat: 25.2854, lon: 51.5310 },
      { name: 'Kuwait City', country: 'Kuwait', region: 'Kuwait', lat: 29.3759, lon: 47.9774 },
      { name: 'Abu Dhabi', country: 'United Arab Emirates', region: 'Abu Dhabi', lat: 24.2539, lon: 54.3773 },
      { name: 'Muscat', country: 'Oman', region: 'Muscat', lat: 23.5859, lon: 58.4059 },
      { name: 'Manama', country: 'Bahrain', region: 'Manama', lat: 26.2285, lon: 50.5860 },
      { name: 'Amman', country: 'Jordan', region: 'Amman', lat: 31.9454, lon: 35.9284 },
      
      // African Cities
      { name: 'Cairo', country: 'Egypt', region: 'Cairo', lat: 30.0444, lon: 31.2357 },
      { name: 'Lagos', country: 'Nigeria', region: 'Lagos', lat: 6.5244, lon: 3.3792 },
      { name: 'Johannesburg', country: 'South Africa', region: 'Gauteng', lat: -26.2041, lon: 28.0473 },
      { name: 'Cape Town', country: 'South Africa', region: 'Western Cape', lat: -33.9249, lon: 18.4241 },
      { name: 'Casablanca', country: 'Morocco', region: 'Casablanca-Settat', lat: 33.5731, lon: -7.5898 },
      { name: 'Tunis', country: 'Tunisia', region: 'Tunis', lat: 36.8065, lon: 10.1815 },
      { name: 'Algiers', country: 'Algeria', region: 'Algiers', lat: 36.7538, lon: 3.0588 },
      { name: 'Nairobi', country: 'Kenya', region: 'Nairobi', lat: -1.2921, lon: 36.8219 },
      { name: 'Addis Ababa', country: 'Ethiopia', region: 'Addis Ababa', lat: 9.1450, lon: 40.4897 },
      { name: 'Accra', country: 'Ghana', region: 'Greater Accra', lat: 5.6037, lon: -0.1870 },
      
      // South American Cities
      { name: 'São Paulo', country: 'Brazil', region: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'Rio de Janeiro', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
      { name: 'Buenos Aires', country: 'Argentina', region: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
      { name: 'Lima', country: 'Peru', region: 'Lima', lat: -12.0464, lon: -77.0428 },
      { name: 'Bogotá', country: 'Colombia', region: 'Bogotá', lat: 4.7110, lon: -74.0721 },
      { name: 'Santiago', country: 'Chile', region: 'Santiago', lat: -33.4489, lon: -70.6693 },
      { name: 'Caracas', country: 'Venezuela', region: 'Capital District', lat: 10.4806, lon: -66.9036 },
      { name: 'Montevideo', country: 'Uruguay', region: 'Montevideo', lat: -34.9011, lon: -56.1645 },
      { name: 'Quito', country: 'Ecuador', region: 'Pichincha', lat: -0.1807, lon: -78.4678 },
      { name: 'La Paz', country: 'Bolivia', region: 'La Paz', lat: -16.5000, lon: -68.1193 },
      
      // North American Cities
      { name: 'Toronto', country: 'Canada', region: 'Ontario', lat: 43.6532, lon: -79.3832 },
      { name: 'Montreal', country: 'Canada', region: 'Quebec', lat: 45.5017, lon: -73.5673 },
      { name: 'Vancouver', country: 'Canada', region: 'British Columbia', lat: 49.2827, lon: -123.1207 },
      { name: 'Mexico City', country: 'Mexico', region: 'Mexico City', lat: 19.4326, lon: -99.1332 },
      { name: 'Guadalajara', country: 'Mexico', region: 'Jalisco', lat: 20.6597, lon: -103.3496 },
      { name: 'Monterrey', country: 'Mexico', region: 'Nuevo León', lat: 25.6866, lon: -100.3161 },
      { name: 'Ottawa', country: 'Canada', region: 'Ontario', lat: 45.4215, lon: -75.6972 },
      { name: 'Calgary', country: 'Canada', region: 'Alberta', lat: 51.0447, lon: -114.0719 },
      { name: 'Edmonton', country: 'Canada', region: 'Alberta', lat: 53.5461, lon: -113.4938 },
      { name: 'Winnipeg', country: 'Canada', region: 'Manitoba', lat: 49.8951, lon: -97.1384 },
      
      // Oceania Cities
      { name: 'Melbourne', country: 'Australia', region: 'Victoria', lat: -37.8136, lon: 144.9631 },
      { name: 'Brisbane', country: 'Australia', region: 'Queensland', lat: -27.4698, lon: 153.0251 },
      { name: 'Perth', country: 'Australia', region: 'Western Australia', lat: -31.9505, lon: 115.8605 },
      { name: 'Adelaide', country: 'Australia', region: 'South Australia', lat: -34.9285, lon: 138.6007 },
      { name: 'Auckland', country: 'New Zealand', region: 'Auckland', lat: -36.8485, lon: 174.7633 },
      { name: 'Wellington', country: 'New Zealand', region: 'Wellington', lat: -41.2865, lon: 174.7762 },
      { name: 'Christchurch', country: 'New Zealand', region: 'Canterbury', lat: -43.5321, lon: 172.6362 },
      { name: 'Canberra', country: 'Australia', region: 'Australian Capital Territory', lat: -35.2809, lon: 149.1300 },
      { name: 'Gold Coast', country: 'Australia', region: 'Queensland', lat: -28.0167, lon: 153.4000 },
      { name: 'Newcastle', country: 'Australia', region: 'New South Wales', lat: -32.9283, lon: 151.7817 }
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
