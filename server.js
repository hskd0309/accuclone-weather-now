
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = 'd650384a416e774338206719b4f903b3';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API key validation endpoint
app.get('/api/validate-key', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}`
    );
    const data = await response.json();
    
    if (response.ok) {
      res.json({ valid: true, message: 'API key is working' });
    } else {
      res.status(401).json({ valid: false, error: data.message });
    }
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Failed to validate API key' });
  }
});

// Routes
app.get('/api/weather', async (req, res) => {
  try {
    let lat, lon;
    
    // Check if city parameter is provided
    if (req.query.city) {
      // First get coordinates for the city
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${req.query.city}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.ok) {
        const geoError = await geoResponse.json();
        console.error('Geocoding API error:', geoError);
        return res.status(geoResponse.status).json({ error: geoError.message || 'Geocoding failed' });
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      
      lat = geoData[0].lat;
      lon = geoData[0].lon;
    } else {
      // Use provided coordinates
      lat = req.query.lat;
      lon = req.query.lon;
    }

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Weather API error:', errorData);
      return res.status(response.status).json({ error: errorData.message || 'Weather API call failed' });
    }
    
    const data = await response.json();
    
    if (!data || !data.main || !data.weather || !data.weather[0]) {
      return res.status(500).json({ error: 'Invalid weather data received' });
    }
    
    const weatherData = {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      uvIndex: 0, // UV index not available in current weather API
      visibility: data.visibility || 0,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys?.country || '',
      condition: data.weather[0].main.toLowerCase() // Add condition for theming
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Updated forecast endpoint using free 5-day forecast API
app.get('/api/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Forecast API error:', errorData);
      return res.status(response.status).json({ error: errorData.message || 'Forecast API call failed' });
    }
    
    const data = await response.json();
    
    if (!data || !data.list || !Array.isArray(data.list)) {
      return res.status(500).json({ error: 'Invalid forecast data received' });
    }
    
    // Process hourly data (next 24 hours)
    const hourly = data.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toISOString(),
      temperature: item.main?.temp || 0,
      icon: item.weather?.[0]?.icon || '01d',
      description: item.weather?.[0]?.description || 'Clear',
      humidity: item.main?.humidity || 0,
      windSpeed: item.wind?.speed || 0
    }));

    // Process daily data (group by day)
    const dailyMap = new Map();
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date: new Date(item.dt * 1000).toISOString(),
          temps: [item.main?.temp || 0],
          icon: item.weather?.[0]?.icon || '01d',
          description: item.weather?.[0]?.description || 'Clear',
          humidity: item.main?.humidity || 0,
          windSpeed: item.wind?.speed || 0
        });
      } else {
        dailyMap.get(date).temps.push(item.main?.temp || 0);
      }
    });

    const daily = Array.from(dailyMap.values()).slice(0, 7).map(day => ({
      ...day,
      minTemp: Math.min(...day.temps),
      maxTemp: Math.max(...day.temps),
      temps: undefined // Remove temps array
    }));
    
    res.json({ hourly, daily });
  } catch (error) {
    console.error('Forecast API error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Fixed OneCall API endpoint with fallback to free APIs
app.get('/api/onecall', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Try OneCall first, then fallback to forecast API
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    try {
      console.log('Attempting OneCall API...');
      const oneCallResponse = await fetch(oneCallUrl);
      const oneCallData = await oneCallResponse.json();
      
      if (oneCallResponse.ok && oneCallData.hourly && oneCallData.daily) {
        console.log('OneCall API successful');
        // Process OneCall data
        const hourly = oneCallData.hourly.slice(0, 24).map(item => ({
          time: new Date(item.dt * 1000).toISOString(),
          temperature: item.temp || 0,
          icon: item.weather?.[0]?.icon || '01d',
          description: item.weather?.[0]?.description || 'Clear',
          humidity: item.humidity || 0,
          windSpeed: item.wind_speed || 0
        }));

        const daily = oneCallData.daily.slice(0, 7).map(item => ({
          date: new Date(item.dt * 1000).toISOString(),
          minTemp: item.temp?.min || 0,
          maxTemp: item.temp?.max || 0,
          icon: item.weather?.[0]?.icon || '01d',
          description: item.weather?.[0]?.description || 'Clear',
          humidity: item.humidity || 0,
          windSpeed: item.wind_speed || 0
        }));

        return res.json({ hourly, daily });
      } else {
        console.log('OneCall API returned invalid data:', oneCallData);
      }
    } catch (oneCallError) {
      console.log('OneCall API not available, falling back to 5-day forecast:', oneCallError.message);
    }

    // Fallback to forecast API
    console.log('Using forecast API fallback...');
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.json();
      console.error('Forecast API error:', errorData);
      return res.status(forecastResponse.status).json({ error: errorData.message || 'Forecast API call failed' });
    }
    
    const forecastData = await forecastResponse.json();
    
    if (!forecastData || !forecastData.list || !Array.isArray(forecastData.list)) {
      return res.status(500).json({ error: 'Invalid forecast data received' });
    }

    // Process forecast data into hourly and daily format
    const hourly = forecastData.list.slice(0, 24).map(item => ({
      time: new Date(item.dt * 1000).toISOString(),
      temperature: item.main?.temp || 0,
      icon: item.weather?.[0]?.icon || '01d',
      description: item.weather?.[0]?.description || 'Clear',
      humidity: item.main?.humidity || 0,
      windSpeed: item.wind?.speed || 0
    }));

    // Group forecast data by day
    const dailyMap = new Map();
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date: new Date(item.dt * 1000).toISOString(),
          temps: [item.main?.temp || 0],
          icon: item.weather?.[0]?.icon || '01d',
          description: item.weather?.[0]?.description || 'Clear',
          humidity: item.main?.humidity || 0,
          windSpeed: item.wind?.speed || 0
        });
      } else {
        dailyMap.get(date).temps.push(item.main?.temp || 0);
      }
    });

    const daily = Array.from(dailyMap.values()).slice(0, 7).map(day => ({
      ...day,
      minTemp: Math.min(...day.temps),
      maxTemp: Math.max(...day.temps),
      temps: undefined
    }));

    res.json({ hourly, daily });
  } catch (error) {
    console.error('OneCall API error:', error);
    res.status(500).json({ error: 'Failed to fetch OneCall data' });
  }
});

app.get('/api/city', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Geocoding API error:', errorData);
      return res.status(response.status).json({ error: errorData.message || 'Geocoding failed' });
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const location = {
      lat: data[0].lat,
      lon: data[0].lon,
      name: `${data[0].name}, ${data[0].country}`
    };
    
    res.json(location);
  } catch (error) {
    console.error('Geocoding API error:', error);
    res.status(500).json({ error: 'Failed to search city' });
  }
});

// Enhanced historical weather data simulation
app.get('/api/historical', async (req, res) => {
  try {
    const { lat, lon, days = 7 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // Get current weather for baseline
    const currentWeather = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!currentWeather.ok) {
      const errorData = await currentWeather.json();
      console.error('Current weather API error:', errorData);
      return res.status(currentWeather.status).json({ error: errorData.message || 'Failed to get baseline weather' });
    }
    
    const current = await currentWeather.json();
    
    if (!current || !current.main) {
      return res.status(500).json({ error: 'Invalid current weather data' });
    }
    
    const historicalData = [];
    const baseTemp = current.main.temp;
    const baseHumidity = current.main.humidity;
    const baseWindSpeed = current.wind?.speed || 0;
    const basePressure = current.main.pressure;
    
    const numDays = Math.min(parseInt(days) || 7, 30); // Limit to 30 days max
    
    for (let i = numDays; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // More realistic temperature variations
      const dailyVariation = Math.sin((date.getHours() / 24) * 2 * Math.PI) * 3; // Daily cycle
      const randomVariation = (Math.random() - 0.5) * 8; // Random variation
      const seasonalVariation = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 10; // Seasonal cycle
      const weeklyTrend = Math.sin((i / 7) * Math.PI) * 2; // Weekly trend
      
      // Apply bounds checking
      const temperature = Math.max(-30, Math.min(50, 
        baseTemp + dailyVariation + randomVariation + seasonalVariation + weeklyTrend
      ));
      
      const humidity = Math.max(0, Math.min(100, 
        baseHumidity + (Math.random() - 0.5) * 30
      ));
      
      const windSpeed = Math.max(0, Math.min(50, 
        baseWindSpeed + (Math.random() - 0.5) * 10
      ));
      
      const pressure = Math.max(950, Math.min(1050, 
        basePressure + (Math.random() - 0.5) * 40
      ));
      
      historicalData.push({
        date: date.toISOString(),
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 10) / 10,
        pressure: Math.round(pressure)
      });
    }
    
    res.json(historicalData);
  } catch (error) {
    console.error('Historical API error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

app.get('/api/precipitation-tile', (req, res) => {
  const { z, x, y } = req.query;
  
  if (!z || !x || !y) {
    return res.status(400).json({ error: 'Missing tile parameters (z, x, y)' });
  }
  
  const tileUrl = `https://tile.openweathermap.org/map/precipitation_new/${z}/${x}/${y}.png?appid=${API_KEY}`;
  res.redirect(tileUrl);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on port ${PORT}`);
  console.log(`Frontend should connect to: http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /api/health - Health check');
  console.log('  GET /api/validate-key - Validate API key');
  console.log('  GET /api/weather - Current weather');
  console.log('  GET /api/forecast - 5-day forecast');
  console.log('  GET /api/onecall - OneCall with fallback');
  console.log('  GET /api/city - City search');
  console.log('  GET /api/historical - Historical data');
  console.log('  GET /api/precipitation-tile - Weather tiles');
});
