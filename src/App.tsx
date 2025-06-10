
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CurrentWeatherPage from "./pages/CurrentWeather";
import HourlyWeatherPage from "./pages/HourlyWeather";
import DailyWeatherPage from "./pages/DailyWeather";
import FavoritesWeatherPage from "./pages/FavoritesWeather";
import PrecipitationMap from "./pages/PrecipitationMap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LoadingProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CurrentWeatherPage />} />
              <Route path="/hourly" element={<HourlyWeatherPage />} />
              <Route path="/daily" element={<DailyWeatherPage />} />
              <Route path="/favorites" element={<FavoritesWeatherPage />} />
              <Route path="/precipitation-map" element={<PrecipitationMap />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LoadingProvider>
  </QueryClientProvider>
);

export default App;
