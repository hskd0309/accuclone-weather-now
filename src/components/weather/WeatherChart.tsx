
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { weatherService } from '@/services/weatherService';

interface WeatherChartProps {
  location: { lat: number; lon: number };
}

const WeatherChart: React.FC<WeatherChartProps> = ({ location }) => {
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [location]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [hourly, daily] = await Promise.all([
        weatherService.getHourlyForecast(location.lat, location.lon),
        weatherService.getDailyForecast(location.lat, location.lon)
      ]);

      // Process hourly data for charts
      const processedHourly = hourly.slice(0, 12).map((item, index) => ({
        time: new Date(item.time).getHours() + ':00',
        temperature: Math.round(item.temperature),
        hour: new Date(item.time).getHours()
      }));

      // Process daily data for charts
      const processedDaily = daily.map((item, index) => ({
        day: new Date(item.date).toLocaleDateString('en', { weekday: 'short' }),
        minTemp: Math.round(item.minTemp),
        maxTemp: Math.round(item.maxTemp),
        avgTemp: Math.round((item.minTemp + item.maxTemp) / 2)
      }));

      setHourlyData(processedHourly);
      setDailyData(processedDaily);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    temperature: {
      label: "Temperature (°C)",
      color: "hsl(var(--chart-1))",
    },
    minTemp: {
      label: "Min Temp (°C)",
      color: "hsl(var(--chart-2))",
    },
    maxTemp: {
      label: "Max Temp (°C)",
      color: "hsl(var(--chart-3))",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="hourly" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="hourly">Hourly Forecast</TabsTrigger>
        <TabsTrigger value="daily">7-Day Forecast</TabsTrigger>
      </TabsList>
      
      <TabsContent value="hourly" className="mt-4">
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="var(--color-temperature)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-temperature)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </TabsContent>
      
      <TabsContent value="daily" className="mt-4">
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="minTemp" fill="var(--color-minTemp)" />
              <Bar dataKey="maxTemp" fill="var(--color-maxTemp)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </TabsContent>
    </Tabs>
  );
};

export default WeatherChart;
