
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = 'd650384a416e774338206719b4f903b3';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    
    const weatherData = {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      uvIndex: 0, // UV index not available in current weather API
      visibility: data.visibility,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys.country
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/api/onecall', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`
    );
    const data = await response.json();
    
    const processedData = {
      hourly: data.hourly.map(hour => ({
        time: new Date(hour.dt * 1000).toISOString(),
        temperature: hour.temp,
        icon: hour.weather[0].icon,
        description: hour.weather[0].description,
        humidity: hour.humidity,
        windSpeed: hour.wind_speed
      })),
      daily: data.daily.map(day => ({
        date: new Date(day.dt * 1000).toISOString(),
        minTemp: day.temp.min,
        maxTemp: day.temp.max,
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        humidity: day.humidity,
        windSpeed: day.wind_speed
      }))
    };
    
    res.json(processedData);
  } catch (error) {
    console.error('OneCall API error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

app.get('/api/city', async (req, res) => {
  try {
    const { city } = req.query;
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    const data = await response.json();
    
    if (data.length === 0) {
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

// New endpoint for historical weather data (simulated for demo)
app.get('/api/historical', async (req, res) => {
  try {
    const { lat, lon, days = 7 } = req.query;
    
    // In a real application, you would fetch actual historical data
    // For now, we'll simulate it based on current weather patterns
    const currentWeather = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const current = await currentWeather.json();
    
    const historicalData = [];
    const baseTemp = current.main.temp;
    
    for (let i = parseInt(days); i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate temperature variations
      const tempVariation = (Math.random() - 0.5) * 10;
      const seasonalVariation = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 5;
      
      historicalData.push({
        date: date.toISOString(),
        temperature: baseTemp + tempVariation + seasonalVariation,
        humidity: current.main.humidity + (Math.random() - 0.5) * 20,
        windSpeed: current.wind.speed + (Math.random() - 0.5) * 5,
        pressure: current.main.pressure + (Math.random() - 0.5) * 20
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
  const tileUrl = `https://tile.openweathermap.org/map/precipitation_new/${z}/${x}/${y}.png?appid=${API_KEY}`;
  res.redirect(tileUrl);
});

app.listen(PORT, () => {
  console.log(`Weather API server running on port ${PORT}`);
  console.log(`Frontend should connect to: http://localhost:${PORT}`);
});
