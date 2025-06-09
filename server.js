
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;
const WEATHER_API_KEY = '9fa9c53c0ac54f09b35163914250906';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.query) {
    console.log('Query params:', req.query);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKey: WEATHER_API_KEY ? 'configured' : 'missing'
  });
});

// API key validation endpoint
app.get('/api/validate-key', async (req, res) => {
  try {
    console.log('Validating WeatherAPI key...');
    const response = await fetch(
      `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=London&aqi=yes`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log('WeatherAPI key validation successful');
      res.json({ valid: true, message: 'WeatherAPI key is working' });
    } else {
      console.error('WeatherAPI key validation failed:', data);
      res.status(401).json({ valid: false, error: data.error?.message || 'API key invalid' });
    }
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate API key' });
  }
});

// Current weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    let query;
    
    if (req.query.city) {
      query = req.query.city;
      console.log(`Fetching weather for city: ${query}`);
    } else if (req.query.lat && req.query.lon) {
      query = `${req.query.lat},${req.query.lon}`;
      console.log(`Fetching weather for coordinates: ${query}`);
    } else {
      console.error('No city name or coordinates provided');
      return res.status(400).json({ error: 'City name or coordinates are required' });
    }

    const apiUrl = `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`;
    console.log(`Making API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('WeatherAPI error response:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Weather API call failed' 
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched weather data for: ${data.location?.name}, ${data.location?.country}`);
    
    if (!data || !data.current || !data.location) {
      console.error('Invalid weather data structure received:', data);
      return res.status(500).json({ error: 'Invalid weather data received' });
    }
    
    const weatherData = {
      temperature: data.current.temp_c,
      feelsLike: data.current.feelslike_c,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      windDirection: data.current.wind_degree,
      windDir: data.current.wind_dir,
      uvIndex: data.current.uv,
      visibility: data.current.vis_km,
      pressure: data.current.pressure_mb,
      dewPoint: data.current.dewpoint_c,
      description: data.current.condition.text,
      icon: data.current.condition.icon,
      city: data.location.name,
      country: data.location.country,
      region: data.location.region,
      condition: data.current.condition.text.toLowerCase(),
      lat: data.location.lat,
      lon: data.location.lon,
      localtime: data.location.localtime,
      // Air Quality Index
      aqi: data.current.air_quality ? {
        co: data.current.air_quality.co,
        no2: data.current.air_quality.no2,
        o3: data.current.air_quality.o3,
        so2: data.current.air_quality.so2,
        pm2_5: data.current.air_quality.pm2_5,
        pm10: data.current.air_quality.pm10,
        us_epa_index: data.current.air_quality['us-epa-index'],
        gb_defra_index: data.current.air_quality['gb-defra-index']
      } : null
    };
    
    console.log(`Sending weather response for: ${weatherData.city}, ${weatherData.country}`);
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Forecast endpoint (hourly and daily)
app.get('/api/forecast', async (req, res) => {
  try {
    let query;
    
    if (req.query.city) {
      query = req.query.city;
      console.log(`Fetching forecast for city: ${query}`);
    } else if (req.query.lat && req.query.lon) {
      query = `${req.query.lat},${req.query.lon}`;
      console.log(`Fetching forecast for coordinates: ${query}`);
    } else {
      console.error('No city name or coordinates provided for forecast');
      return res.status(400).json({ error: 'City name or coordinates are required' });
    }

    const apiUrl = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=10&aqi=yes&alerts=yes`;
    console.log(`Making forecast API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Forecast API error response:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Forecast API call failed' 
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched forecast data for: ${data.location?.name}, ${data.location?.country}`);
    
    if (!data || !data.forecast || !data.forecast.forecastday) {
      console.error('Invalid forecast data structure received:', data);
      return res.status(500).json({ error: 'Invalid forecast data received' });
    }
    
    // Process hourly data (next 24 hours)
    const hourly = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Get remaining hours from today
    const todayHours = data.forecast.forecastday[0].hour.slice(currentHour);
    todayHours.forEach(hour => {
      hourly.push({
        time: hour.time,
        temperature: hour.temp_c,
        icon: hour.condition.icon,
        description: hour.condition.text,
        humidity: hour.humidity,
        windSpeed: hour.wind_kph,
        chanceOfRain: hour.chance_of_rain,
        feelsLike: hour.feelslike_c
      });
    });
    
    // Add hours from tomorrow if needed to reach 24 hours
    if (hourly.length < 24 && data.forecast.forecastday[1]) {
      const tomorrowHours = data.forecast.forecastday[1].hour.slice(0, 24 - hourly.length);
      tomorrowHours.forEach(hour => {
        hourly.push({
          time: hour.time,
          temperature: hour.temp_c,
          icon: hour.condition.icon,
          description: hour.condition.text,
          humidity: hour.humidity,
          windSpeed: hour.wind_kph,
          chanceOfRain: hour.chance_of_rain,
          feelsLike: hour.feelslike_c
        });
      });
    }

    // Process daily data
    const daily = data.forecast.forecastday.map(day => ({
      date: day.date,
      minTemp: day.day.mintemp_c,
      maxTemp: day.day.maxtemp_c,
      icon: day.day.condition.icon,
      description: day.day.condition.text,
      humidity: day.day.avghumidity,
      windSpeed: day.day.maxwind_kph,
      chanceOfRain: day.day.daily_chance_of_rain,
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset,
      moonrise: day.astro.moonrise,
      moonset: day.astro.moonset,
      moonPhase: day.astro.moon_phase,
      uvIndex: day.day.uv
    }));
    
    const responseData = { 
      hourly: hourly.slice(0, 24), 
      daily,
      location: {
        name: data.location.name,
        country: data.location.country,
        lat: data.location.lat,
        lon: data.location.lon
      }
    };
    
    console.log(`Sending forecast response with ${responseData.hourly.length} hourly and ${responseData.daily.length} daily forecasts`);
    res.json(responseData);
  } catch (error) {
    console.error('Forecast API error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// City search/autocomplete endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    console.log(`Searching cities for query: ${q}`);
    const apiUrl = `${WEATHER_API_BASE}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Search API error response:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Search API call failed' 
      });
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} cities for query: ${q}`);
    
    const cities = data.map(city => ({
      name: city.name,
      country: city.country,
      region: city.region,
      lat: city.lat,
      lon: city.lon,
      url: city.url
    }));
    
    res.json(cities);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Failed to search cities' });
  }
});

// Astronomy data endpoint
app.get('/api/astronomy', async (req, res) => {
  try {
    let query;
    
    if (req.query.city) {
      query = req.query.city;
      console.log(`Fetching astronomy data for city: ${query}`);
    } else if (req.query.lat && req.query.lon) {
      query = `${req.query.lat},${req.query.lon}`;
      console.log(`Fetching astronomy data for coordinates: ${query}`);
    } else {
      console.error('No city name or coordinates provided for astronomy data');
      return res.status(400).json({ error: 'City name or coordinates are required' });
    }

    const apiUrl = `${WEATHER_API_BASE}/astronomy.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;
    console.log(`Making astronomy API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Astronomy API error response:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Astronomy API call failed' 
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched astronomy data`);
    
    const astronomyData = {
      sunrise: data.astronomy.astro.sunrise,
      sunset: data.astronomy.astro.sunset,
      moonrise: data.astronomy.astro.moonrise,
      moonset: data.astronomy.astro.moonset,
      moonPhase: data.astronomy.astro.moon_phase,
      moonIllumination: data.astronomy.astro.moon_illumination
    };
    
    res.json(astronomyData);
  } catch (error) {
    console.error('Astronomy API error:', error);
    res.status(500).json({ error: 'Failed to fetch astronomy data' });
  }
});

// Keep the existing precipitation tile endpoint for the radar map
app.get('/api/precipitation-tile', (req, res) => {
  const { z, x, y } = req.query;
  
  if (!z || !x || !y) {
    return res.status(400).json({ error: 'Missing tile parameters (z, x, y)' });
  }
  
  console.log(`Redirecting to precipitation tile: z=${z}, x=${x}, y=${y}`);
  // Using OpenWeatherMap for tiles since WeatherAPI doesn't provide tiles
  const tileUrl = `https://tile.openweathermap.org/map/precipitation_new/${z}/${x}/${y}.png?appid=d650384a416e774338206719b4f903b3`;
  res.redirect(tileUrl);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Endpoint not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on port ${PORT}`);
  console.log(`Using WeatherAPI.com with key: ${WEATHER_API_KEY.substring(0, 8)}...`);
  console.log('Available endpoints:');
  console.log('  GET /api/health - Health check');
  console.log('  GET /api/validate-key - Validate API key');
  console.log('  GET /api/weather - Current weather');
  console.log('  GET /api/forecast - Hourly & daily forecast');
  console.log('  GET /api/search - City search/autocomplete');
  console.log('  GET /api/astronomy - Sunrise/sunset data');
  console.log('  GET /api/precipitation-tile - Weather radar tiles');
  console.log('\nServer ready to receive requests...');
});
